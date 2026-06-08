# API FastAPI  = Serveur FastAPI port 8000
# ml/api/main.py
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from extractor  import get_bases_actives, get_articles_by_base
from trainer    import train_all_for_base, train_all_bases
from predictor  import predict, list_trained_models

app = FastAPI(title="Stock ML Service", version="1.0.0")

# Autoriser les appels depuis Express (localhost:5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── GET /bases ────────────────────────────────────────────────
@app.get("/bases")
def get_bases():
    """Liste des bases actives."""
    return {"bases": get_bases_actives()}


# ── GET /models/{base_name} ───────────────────────────────────
@app.get("/models/{base_name}")
def get_models(base_name: str):
    """Articles déjà modélisés pour une base."""
    models = list_trained_models(base_name)
    return {"base_name": base_name, "models": models, "count": len(models)}


# ── GET /articles/{base_name} ─────────────────────────────────
@app.get("/articles/{base_name}")
def get_articles(base_name: str):
    """Articles disponibles avec assez de données pour la base."""
    df = get_articles_by_base(base_name)
    return {"articles": df.to_dict(orient="records")}


# ── GET /predict/{base}/{article}/{depot} ─────────────────────
@app.get("/predict/{base_name}/{ar_ref}/{de_no}")
def get_prediction(base_name: str, ar_ref: str, de_no: int, horizon: int = 30):
    """
    Retourne la prévision pour un article/dépôt.
    horizon : nombre de jours à prévoir (défaut 30, max 90)
    """
    horizon = min(max(horizon, 7), 90)
    result = predict(base_name, ar_ref, de_no, horizon)
    if result["status"] == "no_model":
        raise HTTPException(status_code=404, detail=result["message"])
    return result


# ── POST /train/{base_name} ───────────────────────────────────
@app.post("/train/{base_name}")
def train_base(base_name: str, background_tasks: BackgroundTasks):
    """
    Lance l'entraînement en arrière-plan pour une base.
    Retourne immédiatement (entraînement asynchrone).
    Appelé automatiquement par Express quand une nouvelle base est détectée.
    """
    background_tasks.add_task(train_all_for_base, base_name)
    return {
        "status": "training_started",
        "base":   base_name,
        "message": f"Entraînement lancé pour {base_name}. "
                   f"Vérifiez /models/{base_name} pour suivre la progression."
    }


# ── POST /train-all ───────────────────────────────────────────
@app.post("/train-all")
def train_all(background_tasks: BackgroundTasks):
    """Lance l'entraînement de toutes les bases actives."""
    background_tasks.add_task(train_all_bases)
    return {"status": "training_started", "message": "Toutes les bases en cours d'entraînement."}


# ── GET /health ───────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "ML Stock Prediction"}


# ── Lancement ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    # Premier entraînement au démarrage si aucun modèle n'existe
    import os, glob
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    if not glob.glob(os.path.join(models_dir, "**/*.pkl"), recursive=True):
        print("Aucun modèle trouvé → premier entraînement automatique...")
        train_all_bases()
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)