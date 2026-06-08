# Connexion SQL Server + extraction 
import pyodbc
import pandas as pd
from typing import Optional

# Connexion SQL server Express
def get_connection():
    """
    Connextion à SQL Server Express 2017 (Windows Auth ou SQL Auth)
    """

    conn_str = (
        # "DRIVER={ODBC Driver 17 for SQL Server};"
        # r"SERVER=SALMAIKSOD\SAGE100;"
        # "DATABASE=Test;"
        # "UID=sa;"
        # "PWD=123456;"
          "DRIVER={ODBC Driver 17 for SQL Server};"
            r"SERVER=.\SAGE100;"
            "DATABASE=Test;"
            "UID=sa;"
            "PWD=123456;"
            "TrustServerCertificate=yes;"
    )
    return pyodbc.connect(conn_str)


def get_bases_actives() -> list[str]:
    """Retourne la liste des bases actives depuis SAGE_Bases"""
    conn = get_connection()
    query = """
        SELECT BaseName 
        FROM Test.stock.SAGE_Bases 
        WHERE IsActive = 1
        ORDER BY BaseName
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df["BaseName"].tolist()


def extract_stock_history(
    base_name: str,
    ar_ref: Optional[str] = None,
    de_no: Optional[int] = None,
    date_debut: Optional[str] = None
) -> pd.DataFrame:
    """
    Extrait l'historique du stock depuis StockJournalierCache
    
    On utilise la table matérialisée (pas la vue) pour la perf
    Si ar_ref=None → extrait TOUT pour la base (pour entraînement)
    """
    conn = get_connection()
    
    query = """
        SELECT
            BaseName,
            DateJour,
            AR_Ref,
            AR_Design,
            FA_CodeFamille,
            FA_Intitule,
            CL_No1,
            CL_Intitule1,
            DE_No,
            DE_Intitule,
            TotalEntree,
            TotalSortie,
            StockInitial,
            StockFinal,
            ValeurInitiale,
            ValeurFinale
        FROM Test.stock.StockJournalierCache
        WHERE BaseName = ?
    """
    params = [base_name]

    if ar_ref:
        query += " AND AR_Ref = ?"
        params.append(ar_ref)
    
    if de_no:
        query += " AND DE_No = ?"
        params.append(de_no)
    
    if date_debut:
        query += " AND DateJour >= ?"
        params.append(date_debut)
    
    query += " ORDER BY AR_Ref, DE_No, DateJour"
    
    df = pd.read_sql(query, conn, params=params)
    conn.close()
    
    # Typage correct
    df["DateJour"] = pd.to_datetime(df["DateJour"])
    df["TotalEntree"] = pd.to_numeric(df["TotalEntree"], errors="coerce").fillna(0)
    df["TotalSortie"] = pd.to_numeric(df["TotalSortie"], errors="coerce").fillna(0)
    df["StockFinal"]  = pd.to_numeric(df["StockFinal"],  errors="coerce").fillna(0)
    df["ValeurFinale"]= pd.to_numeric(df["ValeurFinale"],errors="coerce").fillna(0)
    
    return df

def get_articles_by_base(base_name: str) -> pd.DataFrame:
    """
    Retourne les couples (AR_Ref, DE_No) ayant assez de données
    pour être modélisés (au moins 30 jours de mouvements).
    """
    conn = get_connection()
    query = """
        SELECT 
            AR_Ref,
            AR_Design,
            DE_No,
            DE_Intitule,
            COUNT(DateJour)  AS NbJours,
            SUM(TotalSortie) AS TotalSorties
        FROM Test.stock.StockJournalierCache
        WHERE BaseName = ?
        GROUP BY AR_Ref, AR_Design, DE_No, DE_Intitule
        HAVING COUNT(DateJour) >= 30
           AND SUM(TotalSortie) > 0
        ORDER BY TotalSorties DESC
    """
    df = pd.read_sql(query, conn, params=[base_name])
    conn.close()
    return df