import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from data.feature_pipeline import prepare_flood_data


class FloodPredictor:
    
    def __init__(self):
        self.models = {
            'random_forest': RandomForestRegressor(
                n_estimators=100, 
                max_depth=10, 
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100, 
                learning_rate=0.1, 
                max_depth=5, 
                random_state=42
            ),
            'ridge': Ridge(alpha=1.0)
        }
        self.weights = {'random_forest': 0.4, 'gradient_boosting': 0.45, 'ridge': 0.15}
        self.feature_importance = None
        self.is_fitted = False
        
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'FloodPredictor':
        print("Training flood prediction ensemble...")
        
        for name, model in self.models.items():
            print(f"  Training {name}...")
            model.fit(X, y)
        
        self.feature_importance = self.models['random_forest'].feature_importances_
        self.is_fitted = True
        
        return self
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        predictions = np.zeros(len(X))
        
        for name, model in self.models.items():
            pred = model.predict(X)
            predictions += self.weights[name] * pred
        
        return np.clip(predictions, 0, 1)
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> dict:
        y_pred = self.predict(X)
        
        metrics = {
            'r2_score': r2_score(y, y_pred),
            'mse': mean_squared_error(y, y_pred),
            'rmse': np.sqrt(mean_squared_error(y, y_pred)),
            'mae': mean_absolute_error(y, y_pred)
        }
        
        return metrics
    
    def get_feature_importance(self, feature_names: list) -> pd.Series:
        return pd.Series(
            self.feature_importance, 
            index=feature_names
        ).sort_values(ascending=False)
    
    def save(self, path: Path):
        joblib.dump(self, path)
        
    @classmethod
    def load(cls, path: Path) -> 'FloodPredictor':
        return joblib.load(path)


def train_and_save():
    project_root = Path(__file__).parent.parent
    
    print("Loading flood data...")
    flood_df = pd.read_csv(project_root / "flood.csv")
    
    X_train, X_test, y_train, y_test, pipeline = prepare_flood_data(flood_df)
    
    model = FloodPredictor()
    model.fit(X_train, y_train)
    
    print("\n--- Training Metrics ---")
    train_metrics = model.evaluate(X_train, y_train)
    for name, value in train_metrics.items():
        print(f"  {name}: {value:.4f}")
    
    print("\n--- Test Metrics ---")
    test_metrics = model.evaluate(X_test, y_test)
    for name, value in test_metrics.items():
        print(f"  {name}: {value:.4f}")
    
    print("\n--- Top 10 Feature Importance ---")
    importance = model.get_feature_importance(pipeline.feature_columns)
    print(importance.head(10))
    
    models_dir = project_root / "models" / "saved"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    model.save(models_dir / "flood_model.joblib")
    pipeline.save(models_dir / "flood_pipeline.joblib")
    
    print(f"\n✓ Model saved to: {models_dir / 'flood_model.joblib'}")
    
    return model, pipeline


if __name__ == "__main__":
    train_and_save()
