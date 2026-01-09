import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from data.feature_pipeline import prepare_disease_data


class DiseasePredictor:
    
    DISEASE_NAMES = ['MalariaRisk', 'CholeraRisk', 'LeptospirosisRisk', 'HepatitisRisk']
    
    def __init__(self):
        base_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.model = MultiOutputRegressor(base_model)
        self.is_fitted = False
        
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'DiseasePredictor':
        print("Training disease prediction model...")
        self.model.fit(X, y)
        self.is_fitted = True
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        predictions = self.model.predict(X)
        return np.clip(predictions, 0, 1)
    
    def predict_dict(self, X: np.ndarray) -> list:
        predictions = self.predict(X)
        results = []
        
        for pred in predictions:
            result = {name: float(pred[i]) for i, name in enumerate(self.DISEASE_NAMES)}
            result['OverallRisk'] = float(np.mean(pred))
            results.append(result)
        
        return results
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> dict:
        y_pred = self.predict(X)
        
        metrics = {}
        for i, name in enumerate(self.DISEASE_NAMES):
            metrics[name] = {
                'r2_score': r2_score(y[:, i], y_pred[:, i]),
                'mse': mean_squared_error(y[:, i], y_pred[:, i]),
                'mae': mean_absolute_error(y[:, i], y_pred[:, i])
            }
        
        metrics['overall'] = {
            'r2_score': r2_score(y.flatten(), y_pred.flatten()),
            'mse': mean_squared_error(y.flatten(), y_pred.flatten()),
            'mae': mean_absolute_error(y.flatten(), y_pred.flatten())
        }
        
        return metrics
    
    def save(self, path: Path):
        joblib.dump(self, path)
        
    @classmethod
    def load(cls, path: Path) -> 'DiseasePredictor':
        return joblib.load(path)


def train_and_save():
    project_root = Path(__file__).parent.parent
    processed_dir = project_root / "data" / "processed"
    
    print("Loading disease outbreak data...")
    disease_df = pd.read_csv(processed_dir / "disease_outbreak_data.csv")
    
    X_train, X_test, y_train, y_test, pipeline = prepare_disease_data(disease_df)
    
    model = DiseasePredictor()
    model.fit(X_train, y_train)
    
    print("\n--- Test Metrics by Disease ---")
    test_metrics = model.evaluate(X_test, y_test)
    for disease, metrics in test_metrics.items():
        print(f"\n{disease}:")
        for name, value in metrics.items():
            print(f"  {name}: {value:.4f}")
    
    models_dir = project_root / "models" / "saved"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    model.save(models_dir / "disease_model.joblib")
    pipeline.save(models_dir / "disease_pipeline.joblib")
    
    print(f"\n✓ Model saved to: {models_dir / 'disease_model.joblib'}")
    
    return model, pipeline


if __name__ == "__main__":
    train_and_save()
