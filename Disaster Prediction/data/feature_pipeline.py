"""
Feature Engineering Pipeline
Prepares data for ML models with proper scaling, splits, and feature engineering.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib


class FeaturePipeline:
    """Feature engineering and data preparation pipeline."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.target_columns = None
        
    def fit_transform(self, df: pd.DataFrame, 
                      feature_cols: list, 
                      target_cols: list) -> tuple:
        """
        Fit the pipeline and transform the data.
        
        Args:
            df: Input DataFrame
            feature_cols: List of feature column names
            target_cols: List of target column names
            
        Returns:
            Tuple of (X_scaled, y)
        """
        self.feature_columns = feature_cols
        self.target_columns = target_cols
        
        X = df[feature_cols].values
        y = df[target_cols].values if len(target_cols) > 1 else df[target_cols[0]].values
        
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, y
    
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform new data using fitted scaler."""
        X = df[self.feature_columns].values
        return self.scaler.transform(X)
    
    def save(self, path: Path):
        """Save pipeline to disk."""
        pipeline_data = {
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'target_columns': self.target_columns
        }
        joblib.dump(pipeline_data, path)
        
    @classmethod
    def load(cls, path: Path) -> 'FeaturePipeline':
        """Load pipeline from disk."""
        pipeline_data = joblib.load(path)
        pipeline = cls()
        pipeline.scaler = pipeline_data['scaler']
        pipeline.feature_columns = pipeline_data['feature_columns']
        pipeline.target_columns = pipeline_data['target_columns']
        return pipeline


def prepare_flood_data(flood_df: pd.DataFrame) -> tuple:
    """
    Prepare flood prediction data.
    
    Returns:
        Tuple of (X_train, X_test, y_train, y_test, pipeline)
    """
    # All columns except target
    feature_cols = [col for col in flood_df.columns if col != 'FloodProbability']
    target_cols = ['FloodProbability']
    
    pipeline = FeaturePipeline()
    X, y = pipeline.fit_transform(flood_df, feature_cols, target_cols)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test, pipeline


def prepare_disease_data(disease_df: pd.DataFrame) -> tuple:
    """
    Prepare disease prediction data.
    
    Returns:
        Tuple of (X_train, X_test, y_train, y_test, pipeline)
    """
    feature_cols = [
        'MonsoonIntensity', 'FloodProbability', 'DrainageScore',
        'UrbanizationScore', 'DeforestationScore', 'PreparednessScore'
    ]
    target_cols = ['MalariaRisk', 'CholeraRisk', 'LeptospirosisRisk', 'HepatitisRisk']
    
    pipeline = FeaturePipeline()
    X, y = pipeline.fit_transform(disease_df, feature_cols, target_cols)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test, pipeline


def prepare_combined_data(combined_df: pd.DataFrame) -> tuple:
    """
    Prepare combined disaster-disease data.
    
    Returns:
        Tuple of (X_train, X_test, y_train, y_test, pipeline)
    """
    # Use flood features to predict overall disease risk
    target_cols = ['OverallDiseaseRisk']
    
    # Exclude all disease-related columns from features
    disease_cols = ['MalariaRisk', 'CholeraRisk', 'LeptospirosisRisk', 
                    'HepatitisRisk', 'OverallDiseaseRisk', 'DrainageScore',
                    'UrbanizationScore', 'DeforestationScore', 'PreparednessScore']
    
    feature_cols = [col for col in combined_df.columns 
                    if col not in disease_cols and col != 'FloodProbability']
    # Include FloodProbability as a feature for disease prediction
    feature_cols.append('FloodProbability')
    
    pipeline = FeaturePipeline()
    X, y = pipeline.fit_transform(combined_df, feature_cols, target_cols)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test, pipeline


def main():
    """Run the feature pipeline on all datasets."""
    project_root = Path(__file__).parent.parent
    processed_dir = project_root / "data" / "processed"
    models_dir = project_root / "models" / "saved"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Load data
    flood_df = pd.read_csv(project_root / "flood.csv")
    disease_df = pd.read_csv(processed_dir / "disease_outbreak_data.csv")
    combined_df = pd.read_csv(processed_dir / "combined_disaster_disease_data.csv")
    
    print("=" * 50)
    print("FLOOD DATA PREPARATION")
    print("=" * 50)
    X_train, X_test, y_train, y_test, flood_pipeline = prepare_flood_data(flood_df)
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Features: {len(flood_pipeline.feature_columns)}")
    flood_pipeline.save(models_dir / "flood_pipeline.joblib")
    print("Saved flood pipeline")
    
    print("\n" + "=" * 50)
    print("DISEASE DATA PREPARATION")
    print("=" * 50)
    X_train, X_test, y_train, y_test, disease_pipeline = prepare_disease_data(disease_df)
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Features: {len(disease_pipeline.feature_columns)}")
    print(f"Targets: {disease_pipeline.target_columns}")
    disease_pipeline.save(models_dir / "disease_pipeline.joblib")
    print("Saved disease pipeline")
    
    print("\n" + "=" * 50)
    print("COMBINED DATA PREPARATION")
    print("=" * 50)
    X_train, X_test, y_train, y_test, combined_pipeline = prepare_combined_data(combined_df)
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Features: {len(combined_pipeline.feature_columns)}")
    combined_pipeline.save(models_dir / "combined_pipeline.joblib")
    print("Saved combined pipeline")
    
    print("\n✓ All pipelines prepared and saved!")


if __name__ == "__main__":
    main()
