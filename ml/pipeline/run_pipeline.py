# lanceur principal
# ══════════════════════════════════════════════════════════════
#  run_pipeline.py — Pipeline principal
#  Appelé par le backend Node.js quand une base est ajoutée
#  Usage : python run_pipeline.py --base PHARMA
# ══════════════════════════════════════════════════════════════

import sys
import os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
import argparse
import json
from datetime import datetime

# Ajouter le dossier parent au path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def run_pipeline(base_name):
    """
    Lance preprocessing + model_training pour une base donnée.
    Retourne un dict avec le statut et les métriques.
    """
    start_time = datetime.now()
    result = {
        "base_name"  : base_name,
        "status"     : "running",
        "started_at" : start_time.isoformat(),
        "steps"      : {}
    }

    print(f"\n{'='*60}")
    print(f"  PIPELINE — {base_name}")
    print(f"  Démarré : {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    # ── Étape 1 : Preprocessing ───────────────────────────────
    print(f"\n>>> ÉTAPE 1/2 : PREPROCESSING")
    try:
        from pipeline import preprocessing
        preprocessing.run(base_name=base_name)
        result["steps"]["preprocessing"] = "success"
        print(f"    ✅ Preprocessing terminé")
    except Exception as e:
        result["steps"]["preprocessing"] = f"error: {str(e)}"
        result["status"] = "failed"
        result["error"]  = f"Preprocessing: {str(e)}"
        print(f"    ❌ Erreur preprocessing : {e}")
        _save_status(base_name, result)
        return result

    # ── Étape 2 : Model Training ──────────────────────────────
    print(f"\n>>> ÉTAPE 2/2 : MODEL TRAINING")
    try:
        from pipeline import model_training
        model_training.run(base_name=base_name)
        result["steps"]["model_training"] = "success"
        print(f"    ✅ Model training terminé")
    except Exception as e:
        result["steps"]["model_training"] = f"error: {str(e)}"
        result["status"] = "failed"
        result["error"]  = f"Model training: {str(e)}"
        print(f"    ❌ Erreur model training : {e}")
        _save_status(base_name, result)
        return result

    # ── Succès ────────────────────────────────────────────────
    end_time              = datetime.now()
    duration              = (end_time - start_time).seconds
    result["status"]      = "success"
    result["finished_at"] = end_time.isoformat()
    result["duration_s"]  = duration

    print(f"\n{'='*60}")
    print(f"  ✅ PIPELINE TERMINÉ — {base_name}")
    print(f"  Durée : {duration}s")
    print(f"{'='*60}\n")

    _save_status(base_name, result)
    return result


def _save_status(base_name, result):
    """Sauvegarde le statut dans un fichier JSON lisible par le backend."""
    status_dir  = os.path.join(os.path.dirname(__file__), '..', '..', 'output', base_name)
    os.makedirs(status_dir, exist_ok=True)
    status_file = os.path.join(status_dir, 'pipeline_status.json')
    with open(status_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"    📄 Statut sauvegardé : {status_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline ML Stock Analytics")
    parser.add_argument('--base', required=True, help='Nom de la base SAGE (ex: PHARMA)')
    args = parser.parse_args()

    result = run_pipeline(args.base)
    sys.exit(0 if result["status"] == "success" else 1)