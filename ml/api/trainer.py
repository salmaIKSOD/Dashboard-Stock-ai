#Entraînement des modèles = Entraînement Prophet + sauvegarde
import os
import joblib
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings("ignore")

from extractor import get_bases_actives, get_articles_by_base, extract_stock_history
from preprocessor import preprocess_for_prophet, has_enough_data

# ── Dossier de sauvegarde des modèles ────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def model_path(base_name: str, ar_ref: str, de_no: int) -> str:
    """Chemin du fichier modèle pour un article/dépôt."""
    base_dir = os.path.join(MODELS_DIR, base_name)
    os.makedirs(base_dir, exist_ok=True)
    # Nettoyer ar_ref pour nom de fichier valide
    safe_ref = ar_ref.replace("/", "_").replace("\\", "_").replace(" ", "_")
    return os.path.join(base_dir, f"{safe_ref}_depot{de_no}.pkl")


def train_prophet_model(prophet_df: pd.DataFrame) -> dict:
    """
    Entraîne un modèle Prophet sur un article/dépôt.
    Retourne le modèle + les métriques.
    """
    # Split train/test (80/20)
    split = int(len(prophet_df) * 0.8)
    train_df = prophet_df.iloc[:split]
    test_df  = prophet_df.iloc[split:]
    
    # Modèle Prophet avec saisonnalité hebdomadaire et annuelle
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode="multiplicative",   # adapté aux données de stock
        changepoint_prior_scale=0.05,        # régularisation
        interval_width=0.95                  # intervalle de confiance 95%
    )
    
    # Ajouter saisonnalité mensuelle custom
    model.add_seasonality(
        name="monthly",
        period=30.5,
        fourier_order=5
    )
    
    model.fit(train_df[["ds", "y"]])
    
    # Évaluation sur le test set
    metrics = {}
    if len(test_df) > 0:
        future_test = model.make_future_dataframe(periods=len(test_df))
        forecast_test = model.predict(future_test)
        y_pred = forecast_test.iloc[-len(test_df):]["yhat"].values
        y_true = test_df["y"].values
        
        metrics["mae"]  = round(float(mean_absolute_error(y_true, y_pred)), 4)
        metrics["rmse"] = round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4)
        metrics["mape"] = round(
            float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-9))) * 100), 2
        )
    
    return {"model": model, "metrics": metrics, "n_train": len(train_df)}


def train_all_for_base(base_name: str) -> dict:
    """
    Entraîne un modèle Prophet pour chaque article/dépôt de la base.
    Appelé automatiquement quand une nouvelle base est détectée.
    """
    print(f"\n{'='*50}")
    print(f"  Entraînement — Base : {base_name}")
    print(f"{'='*50}")
    
    articles_df = get_articles_by_base(base_name)
    
    if articles_df.empty:
        return {"status": "no_data", "base": base_name, "trained": 0}
    
    resultats = []
    skipped   = 0
    
    for _, row in articles_df.iterrows():
        ar_ref = row["AR_Ref"]
        de_no  = int(row["DE_No"])
        
        path = model_path(base_name, ar_ref, de_no)
        
        try:
            # Extraire l'historique de cet article
            df_raw = extract_stock_history(base_name, ar_ref=ar_ref, de_no=de_no)
            
            if not has_enough_data(df_raw):
                skipped += 1
                continue
            
            # Prétraitement
            prophet_df = preprocess_for_prophet(df_raw)
            
            # Entraînement
            result = train_prophet_model(prophet_df)
            
            # Sauvegarder le modèle + métadonnées
            save_data = {
                "model":    result["model"],
                "metrics":  result["metrics"],
                "ar_design":row["AR_Design"],
                "de_intitule": row["DE_Intitule"],
                "n_train":  result["n_train"],
                "base_name":base_name,
                "ar_ref":   ar_ref,
                "de_no":    de_no
            }
            joblib.dump(save_data, path)
            
            resultats.append({
                "ar_ref":  ar_ref,
                "de_no":   de_no,
                "metrics": result["metrics"],
                "status":  "ok"
            })
            
            print(f"  ✓ {ar_ref} / Dépôt {de_no} — "
                  f"MAE={result['metrics'].get('mae','?')} "
                  f"MAPE={result['metrics'].get('mape','?')}%")
        
        except Exception as e:
            print(f"  ✗ {ar_ref} / Dépôt {de_no} — Erreur : {e}")
            resultats.append({"ar_ref": ar_ref, "de_no": de_no, "status": "error", "error": str(e)})
    
    print(f"\n  → {len(resultats)} modèles entraînés, {skipped} ignorés (données insuffisantes)")
    
    return {
        "status":  "done",
        "base":    base_name,
        "trained": len([r for r in resultats if r["status"] == "ok"]),
        "skipped": skipped,
        "details": resultats
    }


def train_all_bases():
    """Entraîne toutes les bases actives — appel manuel ou planifié."""
    bases = get_bases_actives()
    results = {}
    for base in bases:
        results[base] = train_all_for_base(base)
    return results


def model_exists(base_name: str, ar_ref: str, de_no: int) -> bool:
    return os.path.exists(model_path(base_name, ar_ref, de_no))