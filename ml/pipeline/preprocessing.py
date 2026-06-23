# script converti notebook 02
# ══════════════════════════════════════════════════════════════
#  preprocessing.py — Converti depuis notebook 02
#  Lancé automatiquement par le pipeline backend
#  Ne contient PAS de graphes (matplotlib supprimé)
# ══════════════════════════════════════════════════════════════

import sys
import os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import warnings
import pandas as pd
import numpy as np
import pyodbc
import holidays as hd
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import (
    BASE_NAME, SQL_SERVER, SQL_DATABASE, SQL_UID, SQL_PWD,
    MIN_JOURS_SORTIE, OUTPUT_DIR, EXPLORE_DIR
)

GAP_JOURS   = 30
SEUIL_LIGNES = 5

def run(base_name=None):
    """
    Point d'entrée principal.
    base_name : override optionnel (sinon utilise config.py)
    """
    global BASE_NAME, OUTPUT_DIR, EXPLORE_DIR

    # if base_name:
    #     BASE_NAME   = base_name
    #     OUTPUT_DIR  = f"../../output/{BASE_NAME}/data_clean/"
    #     EXPLORE_DIR = f"../../output/{BASE_NAME}/exploration/"
    if base_name:
        BASE_NAME   = base_name
        _ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
        OUTPUT_DIR  = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'data_clean')) + os.sep
        EXPLORE_DIR = os.path.normpath(os.path.join(_ROOT, 'output', BASE_NAME, 'exploration')) + os.sep

    os.makedirs(OUTPUT_DIR,  exist_ok=True)
    os.makedirs(EXPLORE_DIR, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  PREPROCESSING — {BASE_NAME}")
    print(f"{'='*60}")

    # ── 1. Connexion SQL ──────────────────────────────────────
    print("\n[1/9] Connexion SQL Server...")
    conn = pyodbc.connect(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={SQL_SERVER};"
        f"DATABASE={SQL_DATABASE};"
        f"UID={SQL_UID};PWD={SQL_PWD};"
    )
    print(f"    ✅ Connecté — Base : {BASE_NAME}")

    # ── 2. Chargement données ─────────────────────────────────
    print("\n[2/9] Chargement des données...")

    df_mvt = pd.read_sql(f"""
        SELECT DateJour, AR_Ref, AR_Design,
               FA_CodeFamille, FA_Intitule,
               CL_No1, CL_Intitule1, CL_No2, CL_Intitule2,
               CL_No3, CL_Intitule3, CL_No4, CL_Intitule4,
               DE_No, DE_Intitule,
               TotalEntree, TotalSortie,
               ValeurEntree, ValeurSortie, TotalValeurMouvement
        FROM StockAnalytics.stock.VW_MouvementsJournaliers
        WHERE BaseName = '{BASE_NAME}'
        ORDER BY DateJour, AR_Ref, DE_No
    """, conn)
    df_mvt['DateJour'] = pd.to_datetime(df_mvt['DateJour'])

    df_stock = pd.read_sql(f"""
        SELECT DateJour, AR_Ref, AR_Design,
               FA_CodeFamille, FA_Intitule,
               CL_No1, CL_Intitule1, DE_No, DE_Intitule,
               TotalEntree, TotalSortie,
               ValeurEntree, ValeurSortie,
               StockInitial, StockFinal, ValeurInitiale, ValeurFinale
        FROM StockAnalytics.stock.StockJournalierCache
        WHERE BaseName = '{BASE_NAME}'
        ORDER BY DateJour, AR_Ref, DE_No
    """, conn)
    df_stock['DateJour'] = pd.to_datetime(df_stock['DateJour'])

    date_debut_originale = df_mvt['DateJour'].min().date()
    date_fin_originale   = df_mvt['DateJour'].max().date()
    nb_articles_initial  = df_mvt['AR_Ref'].nunique()

    print(f"    Mouvements : {len(df_mvt):,} lignes | {nb_articles_initial} articles")
    print(f"    Stock      : {len(df_stock):,} lignes")
    print(f"    Période    : {date_debut_originale} → {date_fin_originale}")

    # ── 3. Nettoyer les dates aberrantes ─────────────────────
    print("\n[3/9] Nettoyage dates aberrantes...")
    dates       = pd.Series(df_mvt['DateJour'].sort_values().unique())
    gaps_avant  = dates.diff()
    gaps_apres  = dates.diff(-1).abs()

    isolees_milieu = dates[
        (gaps_avant > pd.Timedelta(days=GAP_JOURS)) &
        (gaps_apres > pd.Timedelta(days=GAP_JOURS))
    ]
    isolee_debut = dates.iloc[[0]] if gaps_apres.iloc[0] > pd.Timedelta(days=GAP_JOURS) else pd.Series(dtype='datetime64[ns]')
    isolee_fin   = dates.iloc[[-1]] if gaps_avant.iloc[-1] > pd.Timedelta(days=GAP_JOURS) else pd.Series(dtype='datetime64[ns]')

    dates_aberrantes = pd.concat([isolee_debut, isolees_milieu, isolee_fin]).unique()

    if len(dates_aberrantes) > 0:
        dates_a_supprimer = [d for d in sorted(dates_aberrantes) if len(df_mvt[df_mvt['DateJour'] == d]) < SEUIL_LIGNES]
        if dates_a_supprimer:
            df_mvt   = df_mvt[~df_mvt['DateJour'].isin(dates_a_supprimer)]
            df_stock = df_stock[~df_stock['DateJour'].isin(dates_a_supprimer)]
            print(f"    ⚠️  {len(dates_a_supprimer)} dates supprimées")
        else:
            print("    ✅ Toutes les dates conservées")
    else:
        print("    ✅ Aucune date aberrante")

    # ── 4. Valeurs manquantes ─────────────────────────────────
    print("\n[4/9] Traitement valeurs manquantes...")
    for col in df_mvt.columns[df_mvt.isnull().any()]:
        df_mvt[col] = df_mvt[col].fillna("INCONNU" if df_mvt[col].dtype == object else 0)
    for col in df_stock.columns[df_stock.isnull().any()]:
        df_stock[col] = df_stock[col].fillna("INCONNU" if df_stock[col].dtype == object else 0)

    # ── 4b. Nettoyage universel ───────────────────────────────
    nb_avant = len(df_mvt)
    df_mvt   = df_mvt.drop_duplicates()
    df_stock = df_stock.drop_duplicates()
    df_mvt   = df_mvt[(df_mvt['TotalSortie'] >= 0) & (df_mvt['TotalEntree'] >= 0)]
    df_stock = df_stock[(df_stock['TotalSortie'] >= 0) & (df_stock['TotalEntree'] >= 0)]

    for col in ['ValeurEntree', 'ValeurSortie', 'TotalValeurMouvement']:
        if col in df_mvt.columns:
            df_mvt[col] = df_mvt[col].clip(lower=0)
    for col in ['ValeurEntree', 'ValeurSortie']:
        if col in df_stock.columns:
            df_stock[col] = df_stock[col].clip(lower=0)

    def filter_zscore(df, col, threshold=4.0):
        if col not in df.columns: return df
        grp    = df.groupby('AR_Ref')[col]
        median = grp.transform('median')
        std    = grp.transform('std').fillna(1)
        z      = ((df[col] - median) / std).abs()
        df.loc[z > threshold, col] = median[z > threshold]
        return df

    for col in ['TotalSortie', 'ValeurSortie']:
        df_mvt = filter_zscore(df_mvt, col)
    for col in ['TotalSortie', 'StockFinal']:
        df_stock = filter_zscore(df_stock, col)

    df_stock = df_stock[df_stock['AR_Ref'].isin(df_mvt['AR_Ref'].unique())]

    for col in ['AR_Design', 'FA_CodeFamille', 'FA_Intitule', 'DE_Intitule', 'CL_Intitule1', 'CL_Intitule2']:
        if col in df_mvt.columns:
            df_mvt[col] = df_mvt[col].str.replace(r'&#?\w+;', '', regex=True)
            df_mvt[col] = df_mvt[col].str.replace(r'[^\x20-\x7EÀ-ÿ]', '', regex=True)
            df_mvt[col] = df_mvt[col].str.strip().replace('', 'INCONNU').fillna('INCONNU')

    print(f"    Lignes avant : {nb_avant:,} | après : {len(df_mvt):,}")

    # ── 5. Calendrier complet ─────────────────────────────────
    # print("\n[5/9] Construction calendrier complet...")
    # date_debut = df_mvt['DateJour'].min()
    # date_fin   = df_mvt['DateJour'].max()

    # combinaisons = df_stock[['AR_Ref', 'DE_No']].drop_duplicates()
    # dfs = []
    # for _, row in combinaisons.iterrows():
    #     cal = pd.DataFrame({'DateJour': pd.date_range(date_debut, date_fin)})
    #     cal['AR_Ref'] = row['AR_Ref']
    #     cal['DE_No']  = row['DE_No']
    #     dfs.append(cal)

    # df_calendar = pd.concat(dfs, ignore_index=True)
    # df_full = df_calendar.merge(df_stock, on=['DateJour', 'AR_Ref', 'DE_No'], how='left')
    # print(f"    Lignes df_full : {len(df_full):,}")
    # ── 5. Calendrier complet ─────────────────────────────────
    print("\n[5/9] Construction calendrier complet...")
    date_debut = df_mvt['DateJour'].min()
    date_fin   = df_mvt['DateJour'].max()

    # Si StockJournalierCache vide → utiliser df_mvt comme source
    if len(df_stock) == 0:
        print("    ⚠️  StockJournalierCache vide → reconstruction depuis mouvements")
        df_stock = df_mvt[['DateJour','AR_Ref','AR_Design','FA_CodeFamille',
                            'FA_Intitule','CL_No1','CL_Intitule1','DE_No',
                            'DE_Intitule','TotalEntree','TotalSortie',
                            'ValeurEntree','ValeurSortie']].copy()
        df_stock['StockInitial']   = 0
        df_stock['StockFinal']     = 0
        df_stock['ValeurInitiale'] = 0
        df_stock['ValeurFinale']   = 0

    combinaisons = df_stock[['AR_Ref', 'DE_No']].drop_duplicates()

    if len(combinaisons) == 0:
        raise ValueError("Aucune combinaison article/dépôt trouvée — base vide")

    dfs = []
    for _, row in combinaisons.iterrows():
        cal = pd.DataFrame({'DateJour': pd.date_range(date_debut, date_fin)})
        cal['AR_Ref'] = row['AR_Ref']
        cal['DE_No']  = row['DE_No']
        dfs.append(cal)

    df_calendar = pd.concat(dfs, ignore_index=True)
    df_full = df_calendar.merge(df_stock, on=['DateJour', 'AR_Ref', 'DE_No'], how='left')
    print(f"    Lignes df_full : {len(df_full):,}")

    # ── 6. Remplir jours sans mouvement ──────────────────────
    print("\n[6/9] Remplissage jours sans mouvement...")
    df_full = df_full.sort_values(['AR_Ref', 'DE_No', 'DateJour'])
    for col in ['TotalSortie', 'TotalEntree', 'ValeurSortie', 'ValeurEntree']:
        df_full[col] = df_full[col].fillna(0)

    df_full['StockFinal'] = df_full.groupby(['AR_Ref', 'DE_No'])['StockFinal'].transform(lambda x: x.ffill())

    nb_negatifs = (df_full['StockFinal'] < 0).sum()
    if nb_negatifs > 0:
        print(f"    ⚠️  {nb_negatifs:,} stocks négatifs → remplacés par 0")
        df_full['StockFinal'] = df_full['StockFinal'].clip(lower=0)

    for col in ['AR_Design', 'FA_CodeFamille', 'FA_Intitule', 'DE_Intitule', 'CL_No1', 'CL_Intitule1', 'CL_No2', 'CL_Intitule2']:
        if col in df_full.columns:
            df_full[col] = df_full.groupby(['AR_Ref', 'DE_No'])[col].transform(lambda x: x.ffill().bfill())

    print(f"    NaN StockFinal restants : {df_full['StockFinal'].isnull().sum()}")

    # ── 7. Agrégation par article ─────────────────────────────
    # print("\n[7/9] Agrégation par article (sans dépôts)...")
    # df_total = df_full.groupby(['DateJour', 'AR_Ref']).agg(
    #     AR_Design      = ('AR_Design',      'first'),
    #     FA_CodeFamille = ('FA_CodeFamille', 'first'),
    #     FA_Intitule    = ('FA_Intitule',    'first'),
    #     TotalSortie    = ('TotalSortie',    'sum'),
    #     TotalEntree    = ('TotalEntree',    'sum'),
    #     ValeurSortie   = ('ValeurSortie',   'sum'),
    #     ValeurEntree   = ('ValeurEntree',   'sum'),
    #     StockFinal     = ('StockFinal',     'sum')
    # ).reset_index().sort_values(['AR_Ref', 'DateJour'])

    # # Filtrage articles actifs
    # jours_sortie     = df_total[df_total['TotalSortie'] > 0].groupby('AR_Ref')['DateJour'].nunique().reset_index().rename(columns={'DateJour': 'NbJoursSortie'})
    # articles_valides = jours_sortie[jours_sortie['NbJoursSortie'] >= MIN_JOURS_SORTIE]['AR_Ref'].tolist()
    # df_total         = df_total[df_total['AR_Ref'].isin(articles_valides)]
    # print(f"    Articles retenus : {len(articles_valides)} / {nb_articles_initial}")
    # ── 7. Agrégation par article ─────────────────────────────
    print("\n[7/9] Agrégation par article (sans dépôts)...")
    df_total = df_full.groupby(['DateJour', 'AR_Ref']).agg(
        AR_Design      = ('AR_Design',      'first'),
        FA_CodeFamille = ('FA_CodeFamille', 'first'),
        FA_Intitule    = ('FA_Intitule',    'first'),
        TotalSortie    = ('TotalSortie',    'sum'),
        TotalEntree    = ('TotalEntree',    'sum'),
        ValeurSortie   = ('ValeurSortie',   'sum'),
        ValeurEntree   = ('ValeurEntree',   'sum'),
        StockFinal     = ('StockFinal',     'sum')
    ).reset_index().sort_values(['AR_Ref', 'DateJour'])

    # ── Filtrage adaptatif ────────────────────────────────────
    # Si la période est courte → réduire le seuil automatiquement
    nb_jours_total = df_total['DateJour'].nunique()
    seuil_effectif = min(MIN_JOURS_SORTIE, max(5, int(nb_jours_total * 0.10)))

    if seuil_effectif < MIN_JOURS_SORTIE:
        print(f"    ⚠️  Période courte ({nb_jours_total}j) → seuil réduit : {MIN_JOURS_SORTIE}j → {seuil_effectif}j")

    jours_sortie     = df_total[df_total['TotalSortie'] > 0].groupby('AR_Ref')['DateJour'].nunique().reset_index().rename(columns={'DateJour': 'NbJoursSortie'})
    articles_valides = jours_sortie[jours_sortie['NbJoursSortie'] >= seuil_effectif]['AR_Ref'].tolist()

    # ── Sécurité : si encore vide → prendre tous les articles ─
    if len(articles_valides) == 0:
        print("    ⚠️  Aucun article valide — tous les articles retenus")
        articles_valides = df_total['AR_Ref'].unique().tolist()

    df_total = df_total[df_total['AR_Ref'].isin(articles_valides)]
    print(f"    Articles retenus : {len(articles_valides)} / {nb_articles_initial}")

    # ── 8. Features temporelles + lags ───────────────────────
    print("\n[8/9] Création features temporelles et lags...")
    df_total['jour_semaine']  = df_total['DateJour'].dt.dayofweek
    df_total['mois']          = df_total['DateJour'].dt.month
    df_total['trimestre']     = df_total['DateJour'].dt.quarter
    df_total['annee']         = df_total['DateJour'].dt.year
    df_total['is_weekend']    = (df_total['DateJour'].dt.dayofweek >= 5).astype(int)
    df_total['is_fin_mois']   = (df_total['DateJour'].dt.day >= 25).astype(int)
    df_total['is_debut_mois'] = (df_total['DateJour'].dt.day <= 5).astype(int)
    df_total['mois_label']    = df_total['DateJour'].dt.to_period('M').astype(str)

    annees = df_total['DateJour'].dt.year.unique().tolist()
    try:
        ma_holidays  = hd.Morocco(years=annees)
        jours_feries = set(pd.to_datetime(list(ma_holidays.keys())).normalize())
        df_total['is_ferie'] = df_total['DateJour'].isin(jours_feries).astype(int)
    except Exception:
        df_total['is_ferie'] = 0

    ramadan_dates = {
        2019: ('2019-05-05','2019-06-04'), 2020: ('2020-04-23','2020-05-23'),
        2021: ('2021-04-12','2021-05-11'), 2022: ('2022-04-02','2022-05-01'),
        2023: ('2023-03-22','2023-04-20'), 2024: ('2024-03-10','2024-04-08'),
        2025: ('2025-02-28','2025-03-29'), 2026: ('2026-02-17','2026-03-18'),
    }
    def is_ramadan(date, d):
        y = date.year
        if y in d:
            s, e = d[y]
            return int(pd.Timestamp(s) <= date <= pd.Timestamp(e))
        return 0
    df_total['is_ramadan'] = df_total['DateJour'].apply(lambda d: is_ramadan(d, ramadan_dates))

    df_total = df_total.sort_values(['AR_Ref', 'DateJour'])
    grp = df_total.groupby('AR_Ref')['TotalSortie']
    for lag in [1, 7, 30]:
        df_total[f'sortie_lag_{lag}'] = grp.shift(lag)
    for window in [7, 30]:
        df_total[f'rolling_mean_{window}'] = grp.transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())

    df_total['jours_avant_rupture'] = np.where(
        (df_total['rolling_mean_7'] > 0) & (df_total['StockFinal'] >= 0),
        (df_total['StockFinal'] / df_total['rolling_mean_7']).round(1),
        np.nan
    )
    df_total['jours_avant_rupture'] = df_total['jours_avant_rupture'].clip(upper=365)

    # ── 9. Construire et sauvegarder les 4 datasets ──────────
    print("\n[9/9] Sauvegarde des datasets...")

    df_prophet = df_total[[
        'DateJour','AR_Ref','AR_Design','FA_CodeFamille','FA_Intitule',
        'TotalSortie','StockFinal','jour_semaine','mois','trimestre',
        'annee','is_weekend','is_fin_mois','is_debut_mois'
    ]].rename(columns={'DateJour':'ds','TotalSortie':'y'}).copy()

    df_rf = df_total.dropna(subset=['sortie_lag_1','rolling_mean_7']).copy()

    df_iforest = df_total[[
        'DateJour','AR_Ref','TotalSortie','TotalEntree',
        'ValeurSortie','ValeurEntree','StockFinal',
        'jour_semaine','mois','trimestre'
    ]].copy()

    df_kmeans = df_total.pivot_table(
        index='AR_Ref', columns='mois_label',
        values='TotalSortie', aggfunc='sum', fill_value=0
    )
    scaler         = StandardScaler()
    df_kmeans_scaled = pd.DataFrame(
        scaler.fit_transform(df_kmeans),
        index=df_kmeans.index, columns=df_kmeans.columns
    )

    df_prophet.to_csv(      f"{OUTPUT_DIR}df_prophet.csv",      index=False)
    df_rf.to_csv(           f"{OUTPUT_DIR}df_rf.csv",           index=False)
    df_iforest.to_csv(      f"{OUTPUT_DIR}df_iforest.csv",      index=False)
    df_kmeans.to_csv(       f"{OUTPUT_DIR}df_kmeans.csv")
    df_kmeans_scaled.to_csv(f"{OUTPUT_DIR}df_kmeans_scaled.csv")

    conn.close()

    print(f"\n{'='*60}")
    print(f"  RÉSUMÉ PREPROCESSING — {BASE_NAME}")
    print(f"{'='*60}")
    print(f"  Période    : {date_debut_originale} → {date_fin_originale}")
    print(f"  Articles   : {nb_articles_initial} → {df_total['AR_Ref'].nunique()} retenus")
    print(f"  df_prophet : {len(df_prophet):,} lignes")
    print(f"  df_rf      : {len(df_rf):,} lignes")
    print(f"  df_iforest : {len(df_iforest):,} lignes")
    print(f"  df_kmeans  : {df_kmeans.shape[0]} articles × {df_kmeans.shape[1]} mois")
    print(f"  Sauvegardé : {OUTPUT_DIR}")
    print(f"{'='*60}\n")

    return True


if __name__ == "__main__":
    run()