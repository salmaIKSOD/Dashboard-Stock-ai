BASE_NAME = "PHARMA"   # ← changer ici uniquement

SQL_SERVER   = r"SALMAIKSOD\SAGE100"
SQL_DATABASE = "StockAnalytics"
SQL_UID      = "sa"
SQL_PWD      = "123456"

MIN_JOURS_SORTIE = 30
PARETO_SEUIL     = 0.80
TEST_RATIO       = 0.20
CONTAMINATION    = 0.05
RF_ESTIMATORS    = 100

DATA_DIR  = f"../../output/{BASE_NAME}/data_clean/"
MODEL_DIR = f"../../models/{BASE_NAME}/"
PERF_DIR  = f"../../output/{BASE_NAME}/performance/"
PLOT_DIR  = f"../../output/{BASE_NAME}/plots/"
OUTPUT_DIR = f"../../output/{BASE_NAME}/data_clean/"
EXPLORE_DIR = f"../../output/{BASE_NAME}/plots/"