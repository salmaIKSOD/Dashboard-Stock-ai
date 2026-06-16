import sys
import os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import json
import pickle
import numpy as np
import pandas as pd
import argparse

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import DATA_DIR, MODEL_DIR

def run_forecast(base_name, ar_ref, horizon=30):
    """
    Génère les prédictions pour un article donné.
    Retourne un JSON avec historique + prédiction test + futur J+30
    """
    # Chemins dynamiques
    data_dir  = f"../../output/{base_name}/data_clean/"
    model_dir = f"../../models/{base_name}/"
    model_file = os.path.join(os.path.dirname(__file__), model_dir, f"prophet_{ar_ref}.pkl")
    data_file  = os.path.join(os.path.dirname(__file__), data_dir, "df_prophet.csv")

    # Vérifications
    if not os.path.exists(model_file):
        print(json.dumps({"error": f"Modèle introuvable : prophet_{ar_ref}.pkl"}))
        return

    if not os.path.exists(data_file):
        print(json.dumps({"error": f"Données introuvables : df_prophet.csv"}))
        return

    # Charger les données
    df = pd.read_csv(data_file, parse_dates=['ds'])
    df_art = df[df['AR_Ref'] == ar_ref][['ds', 'y']].sort_values('ds').reset_index(drop=True)

    if len(df_art) < 10:
        print(json.dumps({"error": f"Pas assez de données pour {ar_ref}"}))
        return

    # Split train/test
    TEST_RATIO = 0.20
    n_test     = max(14, int(len(df_art) * TEST_RATIO))
    df_train   = df_art.iloc[:-n_test].copy()
    df_test    = df_art.iloc[-n_test:].copy()

    # Charger le modèle
    with open(model_file, 'rb') as f:
        model = pickle.load(f)

    # Re-fit avec unique_id
    df_sf              = df_train.copy()
    df_sf['unique_id'] = ar_ref
    model.fit(df_sf)

    # Prédire test + horizon futur
    forecast = model.predict(h=n_test + horizon, level=[])
    y_pred_all = np.maximum(forecast['AutoARIMA'].values, 0)

    y_pred_test  = y_pred_all[:n_test].tolist()
    y_pred_futur = y_pred_all[n_test:].tolist()

    # Dates futures
    last_date   = df_test['ds'].max()
    dates_futur = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=horizon, freq='D'
    )

    # Construire la réponse JSON
    result = {
        "ar_ref"    : ar_ref,
        "base_name" : base_name,
        "train": {
            "dates" : df_train['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "values": df_train['y'].tolist()
        },
        "test": {
            "dates"     : df_test['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "values_real": df_test['y'].tolist(),
            "values_pred": y_pred_test
        },
        "futur": {
            "dates" : dates_futur.strftime('%Y-%m-%d').tolist(),
            "values": y_pred_futur
        }
    }

    print(json.dumps(result))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--base',    required=True)
    parser.add_argument('--article', required=True)
    parser.add_argument('--horizon', type=int, default=30)
    args = parser.parse_args()

    run_forecast(args.base, args.article, args.horizon)