# # script converti notebook 03
# # ══════════════════════════════════════════════════════════════
# #  model_training.py — Converti depuis notebook 03
# #  Lancé automatiquement par le pipeline backend
# #  Graphes supprimés — uniquement CSV + modèles pkl
# # ══════════════════════════════════════════════════════════════

# import sys
# import os
# import warnings
# import pickle
# import numpy as np
# import pandas as pd
# from sklearn.ensemble import RandomForestRegressor, IsolationForest
# from sklearn.preprocessing import StandardScaler
# from sklearn.metrics import mean_absolute_error, mean_squared_error
# from sklearn.cluster import KMeans
# from sklearn.metrics import silhouette_score
# from statsforecast import StatsForecast
# from statsforecast.models import AutoARIMA

# warnings.filterwarnings('ignore')

# # ── Config ────────────────────────────────────────────────────
# sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
# from config import (
#     BASE_NAME, PARETO_SEUIL, TEST_RATIO,
#     CONTAMINATION, RF_ESTIMATORS,
#     DATA_DIR, MODEL_DIR, PERF_DIR, PLOT_DIR
# )


# def run(base_name=None):
#     """
#     Point d'entrée principal.
#     base_name : override optionnel (sinon utilise config.py)
#     """
#     global BASE_NAME, DATA_DIR, MODEL_DIR, PERF_DIR, PLOT_DIR

#     # if base_name:
#     #     BASE_NAME = base_name
#     #     DATA_DIR  = f"../../output/{BASE_NAME}/data_clean/"
#     #     MODEL_DIR = f"../../models/{BASE_NAME}/"
#     #     PERF_DIR  = f"../../output/{BASE_NAME}/performance/"
#     #     PLOT_DIR  = f"../../output/{BASE_NAME}/plots/"
#     if base_name:
#         BASE_NAME = base_name
#         _ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
#         DATA_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'data_clean')) + os.sep
#         MODEL_DIR = os.path.normpath(os.path.join(_ROOT, 'models', BASE_NAME)) + os.sep
#         PERF_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'performance')) + os.sep
#         PLOT_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'plots')) + os.sep

#     os.makedirs(MODEL_DIR, exist_ok=True)
#     os.makedirs(PERF_DIR,  exist_ok=True)
#     os.makedirs(PLOT_DIR,  exist_ok=True)

#     print(f"\n{'='*60}")
#     print(f"  MODEL TRAINING — {BASE_NAME}")
#     print(f"{'='*60}")

#     # ── 1. Chargement datasets ────────────────────────────────
#     print("\n[1/4] Chargement des datasets...")
#     df_prophet = pd.read_csv(f"{DATA_DIR}df_prophet.csv",  parse_dates=['ds'])
#     df_rf      = pd.read_csv(f"{DATA_DIR}df_rf.csv",       parse_dates=['DateJour'])
#     df_iforest = pd.read_csv(f"{DATA_DIR}df_iforest.csv",  parse_dates=['DateJour'])
#     df_kmeans  = pd.read_csv(f"{DATA_DIR}df_kmeans.csv",   index_col=0)

#     print(f"    df_prophet : {len(df_prophet):,} lignes | {df_prophet['AR_Ref'].nunique()} articles")
#     print(f"    df_rf      : {len(df_rf):,} lignes")
#     print(f"    df_iforest : {len(df_iforest):,} lignes")
#     print(f"    df_kmeans  : {df_kmeans.shape[0]} articles × {df_kmeans.shape[1]} mois")

#     # ── 2. AutoARIMA — Prévision sorties ─────────────────────
#     print(f"\n[2/4] AutoARIMA — Prévision sorties (Pareto {PARETO_SEUIL*100:.0f}%)...")

#     by_article   = df_prophet.groupby('AR_Ref')['y'].sum().sort_values(ascending=False)
#     cumul_pct    = by_article.cumsum() / by_article.sum()
#     top_articles = cumul_pct[cumul_pct <= PARETO_SEUIL].index.tolist()
#     if len(top_articles) < len(cumul_pct):
#         top_articles.append(cumul_pct.index[len(top_articles)])

#     print(f"    Articles sélectionnés : {len(top_articles)} / {df_prophet['AR_Ref'].nunique()}")

#     resultats_arima = []

#     for ar_ref in top_articles:
#         df_art = df_prophet[df_prophet['AR_Ref'] == ar_ref][['ds', 'y']].copy()
#         df_art = df_art.sort_values('ds').reset_index(drop=True)

#         if len(df_art) < 60:
#             print(f"    {ar_ref:15s} | ⚠️  Pas assez de données — ignoré")
#             continue

#         n_test   = max(30, int(len(df_art) * TEST_RATIO))
#         df_train = df_art.iloc[:-n_test].copy()
#         df_test  = df_art.iloc[-n_test:].copy()

#         df_sf              = df_train.copy()
#         df_sf['unique_id'] = ar_ref

#         model = StatsForecast(
#             models=[AutoARIMA(season_length=7, approximation=True)],
#             freq='D', n_jobs=1
#         )
#         model.fit(df_sf)

#         forecast = model.predict(h=n_test)
#         y_true   = df_test['y'].values
#         y_pred   = np.maximum(forecast['AutoARIMA'].values, 0)

#         mae  = mean_absolute_error(y_true, y_pred)
#         rmse = np.sqrt(mean_squared_error(y_true, y_pred))
#         mask = y_true > 0
#         mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100 if mask.sum() > 0 else np.nan

#         resultats_arima.append({
#             'AR_Ref'  : ar_ref,
#             'MAE'     : round(mae, 2),
#             'RMSE'    : round(rmse, 2),
#             'MAPE'    : round(mape, 2) if not np.isnan(mape) else np.nan,
#             'nb_train': len(df_train),
#             'nb_test' : n_test
#         })

#         with open(f"{MODEL_DIR}prophet_{ar_ref}.pkl", 'wb') as f:
#             pickle.dump(model, f)

#         mape_str = f"{mape:.1f}%" if not np.isnan(mape) else "N/A"
#         print(f"    {ar_ref:15s} | MAE={mae:.1f} | RMSE={rmse:.1f} | MAPE={mape_str}")

#     df_perf_prophet = pd.DataFrame(resultats_arima)
#     df_perf_prophet.to_csv(f"{PERF_DIR}perf_prophet.csv", index=False)

#     mape_moy = df_perf_prophet['MAPE'].dropna().mean()
#     print(f"\n    ✅ {len(df_perf_prophet)} modèles entraînés")
#     print(f"    MAE moyen  : {df_perf_prophet['MAE'].mean():.1f}")
#     print(f"    MAPE moyen : {mape_moy:.1f}%" if not np.isnan(mape_moy) else "    MAPE moyen : N/A")

#     # ── 3. Random Forest — Jours avant rupture ───────────────
#     print(f"\n[3/4] Random Forest — Jours avant rupture...")

#     features_voulues = [
#         'sortie_lag_1', 'sortie_lag_7', 'sortie_lag_30',
#         'rolling_mean_7', 'rolling_mean_30',
#         'StockFinal', 'jour_semaine', 'mois', 'trimestre'
#     ]
#     features_rf = [col for col in features_voulues if col in df_rf.columns]
#     target_rf   = 'jours_avant_rupture'

#     df_rf_clean = df_rf.dropna(subset=[target_rf] + features_rf).copy()
#     df_rf_clean = df_rf_clean.sort_values('DateJour').reset_index(drop=True)

#     cutoff_idx = int(len(df_rf_clean) * (1 - TEST_RATIO))
#     train_rf   = df_rf_clean.iloc[:cutoff_idx]
#     test_rf    = df_rf_clean.iloc[cutoff_idx:]

#     X_train, y_train = train_rf[features_rf], train_rf[target_rf]
#     X_test,  y_test  = test_rf[features_rf],  test_rf[target_rf]

#     rf_model = RandomForestRegressor(n_estimators=RF_ESTIMATORS, random_state=42, n_jobs=-1)
#     rf_model.fit(X_train, y_train)

#     y_pred_rf = rf_model.predict(X_test)
#     mae_rf    = mean_absolute_error(y_test, y_pred_rf)
#     rmse_rf   = np.sqrt(mean_squared_error(y_test, y_pred_rf))

#     with open(f"{MODEL_DIR}rf_rupture.pkl", 'wb') as f:
#         pickle.dump({'model': rf_model, 'features': features_rf}, f)

#     # Sauvegarde feature importance
#     importances = pd.Series(rf_model.feature_importances_, index=features_rf).sort_values(ascending=False)
#     importances.reset_index().rename(columns={'index': 'feature', 0: 'importance'}).to_csv(
#         f"{PERF_DIR}rf_feature_importance.csv", index=False
#     )

#     # Sauvegarde jours_avant_rupture par article (dernière valeur)
#     df_rupture = df_rf_clean.sort_values('DateJour').groupby('AR_Ref').last().reset_index()
#     df_rupture['jours_estimes'] = rf_model.predict(df_rupture[features_rf]).round(1)
#     df_rupture[['AR_Ref', 'jours_avant_rupture', 'jours_estimes', 'StockFinal', 'rolling_mean_7']].to_csv(
#         f"{PERF_DIR}perf_rf.csv", index=False
#     )

#     pd.DataFrame([{
#         'model': 'RandomForest', 'MAE': round(mae_rf, 2), 'RMSE': round(rmse_rf, 2),
#         'nb_train': len(train_rf), 'nb_test': len(test_rf)
#     }]).to_csv(f"{PERF_DIR}perf_rf_summary.csv", index=False)

#     print(f"    ✅ MAE={mae_rf:.1f}j | RMSE={rmse_rf:.1f}j")
#     print(f"    Features : {features_rf}")

#     # ── 4a. Isolation Forest — Anomalies ─────────────────────
#     print(f"\n[4/4] Isolation Forest + K-Means...")

#     features_voulues_if = [
#         'TotalEntree', 'TotalSortie', 'ValeurEntree', 'ValeurSortie',
#         'StockFinal', 'jour_semaine', 'mois'
#     ]
#     features_if = [col for col in features_voulues_if if col in df_iforest.columns]

#     X_if      = df_iforest[features_if].fillna(0)
#     scaler_if = StandardScaler()
#     X_if_s    = scaler_if.fit_transform(X_if)

#     iforest = IsolationForest(contamination=CONTAMINATION, random_state=42, n_jobs=-1)
#     iforest.fit(X_if_s)

#     df_iforest['anomaly_score'] = iforest.decision_function(X_if_s)
#     df_iforest['is_anomalie']   = iforest.predict(X_if_s)
#     df_iforest['is_anomalie']   = df_iforest['is_anomalie'].map({1: 0, -1: 1})

#     nb_anomalies = df_iforest['is_anomalie'].sum()

#     with open(f"{MODEL_DIR}iforest_anomalies.pkl", 'wb') as f:
#         pickle.dump({'model': iforest, 'scaler': scaler_if, 'features': features_if}, f)

#     df_iforest.to_csv(f"{PERF_DIR}perf_iforest.csv", index=False)

#     pd.DataFrame([{
#         'model': 'IsolationForest',
#         'contamination': CONTAMINATION,
#         'nb_anomalies': int(nb_anomalies),
#         'pct_anomalies': round(nb_anomalies / len(df_iforest) * 100, 2)
#     }]).to_csv(f"{PERF_DIR}perf_iforest_summary.csv", index=False)

#     print(f"    ✅ Isolation Forest : {int(nb_anomalies)} anomalies ({nb_anomalies/len(df_iforest)*100:.1f}%)")

#     # ── 4b. K-Means — Segmentation ───────────────────────────
#     scaler_km = StandardScaler()
#     X_km      = scaler_km.fit_transform(df_kmeans.fillna(0))

#     k_range     = range(2, min(11, len(df_kmeans)))
#     silhouettes = []
#     inertias    = []

#     for k in k_range:
#         km   = KMeans(n_clusters=k, random_state=42, n_init=10)
#         labs = km.fit_predict(X_km)
#         inertias.append(km.inertia_)
#         silhouettes.append(silhouette_score(X_km, labs))

#     k_optimal = list(k_range)[silhouettes.index(max(silhouettes))]

#     km_final = KMeans(n_clusters=k_optimal, random_state=42, n_init=10)
#     labels   = km_final.fit_predict(X_km)

#     df_kmeans_result            = df_kmeans.copy()
#     df_kmeans_result['cluster'] = labels

#     cols_mois = [col for col in df_kmeans_result.columns if col != 'cluster']
#     sortie_par_cluster = df_kmeans_result.groupby('cluster')[cols_mois].mean().sum(axis=1).sort_values(ascending=False)
#     cluster_rank       = sortie_par_cluster.index.tolist()
#     noms_disponibles   = ['forte rotation', 'rotation moyenne', 'faible rotation', 'quasi-immobile']
#     noms_clusters      = {
#         cluster: noms_disponibles[i] if i < len(noms_disponibles) else f'cluster_{i}'
#         for i, cluster in enumerate(cluster_rank)
#     }
#     df_kmeans_result['segment'] = df_kmeans_result['cluster'].map(noms_clusters)

#     with open(f"{MODEL_DIR}kmeans_segments.pkl", 'wb') as f:
#         pickle.dump({'model': km_final, 'scaler': scaler_km, 'noms_clusters': noms_clusters}, f)

#     # Tableau détaillé articles × segment
#     cols_mois2   = [col for col in df_kmeans_result.columns if col not in ['cluster', 'segment']]
#     tableau      = df_kmeans_result.groupby('segment')[cols_mois2].mean().sum(axis=1).reset_index()
#     tableau.columns = ['Segment', 'TotalSortie_moyen']
#     tableau['Nb_articles'] = df_kmeans_result.groupby('segment').size().values
#     tableau = tableau.sort_values('TotalSortie_moyen', ascending=False)
#     tableau.to_csv(f"{PERF_DIR}kmeans_tableau_clusters.csv", index=False)

#     # Liste articles avec segment
#     df_articles_segments = df_kmeans_result[['cluster', 'segment']].reset_index()
#     df_articles_segments.columns = ['AR_Ref', 'cluster', 'segment']
#     df_articles_segments.to_csv(f"{PERF_DIR}kmeans_articles_segments.csv", index=False)

#     pd.DataFrame([{
#         'model': 'KMeans', 'k_optimal': k_optimal,
#         'silhouette': round(max(silhouettes), 3)
#     }]).to_csv(f"{PERF_DIR}perf_kmeans_summary.csv", index=False)

#     print(f"    ✅ K-Means : k={k_optimal} | segments={list(noms_clusters.values())}")

#     # ── Résumé final ──────────────────────────────────────────
#     print(f"\n{'='*60}")
#     print(f"  RÉSUMÉ ENTRAÎNEMENT — {BASE_NAME}")
#     print(f"{'='*60}")
#     print(f"  AutoARIMA    : {len(df_perf_prophet)} articles | MAE={df_perf_prophet['MAE'].mean():.1f}")
#     print(f"  RandomForest : MAE={mae_rf:.1f}j | RMSE={rmse_rf:.1f}j")
#     print(f"  IsolationF.  : {int(nb_anomalies)} anomalies ({nb_anomalies/len(df_iforest)*100:.1f}%)")
#     print(f"  K-Means      : k={k_optimal} | {list(noms_clusters.values())}")
#     print(f"  Modèles      : {MODEL_DIR}")
#     print(f"  Performances : {PERF_DIR}")
#     print(f"{'='*60}\n")

#     return True


# if __name__ == "__main__":
#     run()


# script converti notebook 03
# ══════════════════════════════════════════════════════════════
#  model_training.py — Converti depuis notebook 03
#  Lancé automatiquement par le pipeline backend
#  Graphes supprimés — uniquement CSV + modèles pkl
# ══════════════════════════════════════════════════════════════

import sys
import os
import warnings
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import (
    BASE_NAME, PARETO_SEUIL, TEST_RATIO,
    CONTAMINATION, RF_ESTIMATORS,
    DATA_DIR, MODEL_DIR, PERF_DIR, PLOT_DIR
)


def run(base_name=None):
    """
    Point d'entrée principal.
    base_name : override optionnel (sinon utilise config.py)
    """
    global BASE_NAME, DATA_DIR, MODEL_DIR, PERF_DIR, PLOT_DIR

    if base_name:
        BASE_NAME = base_name
        _ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
        DATA_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'data_clean')) + os.sep
        MODEL_DIR = os.path.normpath(os.path.join(_ROOT, 'models', BASE_NAME)) + os.sep
        PERF_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'performance')) + os.sep
        PLOT_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'plots')) + os.sep

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(PERF_DIR,  exist_ok=True)
    os.makedirs(PLOT_DIR,  exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  MODEL TRAINING — {BASE_NAME}")
    print(f"{'='*60}")

    # ── 1. Chargement datasets ────────────────────────────────
    print("\n[1/4] Chargement des datasets...")
    df_prophet = pd.read_csv(f"{DATA_DIR}df_prophet.csv",  parse_dates=['ds'])
    df_rf      = pd.read_csv(f"{DATA_DIR}df_rf.csv",       parse_dates=['DateJour'])
    df_iforest = pd.read_csv(f"{DATA_DIR}df_iforest.csv",  parse_dates=['DateJour'])
    df_kmeans  = pd.read_csv(f"{DATA_DIR}df_kmeans.csv",   index_col=0)

    print(f"    df_prophet : {len(df_prophet):,} lignes | {df_prophet['AR_Ref'].nunique()} articles")
    print(f"    df_rf      : {len(df_rf):,} lignes")
    print(f"    df_iforest : {len(df_iforest):,} lignes")
    print(f"    df_kmeans  : {df_kmeans.shape[0]} articles × {df_kmeans.shape[1]} mois")

    # ── Table de correspondance AR_Ref → AR_Design ────────────
    # Utilisée pour enrichir tous les exports finaux avec le nom de l'article
    noms_articles = df_prophet[['AR_Ref', 'AR_Design']].drop_duplicates('AR_Ref')

    # ── 2. AutoARIMA — Prévision sorties ─────────────────────
    print(f"\n[2/4] AutoARIMA — Prévision sorties (Pareto {PARETO_SEUIL*100:.0f}%)...")

    by_article   = df_prophet.groupby('AR_Ref')['y'].sum().sort_values(ascending=False)
    cumul_pct    = by_article.cumsum() / by_article.sum()
    top_articles = cumul_pct[cumul_pct <= PARETO_SEUIL].index.tolist()
    if len(top_articles) < len(cumul_pct):
        top_articles.append(cumul_pct.index[len(top_articles)])

    print(f"    Articles sélectionnés : {len(top_articles)} / {df_prophet['AR_Ref'].nunique()}")

    resultats_arima = []

    for ar_ref in top_articles:
        df_art = df_prophet[df_prophet['AR_Ref'] == ar_ref][['ds', 'y']].copy()
        df_art = df_art.sort_values('ds').reset_index(drop=True)

        if len(df_art) < 60:
            print(f"    {ar_ref:15s} | ⚠️  Pas assez de données — ignoré")
            continue

        n_test   = max(30, int(len(df_art) * TEST_RATIO))
        df_train = df_art.iloc[:-n_test].copy()
        df_test  = df_art.iloc[-n_test:].copy()

        df_sf              = df_train.copy()
        df_sf['unique_id'] = ar_ref

        model = StatsForecast(
            models=[AutoARIMA(season_length=7, approximation=True)],
            freq='D', n_jobs=1
        )
        model.fit(df_sf)

        forecast = model.predict(h=n_test)
        y_true   = df_test['y'].values
        y_pred   = np.maximum(forecast['AutoARIMA'].values, 0)

        mae  = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mask = y_true > 0
        mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100 if mask.sum() > 0 else np.nan

        resultats_arima.append({
            'AR_Ref'  : ar_ref,
            'MAE'     : round(mae, 2),
            'RMSE'    : round(rmse, 2),
            'MAPE'    : round(mape, 2) if not np.isnan(mape) else np.nan,
            'nb_train': len(df_train),
            'nb_test' : n_test
        })

        with open(f"{MODEL_DIR}prophet_{ar_ref}.pkl", 'wb') as f:
            pickle.dump(model, f)

        mape_str = f"{mape:.1f}%" if not np.isnan(mape) else "N/A"
        print(f"    {ar_ref:15s} | MAE={mae:.1f} | RMSE={rmse:.1f} | MAPE={mape_str}")

    df_perf_prophet = pd.DataFrame(resultats_arima)

    # ── AJOUT : nom (désignation) de l'article ────────────────
    df_perf_prophet = df_perf_prophet.merge(noms_articles, on='AR_Ref', how='left')
    df_perf_prophet['AR_Design'] = df_perf_prophet['AR_Design'].fillna('—')
    # Réordonner pour mettre AR_Design juste après AR_Ref
    cols_order = ['AR_Ref', 'AR_Design'] + [c for c in df_perf_prophet.columns if c not in ('AR_Ref', 'AR_Design')]
    df_perf_prophet = df_perf_prophet[cols_order]

    df_perf_prophet.to_csv(f"{PERF_DIR}perf_prophet.csv", index=False)

    mape_moy = df_perf_prophet['MAPE'].dropna().mean()
    print(f"\n    ✅ {len(df_perf_prophet)} modèles entraînés")
    print(f"    MAE moyen  : {df_perf_prophet['MAE'].mean():.1f}")
    print(f"    MAPE moyen : {mape_moy:.1f}%" if not np.isnan(mape_moy) else "    MAPE moyen : N/A")

    # ── 3. Random Forest — Jours avant rupture ───────────────
    print(f"\n[3/4] Random Forest — Jours avant rupture...")

    features_voulues = [
        'sortie_lag_1', 'sortie_lag_7', 'sortie_lag_30',
        'rolling_mean_7', 'rolling_mean_30',
        'StockFinal', 'jour_semaine', 'mois', 'trimestre'
    ]
    features_rf = [col for col in features_voulues if col in df_rf.columns]
    target_rf   = 'jours_avant_rupture'

    df_rf_clean = df_rf.dropna(subset=[target_rf] + features_rf).copy()
    df_rf_clean = df_rf_clean.sort_values('DateJour').reset_index(drop=True)

    cutoff_idx = int(len(df_rf_clean) * (1 - TEST_RATIO))
    train_rf   = df_rf_clean.iloc[:cutoff_idx]
    test_rf    = df_rf_clean.iloc[cutoff_idx:]

    X_train, y_train = train_rf[features_rf], train_rf[target_rf]
    X_test,  y_test  = test_rf[features_rf],  test_rf[target_rf]

    rf_model = RandomForestRegressor(n_estimators=RF_ESTIMATORS, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)

    y_pred_rf = rf_model.predict(X_test)
    mae_rf    = mean_absolute_error(y_test, y_pred_rf)
    rmse_rf   = np.sqrt(mean_squared_error(y_test, y_pred_rf))

    with open(f"{MODEL_DIR}rf_rupture.pkl", 'wb') as f:
        pickle.dump({'model': rf_model, 'features': features_rf}, f)

    # Sauvegarde feature importance
    importances = pd.Series(rf_model.feature_importances_, index=features_rf).sort_values(ascending=False)
    importances.reset_index().rename(columns={'index': 'feature', 0: 'importance'}).to_csv(
        f"{PERF_DIR}rf_feature_importance.csv", index=False
    )

    # Sauvegarde jours_avant_rupture par article (dernière valeur)
    df_rupture = df_rf_clean.sort_values('DateJour').groupby('AR_Ref').last().reset_index()
    df_rupture['jours_estimes'] = rf_model.predict(df_rupture[features_rf]).round(1)

    # ── AJOUT : nom (désignation) de l'article ────────────────
    # df_rupture vient déjà de df_rf qui contient AR_Design — pas besoin de merge
    cols_export_rf = ['AR_Ref', 'AR_Design', 'jours_avant_rupture', 'jours_estimes', 'StockFinal', 'rolling_mean_7']
    cols_export_rf = [c for c in cols_export_rf if c in df_rupture.columns]
    df_rupture[cols_export_rf].to_csv(f"{PERF_DIR}perf_rf.csv", index=False)

    pd.DataFrame([{
        'model': 'RandomForest', 'MAE': round(mae_rf, 2), 'RMSE': round(rmse_rf, 2),
        'nb_train': len(train_rf), 'nb_test': len(test_rf)
    }]).to_csv(f"{PERF_DIR}perf_rf_summary.csv", index=False)

    print(f"    ✅ MAE={mae_rf:.1f}j | RMSE={rmse_rf:.1f}j")
    print(f"    Features : {features_rf}")

    # ── 4a. Isolation Forest — Anomalies ─────────────────────
    print(f"\n[4/4] Isolation Forest + K-Means...")

    features_voulues_if = [
        'TotalEntree', 'TotalSortie', 'ValeurEntree', 'ValeurSortie',
        'StockFinal', 'jour_semaine', 'mois'
    ]
    features_if = [col for col in features_voulues_if if col in df_iforest.columns]

    X_if      = df_iforest[features_if].fillna(0)
    scaler_if = StandardScaler()
    X_if_s    = scaler_if.fit_transform(X_if)

    iforest = IsolationForest(contamination=CONTAMINATION, random_state=42, n_jobs=-1)
    iforest.fit(X_if_s)

    df_iforest['anomaly_score'] = iforest.decision_function(X_if_s)
    df_iforest['is_anomalie']   = iforest.predict(X_if_s)
    df_iforest['is_anomalie']   = df_iforest['is_anomalie'].map({1: 0, -1: 1})

    nb_anomalies = df_iforest['is_anomalie'].sum()

    with open(f"{MODEL_DIR}iforest_anomalies.pkl", 'wb') as f:
        pickle.dump({'model': iforest, 'scaler': scaler_if, 'features': features_if}, f)

    # ── AJOUT : nom (désignation) de l'article ────────────────
    df_iforest_export = df_iforest.merge(noms_articles, on='AR_Ref', how='left')
    df_iforest_export['AR_Design'] = df_iforest_export['AR_Design'].fillna('—')
    cols_order_if = ['AR_Ref', 'AR_Design'] + [c for c in df_iforest_export.columns if c not in ('AR_Ref', 'AR_Design')]
    df_iforest_export = df_iforest_export[cols_order_if]

    df_iforest_export.to_csv(f"{PERF_DIR}perf_iforest.csv", index=False)

    pd.DataFrame([{
        'model': 'IsolationForest',
        'contamination': CONTAMINATION,
        'nb_anomalies': int(nb_anomalies),
        'pct_anomalies': round(nb_anomalies / len(df_iforest) * 100, 2)
    }]).to_csv(f"{PERF_DIR}perf_iforest_summary.csv", index=False)

    print(f"    ✅ Isolation Forest : {int(nb_anomalies)} anomalies ({nb_anomalies/len(df_iforest)*100:.1f}%)")

    # ── 4b. K-Means — Segmentation ───────────────────────────
    scaler_km = StandardScaler()
    X_km      = scaler_km.fit_transform(df_kmeans.fillna(0))

    k_range     = range(2, min(11, len(df_kmeans)))
    silhouettes = []
    inertias    = []

    for k in k_range:
        km   = KMeans(n_clusters=k, random_state=42, n_init=10)
        labs = km.fit_predict(X_km)
        inertias.append(km.inertia_)
        silhouettes.append(silhouette_score(X_km, labs))

    k_optimal = list(k_range)[silhouettes.index(max(silhouettes))]

    km_final = KMeans(n_clusters=k_optimal, random_state=42, n_init=10)
    labels   = km_final.fit_predict(X_km)

    df_kmeans_result            = df_kmeans.copy()
    df_kmeans_result['cluster'] = labels

    cols_mois = [col for col in df_kmeans_result.columns if col != 'cluster']
    sortie_par_cluster = df_kmeans_result.groupby('cluster')[cols_mois].mean().sum(axis=1).sort_values(ascending=False)
    cluster_rank       = sortie_par_cluster.index.tolist()
    noms_disponibles   = ['forte rotation', 'rotation moyenne', 'faible rotation', 'quasi-immobile']
    noms_clusters      = {
        cluster: noms_disponibles[i] if i < len(noms_disponibles) else f'cluster_{i}'
        for i, cluster in enumerate(cluster_rank)
    }
    df_kmeans_result['segment'] = df_kmeans_result['cluster'].map(noms_clusters)

    with open(f"{MODEL_DIR}kmeans_segments.pkl", 'wb') as f:
        pickle.dump({'model': km_final, 'scaler': scaler_km, 'noms_clusters': noms_clusters}, f)

    # Tableau détaillé articles × segment
    cols_mois2   = [col for col in df_kmeans_result.columns if col not in ['cluster', 'segment']]
    tableau      = df_kmeans_result.groupby('segment')[cols_mois2].mean().sum(axis=1).reset_index()
    tableau.columns = ['Segment', 'TotalSortie_moyen']
    tableau['Nb_articles'] = df_kmeans_result.groupby('segment').size().values
    tableau = tableau.sort_values('TotalSortie_moyen', ascending=False)
    tableau.to_csv(f"{PERF_DIR}kmeans_tableau_clusters.csv", index=False)

    # Liste articles avec segment
    df_articles_segments = df_kmeans_result[['cluster', 'segment']].reset_index()
    df_articles_segments.columns = ['AR_Ref', 'cluster', 'segment']

    # ── AJOUT : nom (désignation) de l'article ────────────────
    df_articles_segments = df_articles_segments.merge(noms_articles, on='AR_Ref', how='left')
    df_articles_segments['AR_Design'] = df_articles_segments['AR_Design'].fillna('—')
    cols_order_seg = ['AR_Ref', 'AR_Design', 'cluster', 'segment']
    df_articles_segments = df_articles_segments[cols_order_seg]

    df_articles_segments.to_csv(f"{PERF_DIR}kmeans_articles_segments.csv", index=False)

    pd.DataFrame([{
        'model': 'KMeans', 'k_optimal': k_optimal,
        'silhouette': round(max(silhouettes), 3)
    }]).to_csv(f"{PERF_DIR}perf_kmeans_summary.csv", index=False)

    print(f"    ✅ K-Means : k={k_optimal} | segments={list(noms_clusters.values())}")

    # ── Résumé final ──────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  RÉSUMÉ ENTRAÎNEMENT — {BASE_NAME}")
    print(f"{'='*60}")
    print(f"  AutoARIMA    : {len(df_perf_prophet)} articles | MAE={df_perf_prophet['MAE'].mean():.1f}")
    print(f"  RandomForest : MAE={mae_rf:.1f}j | RMSE={rmse_rf:.1f}j")
    print(f"  IsolationF.  : {int(nb_anomalies)} anomalies ({nb_anomalies/len(df_iforest)*100:.1f}%)")
    print(f"  K-Means      : k={k_optimal} | {list(noms_clusters.values())}")
    print(f"  Modèles      : {MODEL_DIR}")
    print(f"  Performances : {PERF_DIR}")
    print(f"{'='*60}\n")

    return True


if __name__ == "__main__":
    run()