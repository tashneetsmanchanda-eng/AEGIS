"""
Centralized Data Loader for AEGIS Prediction Pipeline
Loads, validates, harmonizes, and merges all disaster + disease datasets.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime
import re
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """
    Centralized data loader that handles all datasets with:
    - Recursive file loading
    - Schema auto-detection
    - Column standardization
    - Metadata enrichment
    - Feature harmonization
    - Validation
    """
    
    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize data loader.
        
        Args:
            data_dir: Path to data directory. Defaults to data/ relative to this file.
        """
        if data_dir is None:
            data_dir = Path(__file__).parent
        self.data_dir = Path(data_dir)
        self.loaded_datasets: Dict[str, pd.DataFrame] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.climate_data: Optional[pd.DataFrame] = None
        
    def to_snake_case(self, name: str) -> str:
        """Convert column name to snake_case."""
        # Handle camelCase
        name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
        # Replace spaces and special chars with underscores
        name = re.sub(r'[^\w\s]', '_', name)
        name = re.sub(r'\s+', '_', name)
        return name.lower().strip('_')
    
    def standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize all column names to snake_case."""
        df = df.copy()
        df.columns = [self.to_snake_case(col) for col in df.columns]
        return df
    
    def detect_file_type(self, file_path: Path) -> Dict[str, Any]:
        """
        Detect file metadata (source_type, event_category, geo_scope).
        
        Returns metadata dict with source_type, event_category, geo_scope.
        """
        file_name = file_path.stem.lower()
        parent_dir = file_path.parent.name.lower()
        
        metadata = {
            'source_type': None,
            'event_category': None,
            'geo_scope': None
        }
        
        # Determine source_type
        if 'synthetic' in file_name:
            if 'india' in file_name:
                metadata['source_type'] = 'synthetic_india'
                metadata['geo_scope'] = 'india'
            elif 'global' in file_name:
                metadata['source_type'] = 'synthetic_global'
                metadata['geo_scope'] = 'global'
            else:
                metadata['source_type'] = 'synthetic'
                metadata['geo_scope'] = 'mixed'
        elif parent_dir == 'disasters':
            metadata['source_type'] = 'real_disaster'
            metadata['geo_scope'] = 'mixed'
        elif parent_dir == 'diseases':
            metadata['source_type'] = 'real_disease'
            metadata['geo_scope'] = 'global'
        elif 'temperature' in file_name.lower():
            metadata['source_type'] = 'climate'
            metadata['geo_scope'] = 'city_level'
        else:
            metadata['source_type'] = 'unknown'
            metadata['geo_scope'] = 'unknown'
        
        # Determine event_category from filename
        disaster_types = ['flood', 'cyclone', 'tsunami', 'volcano', 'earthquake']
        disease_types = ['cholera', 'diarrhea', 'respiratory', 'malaria', 'hepatitis', 'leptospirosis']
        
        for dt in disaster_types:
            if dt in file_name:
                metadata['event_category'] = dt
                break
        
        if metadata['event_category'] is None:
            for dt in disease_types:
                if dt in file_name:
                    metadata['event_category'] = dt
                    break
        
        if metadata['event_category'] is None and 'disaster' in file_name:
            metadata['event_category'] = 'mixed_disaster'
        elif metadata['event_category'] is None and 'disease' in file_name:
            metadata['event_category'] = 'mixed_disease'
        
        return metadata
    
    def load_file(self, file_path: Path) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Load a single file (CSV or Excel) with error handling.
        
        Returns:
            Tuple of (DataFrame, metadata_dict)
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            # Load based on extension
            if file_path.suffix.lower() == '.csv':
                df = pd.read_csv(file_path, low_memory=False)
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path, engine='openpyxl')
            else:
                raise ValueError(f"Unsupported file format: {file_path.suffix}")
            
            # Standardize columns
            df = self.standardize_columns(df)
            
            # Get metadata
            metadata = self.detect_file_type(file_path)
            metadata['file_path'] = str(file_path)
            metadata['rows_loaded'] = len(df)
            metadata['columns'] = list(df.columns)
            
            # Add metadata columns to DataFrame
            for key, value in metadata.items():
                if key not in ['file_path', 'rows_loaded', 'columns']:
                    df[f'_meta_{key}'] = value
            
            logger.info(f"✓ Loaded {file_path.name}: {len(df)} rows, {len(df.columns)} columns")
            
            return df, metadata
            
        except Exception as e:
            logger.error(f"✗ Error loading {file_path}: {e}")
            raise
    
    def load_all_datasets(self) -> Dict[str, pd.DataFrame]:
        """
        Recursively load all datasets from data directory.
        
        Returns:
            Dictionary mapping dataset names to DataFrames
        """
        datasets = {}
        
        # Load disaster files
        disasters_dir = self.data_dir / 'disasters'
        if disasters_dir.exists():
            for file_path in disasters_dir.glob('*.csv'):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
            
            # Also try Excel files
            for file_path in disasters_dir.glob('*.xlsx'):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
        
        # Load disease files
        diseases_dir = self.data_dir / 'diseases'
        if diseases_dir.exists():
            for file_path in diseases_dir.glob('*.csv'):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
            
            for file_path in diseases_dir.glob('*.xlsx'):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
        
        # Load synthetic datasets
        for pattern in ['synthetic_*.csv', 'synthetic_*.xlsx']:
            for file_path in self.data_dir.glob(pattern):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
        
        # Load climate data
        climate_patterns = ['GlobalLandTemperaturesByCity.*', '*temperature*.csv', '*temperature*.xlsx']
        for pattern in climate_patterns:
            for file_path in self.data_dir.glob(pattern):
                try:
                    df, metadata = self.load_file(file_path)
                    name = file_path.stem
                    datasets[name] = df
                    self.metadata[name] = metadata
                    self.climate_data = df  # Store separately for easy access
                    break
                except Exception as e:
                    logger.warning(f"Skipping {file_path.name}: {e}")
        
        self.loaded_datasets = datasets
        logger.info(f"\n✓ Total datasets loaded: {len(datasets)}")
        for name, meta in self.metadata.items():
            logger.info(f"  - {name}: {meta['rows_loaded']} rows, source={meta['source_type']}, category={meta['event_category']}")
        
        return datasets
    
    def get_loaded_datasets(self) -> Dict[str, pd.DataFrame]:
        """Get all loaded datasets."""
        if not self.loaded_datasets:
            self.load_all_datasets()
        return self.loaded_datasets
    
    def get_metadata(self) -> Dict[str, Dict[str, Any]]:
        """Get metadata for all loaded datasets."""
        return self.metadata


def get_data_loader(data_dir: Optional[Path] = None) -> DataLoader:
    """
    Get or create singleton DataLoader instance.
    
    Args:
        data_dir: Path to data directory
        
    Returns:
        DataLoader instance
    """
    if not hasattr(get_data_loader, '_instance'):
        get_data_loader._instance = DataLoader(data_dir)
    return get_data_loader._instance


if __name__ == "__main__":
    # Test the data loader
    loader = DataLoader()
    datasets = loader.load_all_datasets()
    
    print("\n" + "="*60)
    print("DATA LOADER TEST COMPLETE")
    print("="*60)
    print(f"\nLoaded {len(datasets)} datasets:")
    for name in datasets.keys():
        print(f"  - {name}")

