# Prédiction = Changement modèle + prévision 
import os
import joblib
import pandas as pd
from typing import Optional

from trainer import model_path, model_exists


def predict(
    base_name: str,
    ar_ref: str,
    de_no: int,
    horizon: int = 30
) -> dict:
    """
    Charge le modèle sauvegardé et génère une prévision.
    
    Retourne :
      - historical : les 90 derniers jours réels
      - forecast   : les `horizon` prochains jours prédits
      - metrics    : MAE, RMSE, MAPE du modèle
    """
    path = model_path(base_name, ar_ref, de_no)
    
    if not os.path.exists(path):
        return {
            "status": "no_model",
            "message": f"Pas de modèle pour {base_name}/{ar_ref}/dépôt{de_no}. "
                       f"Lancez l'entraînement d'abord."
        }
    
    data   = joblib.load(path)
    model  = data["model"]
    
    # Générer les dates futures
    future = model.make_future_dataframe(periods=horizon, freq="D")
    forecast = model.predict(future)
    
    # Séparer historique et prévision
    n_hist = len(forecast) - horizon
    
    hist_df = forecast.iloc[:n_hist][["ds", "yhat", "yhat_lower", "yhat_upper"]]
    pred_df = forecast.iloc[n_hist:][["ds", "yhat", "yhat_lower", "yhat_upper"]]
    
    # Clip négatif (stock ne peut pas être négatif)
    for col in ["yhat", "yhat_lower", "yhat_upper"]:
        pred_df[col] = pred_df[col].clip(lower=0)
    
    def df_to_records(df):
        return [
            {
                "date":  row["ds"].strftime("%Y-%m-%d"),
                "valeur": round(float(row["yhat"]), 2),
                "bas":    round(float(row["yhat_lower"]), 2),
                "haut":   round(float(row["yhat_upper"]), 2)
            }
            for _, row in df.iterrows()
        ]
    
    # Alerte rupture : si le stock prédit tombe sous un seuil
    stock_moyen = float(hist_df["yhat"].mean())
    seuil_alerte = stock_moyen * 0.15   # 15% du stock moyen = alerte
    
    min_predit = float(pred_df["yhat"].min())
    alerte_rupture = min_predit < seuil_alerte
    date_rupture = None
    
    if alerte_rupture:
        date_rupture = pred_df[pred_df["yhat"] < seuil_alerte]["ds"].min()
        date_rupture = date_rupture.strftime("%Y-%m-%d") if pd.notna(date_rupture) else None
    
    return {
        "status":         "ok",
        "base_name":      base_name,
        "ar_ref":         ar_ref,
        "ar_design":      data.get("ar_design", ""),
        "de_no":          de_no,
        "de_intitule":    data.get("de_intitule", ""),
        "horizon":        horizon,
        "historique":     df_to_records(hist_df.tail(90)),  # 90 derniers jours
        "prevision":      df_to_records(pred_df),
        "metrics":        data.get("metrics", {}),
        "alerte_rupture": alerte_rupture,
        "date_rupture":   date_rupture,
        "seuil_alerte":   round(seuil_alerte, 2),
        "stock_j7":       round(float(pred_df.iloc[6]["yhat"])  if len(pred_df) > 6  else 0, 2),
        "stock_j30":      round(float(pred_df.iloc[-1]["yhat"]) if len(pred_df) > 0  else 0, 2),
    }


def list_trained_models(base_name: str) -> list:
    """Retourne la liste des articles déjà modélisés pour une base."""
    base_dir = os.path.join(
        os.path.dirname(__file__), "..", "models", base_name
    )
    if not os.path.exists(base_dir):
        return []
    
    models = []
    for f in os.listdir(base_dir):
        if f.endswith(".pkl"):
            data = joblib.load(os.path.join(base_dir, f))
            models.append({
                "ar_ref":      data.get("ar_ref", ""),
                "ar_design":   data.get("ar_design", ""),
                "de_no":       data.get("de_no", ""),
                "de_intitule": data.get("de_intitule", ""),
                "metrics":     data.get("metrics", {}),
                "n_train":     data.get("n_train", 0)
            })
    return models