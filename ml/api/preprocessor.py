#  Prétraitement = Nettoyage + features 
import pandas as pd
import numpy as np 

def preprocess_for_prophet(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prépare un DataFrame (1 article + 1 dépôt) pour Prophet.
    
    Prophet attend : ds (datetime) | y (valeur à prédire)
    On prédit le StockFinal et aussi les Sorties.
    """
    df = df.copy().sort_values("DateJour")
    
    # Combler les jours manquants avec le dernier stock connu
    date_range = pd.date_range(
        start=df["DateJour"].min(),
        end=df["DateJour"].max(),
        freq="D"
    )
    df = df.set_index("DateJour").reindex(date_range)
    df.index.name = "DateJour"
    df = df.reset_index()
    
    # Forward fill pour les jours sans mouvement (stock reporté)
    df["StockFinal"]  = df["StockFinal"].ffill().fillna(0)
    df["ValeurFinale"]= df["ValeurFinale"].ffill().fillna(0)
    df["TotalSortie"] = df["TotalSortie"].fillna(0)
    df["TotalEntree"] = df["TotalEntree"].fillna(0)
    
    # Format Prophet
    prophet_df = pd.DataFrame({
        "ds": df["DateJour"],
        "y":  df["StockFinal"],          # cible principale
        "sortie": df["TotalSortie"],      # pour modèle sorties
        "entree": df["TotalEntree"]
    })
    
    # Supprimer valeurs aberrantes (stock négatif → 0)
    prophet_df["y"] = prophet_df["y"].clip(lower=0)
    
    return prophet_df

def add_features_for_lgbm(df: pd.DataFrame) -> pd.DataFrame:
    """
    Ajoute des features temporelles et lag pour LightGBM.
    Utilisé si on veut comparer avec un modèle gradient boosting.
    """
    df = df.copy().sort_values("DateJour")
    
    # Features calendaires
    df["jour_semaine"] = df["DateJour"].dt.dayofweek
    df["mois"]         = df["DateJour"].dt.month
    df["trimestre"]    = df["DateJour"].dt.quarter
    df["est_weekend"]  = (df["DateJour"].dt.dayofweek >= 5).astype(int)
    df["jour_du_mois"] = df["DateJour"].dt.day
    
    # Lag features (stock J-1, J-7, J-30)
    for lag in [1, 7, 14, 30]:
        df[f"stock_lag_{lag}"]  = df["StockFinal"].shift(lag)
        df[f"sortie_lag_{lag}"] = df["TotalSortie"].shift(lag)
    
    # Rolling features
    df["stock_rolling_7"]   = df["StockFinal"].rolling(7,  min_periods=1).mean()
    df["stock_rolling_30"]  = df["StockFinal"].rolling(30, min_periods=1).mean()
    df["sortie_rolling_7"]  = df["TotalSortie"].rolling(7,  min_periods=1).mean()
    df["sortie_rolling_30"] = df["TotalSortie"].rolling(30, min_periods=1).mean()
    df["sortie_std_7"]      = df["TotalSortie"].rolling(7,  min_periods=1).std().fillna(0)
    
    # Supprimer les lignes avec NaN (dues aux lags)
    df = df.dropna(subset=[f"stock_lag_{l}" for l in [1, 7, 14, 30]])
    
    return df


def has_enough_data(df: pd.DataFrame, min_rows: int = 30) -> bool:
    """Vérifie qu'on a assez de données pour entraîner."""
    return len(df) >= min_rows and df["TotalSortie"].sum() > 0