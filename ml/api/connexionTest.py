import pyodbc
import pandas as pd

SERVER   = r'SALMAIKSOD\SAGE100'
DATABASE = 'Test'
USERNAME = 'sa'
PASSWORD = '123456'
BASE     = 'BIJOU'

conn = pyodbc.connect(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SERVER};"
    f"DATABASE={DATABASE};"
    f"UID={USERNAME};"
    f"PWD={PASSWORD};"
    f"TrustServerCertificate=yes;"
)

# Test 1 : les bases actives
df_bases = pd.read_sql(
    "EXEC Test.stock.SP_GetBases", conn
)
print("Bases actives :")
print(df_bases)

# Test 2 : la procédure principale sur une petite période
df_test = pd.read_sql(
    "EXEC Test.stock.SP_GetStockJournalier ?, ?, ?",
    conn,
    params=[BASE, '2025-01-01', '2025-01-31']
)
print(f"\nColonnes reçues :")
print(df_test.columns.tolist())
print(f"\nLignes : {len(df_test)}")

conn.close()