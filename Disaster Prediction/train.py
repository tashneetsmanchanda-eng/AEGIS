import sys
from pathlib import Path


project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


def main():
    print("=" * 60)
    print("DISASTER & DISEASE PREDICTION - TRAINING PIPELINE")
    print("=" * 60)
    
    print("\n[1/4] Generating disease outbreak data...")
    from data.disease_data_generator import main as generate_disease_data
    generate_disease_data()

    print("\n[2/4] Running feature pipeline...")
    from data.feature_pipeline import main as run_pipeline
    run_pipeline()

    print("\n[3/4] Training flood prediction model...")
    from models.flood_model import train_and_save as train_flood
    train_flood()

    print("\n[4/4] Training disease prediction model...")
    from models.disease_model import train_and_save as train_disease
    train_disease()

    print("\n[5/5] Building combined predictor...")
    from models.combined_predictor import build_and_save as build_combined
    build_combined()
    
    print("\n" + "=" * 60)
    print("✓ TRAINING COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the API server:")
    print("   cd api && uvicorn main:app --reload")
    print("\n2. Start the frontend:")
    print("   cd ../uiG/'AI Public Risk Decision System' && npm run dev")
    print("\n3. View API docs:")
    print("http://localhost:8000/docs")

if __name__ == "__main__":
    main()
