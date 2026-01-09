"""
Unified Data Pipeline for AEGIS
Integrates data loading, harmonization, validation, and training/inference separation.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import logging
import joblib
from functools import lru_cache
import hashlib
import json

from data.data_loader import DataLoader, get_data_loader
from data.feature_harmonizer import FeatureHarmonizer

logger = logging.getLogger(__name__)


class UnifiedPipeline:
    """
    Unified pipeline that:
    - Loads and harmonizes all datasets
    - Separates training (with synthetic) vs inference (real only)
    - Validates data quality
    - Caches processed data
    - Provides unified feature computation
    """
    
    def __init__(self, data_dir: Optional[Path] = None, cache_dir: Optional[Path] = None):
        """
        Initialize unified pipeline.
        
        Args:
            data_dir: Path to data directory
            cache_dir: Path to cache directory for processed data
        """
        if data_dir is None:
            data_dir = Path(__file__).parent
        if cache_dir is None:
            cache_dir = data_dir / 'processed' / 'cache'
            cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.data_dir = Path(data_dir)
        self.cache_dir = Path(cache_dir)
        self.data_loader = DataLoader(data_dir)
        self.harmonizer = FeatureHarmonizer(self.data_loader)
        
        # Cache for processed datasets
        self._training_data_cache: Optional[pd.DataFrame] = None
        self._inference_data_cache: Optional[Dict[str, pd.DataFrame]] = None
        
    def _get_cache_key(self, datasets: List[str], operation: str) -> str:
        """Generate cache key from dataset names and operation."""
        key_str = f"{operation}_{'_'.join(sorted(datasets))}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def validate_dataset(self, df: pd.DataFrame, dataset_name: str) -> Tuple[bool, List[str]]:
        """
        Validate dataset quality.
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        # Check for empty dataset
        if df.empty:
            issues.append("Dataset is empty")
            return False, issues
        
        # Check for excessive missing values
        missing_pct = df.isnull().sum() / len(df)
        high_missing = missing_pct[missing_pct > 0.5]
        if not high_missing.empty:
            issues.append(f"High missing values in columns: {high_missing.index.tolist()}")
        
        # Check for duplicate rows
        dupes = df.duplicated().sum()
        if dupes > len(df) * 0.1:  # More than 10% duplicates
            issues.append(f"High duplicate ratio: {dupes}/{len(df)} ({dupes/len(df)*100:.1f}%)")
        
        # Check for future data leakage (if timestamp available)
        if '_timestamp' in df.columns:
            max_date = df['_timestamp'].max()
            if pd.notna(max_date):
                from datetime import datetime
                now = pd.Timestamp.now(tz='UTC')
                if max_date > now:
                    issues.append(f"Future timestamps detected: max={max_date}, now={now}")
        
        # Check for unrealistic values (skip geographic and temporal columns)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        skip_patterns = ['lat', 'lon', 'longitude', 'latitude', 'year', 'month', 'day', 'hour', 'minute', 'id', 'elevation']
        
        for col in numeric_cols[:10]:  # Check first 10 numeric columns
            if col.startswith('_meta'):
                continue
            # Skip geographic/temporal columns
            if any(pattern in col.lower() for pattern in skip_patterns):
                continue
                
            col_min = df[col].min()
            col_max = df[col].max()
            # Check for extreme outliers (values > 1000x median, but only for bounded scales)
            if col_min != col_max and col_min >= 0:  # Only check non-negative bounded values
                median = df[col].median()
                if median > 0.01:  # Avoid dividing by tiny medians
                    if col_max > median * 1000:
                        issues.append(f"Extreme outliers in {col}: min={col_min}, max={col_max}, median={median}")
        
        is_valid = len(issues) == 0
        if not is_valid:
            logger.warning(f"Validation issues for {dataset_name}: {issues}")
        
        return is_valid, issues
    
    def prepare_training_data(self, use_synthetic: bool = True) -> pd.DataFrame:
        """
        Prepare training data combining real and synthetic datasets.
        
        Args:
            use_synthetic: Whether to include synthetic data
            
        Returns:
            Combined training DataFrame
        """
        if self._training_data_cache is not None:
            return self._training_data_cache
        
        logger.info("Preparing training data...")
        
        # Load and harmonize all datasets
        harmonized = self.harmonizer.harmonize_all_datasets()
        
        training_dfs = []
        
        for name, df in harmonized.items():
            # Validate
            is_valid, issues = self.validate_dataset(df, name)
            if not is_valid:
                logger.warning(f"Skipping {name} due to validation issues")
                continue
            
            # Filter by source type
            if '_meta_source_type' in df.columns:
                source_type = df['_meta_source_type'].iloc[0]
                
                # Always include real data
                if source_type in ['real_disaster', 'real_disease']:
                    training_dfs.append(df)
                    logger.info(f"  ✓ Added real data: {name} ({len(df)} rows)")
                
                # Include synthetic only if requested
                elif use_synthetic and source_type.startswith('synthetic'):
                    training_dfs.append(df)
                    logger.info(f"  ✓ Added synthetic data: {name} ({len(df)} rows)")
        
        if not training_dfs:
            raise ValueError("No valid training data found")
        
        # Combine datasets
        # Use outer join on common columns, fill missing with defaults
        combined = pd.concat(training_dfs, ignore_index=True, sort=False)
        
        # Log data lineage
        source_summary = combined['_meta_source_type'].value_counts() if '_meta_source_type' in combined.columns else {}
        logger.info(f"Training data summary: {len(combined)} rows from {len(training_dfs)} datasets")
        logger.info(f"Source breakdown: {source_summary.to_dict()}")
        
        self._training_data_cache = combined
        return combined
    
    def prepare_inference_data(self) -> Dict[str, pd.DataFrame]:
        """
        Prepare inference data (real data only, no synthetic).
        
        Returns:
            Dictionary of real datasets for inference
        """
        if self._inference_data_cache is not None:
            return self._inference_data_cache
        
        logger.info("Preparing inference data (real data only)...")
        
        harmonized = self.harmonizer.harmonize_all_datasets()
        
        inference_datasets = {}
        
        for name, df in harmonized.items():
            # Validate
            is_valid, issues = self.validate_dataset(df, name)
            if not is_valid:
                continue
            
            # Only real data for inference
            if '_meta_source_type' in df.columns:
                source_type = df['_meta_source_type'].iloc[0]
                if source_type in ['real_disaster', 'real_disease', 'climate']:
                    inference_datasets[name] = df
                    logger.info(f"  ✓ Added real data for inference: {name} ({len(df)} rows)")
        
        self._inference_data_cache = inference_datasets
        return inference_datasets
    
    def compute_features(self, input_data: Dict[str, Any], mode: str = 'inference') -> Dict[str, Any]:
        """
        Compute features from input data for model prediction.
        
        Args:
            input_data: Dictionary of input features
            mode: 'inference' or 'training'
            
        Returns:
            Dictionary of computed features
        """
        features = input_data.copy()
        
        # Add interaction features if relevant columns exist
        flood_prob = features.get('flood_probability') or features.get('MonsoonIntensity', 5) / 10
        cholera_risk = features.get('cholera_risk') or 0.0
        
        if flood_prob and cholera_risk:
            features['flood_cholera_interaction'] = flood_prob * cholera_risk
        
        # Add derived features (if temporal data available)
        # For inference, we typically don't have historical data, so skip temporal features
        
        return features
    
    def get_data_lineage(self, dataset_names: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get data lineage information.
        
        Args:
            dataset_names: List of dataset names to get lineage for. If None, returns all.
            
        Returns:
            Dictionary with lineage information
        """
        metadata = self.data_loader.get_metadata()
        
        if dataset_names is None:
            return metadata
        
        return {name: metadata.get(name, {}) for name in dataset_names}
    
    def check_inference_confidence(self, prediction: Dict[str, Any], 
                                   confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """
        Check if prediction confidence is sufficient.
        
        Args:
            prediction: Prediction dictionary with confidence/risk scores
            confidence_threshold: Minimum confidence threshold
            
        Returns:
            Prediction dict with 'insufficient_evidence' flag if confidence too low
        """
        # Extract confidence/risk score
        confidence = prediction.get('confidence', 1.0)
        risk_score = prediction.get('overall_disease_risk') or prediction.get('flood_probability', 0.0)
        
        # If risk is high but confidence is low, flag as insufficient evidence
        if risk_score > 0.6 and confidence < confidence_threshold:
            prediction['insufficient_evidence'] = True
            prediction['confidence_warning'] = f"High risk ({risk_score:.2f}) but low confidence ({confidence:.2f})"
        else:
            prediction['insufficient_evidence'] = False
        
        return prediction


# Global instance for caching
_unified_pipeline_instance: Optional[UnifiedPipeline] = None


def get_unified_pipeline(data_dir: Optional[Path] = None) -> UnifiedPipeline:
    """
    Get or create singleton UnifiedPipeline instance.
    
    Args:
        data_dir: Path to data directory
        
    Returns:
        UnifiedPipeline instance
    """
    global _unified_pipeline_instance
    if _unified_pipeline_instance is None:
        _unified_pipeline_instance = UnifiedPipeline(data_dir)
    return _unified_pipeline_instance


if __name__ == "__main__":
    # Test the unified pipeline
    pipeline = UnifiedPipeline()
    
    print("\n" + "="*60)
    print("UNIFIED PIPELINE TEST")
    print("="*60)
    
    # Test training data preparation
    print("\n[1] Preparing training data...")
    training_data = pipeline.prepare_training_data(use_synthetic=True)
    print(f"  ✓ Training data: {len(training_data)} rows, {len(training_data.columns)} columns")
    
    # Test inference data preparation
    print("\n[2] Preparing inference data...")
    inference_data = pipeline.prepare_inference_data()
    print(f"  ✓ Inference datasets: {len(inference_data)}")
    for name, df in inference_data.items():
        print(f"    - {name}: {len(df)} rows")
    
    # Test data lineage
    print("\n[3] Data lineage:")
    lineage = pipeline.get_data_lineage()
    for name, meta in list(lineage.items())[:5]:
        print(f"    - {name}: source={meta.get('source_type')}, category={meta.get('event_category')}")
    
    print("\n✓ Unified pipeline test complete!")

