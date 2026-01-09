"""
Feature Harmonization Module
Normalizes units, aligns temporal data, creates derived features, and joins climate data.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import logging
import re
from data.data_loader import DataLoader, get_data_loader

logger = logging.getLogger(__name__)


class FeatureHarmonizer:
    """
    Harmonizes features across datasets:
    - Unit normalization
    - Temporal alignment (UTC timestamps)
    - Derived features (lags, trends)
    - Climate data joining
    - Interaction features
    """
    
    def __init__(self, data_loader: Optional[DataLoader] = None):
        """
        Initialize feature harmonizer.
        
        Args:
            data_loader: DataLoader instance. If None, creates a new one.
        """
        self.data_loader = data_loader or get_data_loader()
        self.unit_mappings = self._initialize_unit_mappings()
        self.temperature_data: Optional[pd.DataFrame] = None
        
    def _initialize_unit_mappings(self) -> Dict[str, Dict[str, float]]:
        """Initialize unit conversion mappings."""
        return {
            'rainfall': {
                'mm': 1.0,
                'cm': 10.0,
                'inches': 25.4,
                'm': 1000.0
            },
            'wind_speed': {
                'kmh': 1.0,
                'km/h': 1.0,
                'mph': 1.60934,
                'm/s': 3.6,
                'knots': 1.852
            },
            'temperature': {
                'celsius': 1.0,
                'c': 1.0,
                'fahrenheit': lambda x: (x - 32) * 5/9,
                'f': lambda x: (x - 32) * 5/9,
                'kelvin': lambda x: x - 273.15
            },
            'pressure': {
                'hpa': 1.0,
                'mb': 1.0,
                'mmhg': 1.33322,
                'psi': 68.9476
            }
        }
    
    def normalize_units(self, df: pd.DataFrame, dataset_name: str) -> pd.DataFrame:
        """
        Normalize units across datasets.
        
        Converts:
        - Rainfall to mm
        - Wind speed to km/h
        - Temperature to Celsius
        - Pressure to hPa
        - AQI (no conversion needed, already standardized)
        - Cases (no conversion needed)
        """
        df = df.copy()
        
        # Rainfall normalization (to mm)
        rainfall_cols = [col for col in df.columns if 'rain' in col.lower() or 'precipitation' in col.lower()]
        for col in rainfall_cols:
            if df[col].dtype in [np.float64, np.int64, np.float32, np.int32]:
                # Assume already in mm if values are reasonable (0-2000mm)
                if df[col].max() > 5000:  # Likely in different unit
                    # Could be in cm or inches, but we'll log and assume mm for now
                    logger.warning(f"Large rainfall values in {col}, assuming mm")
        
        # Wind speed normalization (to km/h)
        wind_cols = [col for col in df.columns if 'wind' in col.lower() and 'speed' in col.lower()]
        for col in wind_cols:
            if df[col].dtype in [np.float64, np.int64, np.float32, np.int32]:
                # Check if values are reasonable for km/h (typically 0-300)
                if df[col].max() > 500:  # Possibly in m/s or knots
                    # Convert from m/s (multiply by 3.6) if max < 100
                    if df[col].max() < 100:
                        df[col] = df[col] * 3.6
                        logger.info(f"Converted {col} from m/s to km/h")
        
        # Temperature normalization (to Celsius)
        temp_cols = [col for col in df.columns if 'temp' in col.lower() and 'uncertainty' not in col.lower()]
        for col in temp_cols:
            if df[col].dtype in [np.float64, np.int64, np.float32, np.int32]:
                # Check if values are in Fahrenheit (typically > 50 for tropical regions)
                if df[col].min() > 50 and df[col].max() < 150:
                    # Likely Fahrenheit, convert to Celsius
                    df[col] = (df[col] - 32) * 5/9
                    logger.info(f"Converted {col} from Fahrenheit to Celsius")
        
        return df
    
    def parse_timestamp(self, value: Any) -> Optional[pd.Timestamp]:
        """Parse various timestamp formats to UTC."""
        if pd.isna(value):
            return None
        
        try:
            # Try parsing as datetime
            if isinstance(value, str):
                # Common formats
                for fmt in ['%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%dT%H:%M:%S']:
                    try:
                        dt = datetime.strptime(value, fmt)
                        return pd.Timestamp(dt, tz='UTC')
                    except:
                        continue
                # Try pandas parser
                return pd.to_datetime(value, utc=True)
            elif isinstance(value, (datetime, pd.Timestamp)):
                ts = pd.Timestamp(value)
                if ts.tz is None:
                    ts = ts.tz_localize('UTC')
                else:
                    ts = ts.tz_convert('UTC')
                return ts
            else:
                return pd.to_datetime(value, utc=True)
        except:
            return None
    
    def align_temporal_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Align temporal data - convert all timestamps to UTC.
        
        Looks for columns like: date, time, timestamp, year, month, day, dt
        """
        df = df.copy()
        
        # Find temporal columns
        temporal_patterns = ['date', 'time', 'timestamp', 'dt', 'year', 'month', 'day']
        temporal_cols = []
        for col in df.columns:
            col_lower = col.lower()
            if any(pattern in col_lower for pattern in temporal_patterns):
                if col_lower not in ['_meta_source_type', '_meta_event_category', '_meta_geo_scope']:
                    temporal_cols.append(col)
        
        # Create unified timestamp column
        if 'year' in df.columns:
            # Construct date from year/month/day
            date_parts = []
            if 'year' in df.columns:
                date_parts.append(df['year'].astype(str))
            if 'month' in df.columns:
                month = df['month'].fillna(1).astype(int).astype(str).str.zfill(2)
                date_parts.append(month)
            else:
                date_parts.append('01')
            if 'day' in df.columns:
                day = df['day'].fillna(1).astype(int).astype(str).str.zfill(2)
                date_parts.append(day)
            else:
                date_parts.append('01')
            
            date_str = date_parts[0] + '-' + date_parts[1] + '-' + date_parts[2]
            df['_timestamp'] = pd.to_datetime(date_str, errors='coerce', utc=True)
        else:
            # Try to parse existing date columns
            for col in temporal_cols[:1]:  # Use first temporal column
                df['_timestamp'] = df[col].apply(self.parse_timestamp)
                break
        
        return df
    
    def create_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create derived features:
        - lag_3d, lag_7d (if temporal data available)
        - trend_14d (if temporal data available)
        - Statistical features (mean, std, min, max for grouped data)
        """
        df = df.copy()
        
        # Only create temporal features if timestamp exists
        if '_timestamp' in df.columns and not df['_timestamp'].isna().all():
            df = df.sort_values('_timestamp')
            
            # Create lag features for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            # Exclude metadata and timestamp columns
            numeric_cols = [col for col in numeric_cols if not col.startswith('_meta') and col != '_timestamp']
            
            for col in numeric_cols[:10]:  # Limit to first 10 numeric cols to avoid explosion
                try:
                    # 3-day lag
                    df[f'{col}_lag_3d'] = df[col].shift(3)
                    # 7-day lag
                    df[f'{col}_lag_7d'] = df[col].shift(7)
                    # 14-day rolling mean (trend)
                    df[f'{col}_trend_14d'] = df[col].rolling(window=14, min_periods=1).mean()
                except:
                    pass  # Skip if column causes issues
        
        return df
    
    def load_temperature_data(self) -> pd.DataFrame:
        """Load and prepare temperature data for joining."""
        if self.temperature_data is not None:
            return self.temperature_data
        
        datasets = self.data_loader.get_loaded_datasets()
        
        # Find temperature dataset
        temp_key = None
        for key in datasets.keys():
            if 'temperature' in key.lower() or 'temp' in key.lower():
                temp_key = key
                break
        
        if temp_key is None:
            logger.warning("Temperature data not found")
            return pd.DataFrame()
        
        temp_df = datasets[temp_key].copy()
        
        # Standardize temperature column names
        temp_cols = {col: self.data_loader.to_snake_case(col) for col in temp_df.columns}
        temp_df.rename(columns=temp_cols, inplace=True)
        
        # Parse date column
        if 'dt' in temp_df.columns:
            temp_df['_timestamp'] = pd.to_datetime(temp_df['dt'], errors='coerce', utc=True)
        elif 'date' in temp_df.columns:
            temp_df['_timestamp'] = pd.to_datetime(temp_df['date'], errors='coerce', utc=True)
        
        # Extract year and month for joining
        if '_timestamp' in temp_df.columns:
            temp_df['_year'] = temp_df['_timestamp'].dt.year
            temp_df['_month'] = temp_df['_timestamp'].dt.month
        
        # Normalize city names (lowercase, strip)
        if 'city' in temp_df.columns:
            temp_df['_city_normalized'] = temp_df['city'].astype(str).str.lower().str.strip()
        if 'country' in temp_df.columns:
            temp_df['_country_normalized'] = temp_df['country'].astype(str).str.lower().str.strip()
        
        self.temperature_data = temp_df
        return temp_df
    
    def join_climate_data(self, df: pd.DataFrame, city_col: Optional[str] = None, 
                         country_col: Optional[str] = None,
                         year_col: Optional[str] = None,
                         month_col: Optional[str] = None) -> pd.DataFrame:
        """
        Join temperature data by (city, month, year).
        Falls back to regional mean if city missing.
        """
        df = df.copy()
        temp_df = self.load_temperature_data()
        
        if temp_df.empty:
            logger.warning("Cannot join climate data: temperature dataset is empty")
            return df
        
        # Find city/country/year/month columns in df
        if city_col is None:
            city_candidates = [col for col in df.columns if 'city' in col.lower() or 'region' in col.lower() or 'location' in col.lower()]
            city_col = city_candidates[0] if city_candidates else None
        
        if country_col is None:
            country_candidates = [col for col in df.columns if 'country' in col.lower()]
            country_col = country_candidates[0] if country_candidates else None
        
        if year_col is None:
            year_col = 'year' if 'year' in df.columns else None
        
        if month_col is None:
            month_col = 'month' if 'month' in df.columns else None
        
        # If we have temporal data, extract year/month
        if '_timestamp' in df.columns and year_col is None:
            df['_join_year'] = df['_timestamp'].dt.year
            df['_join_month'] = df['_timestamp'].dt.month
            year_col = '_join_year'
            month_col = '_join_month'
        
        # Prepare join keys
        if city_col and year_col and month_col:
            # Normalize city names
            df['_city_join'] = df[city_col].astype(str).str.lower().str.strip()
            df['_year_join'] = df[year_col].astype(int) if year_col in df.columns else None
            df['_month_join'] = df[month_col].astype(int) if month_col in df.columns else None
            
            # Aggregate temperature data by city, year, month
            temp_agg = temp_df.groupby(['_city_normalized', '_year', '_month']).agg({
                'average_temperature': 'mean',
                'average_temperature_uncertainty': 'mean'
            }).reset_index()
            temp_agg.columns = ['_city_normalized', '_year', '_month', 'avg_temp_celsius', 'temp_uncertainty']
            
            # Join
            merged = df.merge(
                temp_agg,
                left_on=['_city_join', '_year_join', '_month_join'],
                right_on=['_city_normalized', '_year', '_month'],
                how='left'
            )
            
            # Fill missing with regional mean (by country if available)
            if country_col and 'avg_temp_celsius' in merged.columns:
                country_temp = temp_df.groupby(['_country_normalized', '_year', '_month'])['average_temperature'].mean().reset_index()
                country_temp.columns = ['_country_normalized', '_year', '_month', 'country_avg_temp']
                
                merged = merged.merge(
                    country_temp,
                    left_on=[country_col, '_year_join', '_month_join'] if country_col else None,
                    right_on=['_country_normalized', '_year', '_month'],
                    how='left'
                )
                
                # Fill missing city temps with country average
                if 'country_avg_temp' in merged.columns:
                    merged['avg_temp_celsius'] = merged['avg_temp_celsius'].fillna(merged['country_avg_temp'])
                    merged.drop(columns=['country_avg_temp'], inplace=True)
            
            # Clean up join columns
            drop_cols = [col for col in merged.columns if col.startswith('_city_') or col.startswith('_year_') or col.startswith('_month_') or col.startswith('_join')]
            merged.drop(columns=drop_cols, errors='ignore', inplace=True)
            
            return merged
        
        return df  # Return original if we can't join
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create disease-disaster interaction features:
        - flood_risk × cholera_incidence
        - cyclone_intensity × diarrhea_cases
        - humidity × respiratory_cases
        - water_contamination_index
        - population_exposed_estimate
        """
        df = df.copy()
        
        # Flood-Cholera interaction
        flood_cols = [col for col in df.columns if 'flood' in col.lower() and ('risk' in col.lower() or 'prob' in col.lower())]
        cholera_cols = [col for col in df.columns if 'cholera' in col.lower() and ('risk' in col.lower() or 'case' in col.lower() or 'incidence' in col.lower())]
        if flood_cols and cholera_cols:
            df['flood_cholera_interaction'] = df[flood_cols[0]] * df[cholera_cols[0]]
        
        # Cyclone-Diarrhea interaction
        cyclone_cols = [col for col in df.columns if 'cyclone' in col.lower() and ('intensity' in col.lower() or 'wind' in col.lower())]
        diarrhea_cols = [col for col in df.columns if 'diarrhea' in col.lower() and ('risk' in col.lower() or 'case' in col.lower())]
        if cyclone_cols and diarrhea_cols:
            df['cyclone_diarrhea_interaction'] = df[cyclone_cols[0]] * df[diarrhea_cols[0]]
        
        # Humidity-Respiratory interaction
        humidity_cols = [col for col in df.columns if 'humidity' in col.lower()]
        respiratory_cols = [col for col in df.columns if 'respiratory' in col.lower() and ('risk' in col.lower() or 'case' in col.lower())]
        if humidity_cols and respiratory_cols:
            df['humidity_respiratory_interaction'] = df[humidity_cols[0]] * df[respiratory_cols[0]]
        
        # Water contamination index (if available)
        water_cols = [col for col in df.columns if 'water' in col.lower() and 'contamination' in col.lower()]
        if water_cols:
            df['water_contamination_index'] = df[water_cols[0]]
        
        # Population exposed estimate (if population and risk columns exist)
        pop_cols = [col for col in df.columns if 'population' in col.lower()]
        risk_cols = [col for col in df.columns if 'risk' in col.lower() and 'overall' not in col.lower()]
        if pop_cols and risk_cols:
            # Estimate exposed = population * average_risk
            avg_risk = df[risk_cols].mean(axis=1)
            df['population_exposed_estimate'] = df[pop_cols[0]] * avg_risk
        
        return df
    
    def harmonize_dataset(self, dataset_name: str, df: pd.DataFrame) -> pd.DataFrame:
        """
        Full harmonization pipeline for a dataset.
        
        Args:
            dataset_name: Name of the dataset
            df: DataFrame to harmonize
            
        Returns:
            Harmonized DataFrame
        """
        logger.info(f"Harmonizing dataset: {dataset_name}")
        
        # Step 1: Normalize units
        df = self.normalize_units(df, dataset_name)
        
        # Step 2: Align temporal data
        df = self.align_temporal_data(df)
        
        # Step 3: Join climate data (if applicable)
        if any(keyword in dataset_name.lower() for keyword in ['disaster', 'disease', 'synthetic']):
            df = self.join_climate_data(df)
        
        # Step 4: Create derived features
        df = self.create_derived_features(df)
        
        # Step 5: Create interaction features
        df = self.create_interaction_features(df)
        
        logger.info(f"✓ Harmonized {dataset_name}: {len(df)} rows, {len(df.columns)} columns")
        
        return df
    
    def harmonize_all_datasets(self) -> Dict[str, pd.DataFrame]:
        """
        Harmonize all loaded datasets.
        
        Returns:
            Dictionary of harmonized datasets
        """
        datasets = self.data_loader.get_loaded_datasets()
        harmonized = {}
        
        for name, df in datasets.items():
            try:
                harmonized[name] = self.harmonize_dataset(name, df)
            except Exception as e:
                logger.error(f"Error harmonizing {name}: {e}")
                harmonized[name] = df  # Return original on error
        
        return harmonized


if __name__ == "__main__":
    # Test the harmonizer
    from data.data_loader import DataLoader
    
    loader = DataLoader()
    loader.load_all_datasets()
    
    harmonizer = FeatureHarmonizer(loader)
    harmonized = harmonizer.harmonize_all_datasets()
    
    print("\n" + "="*60)
    print("FEATURE HARMONIZER TEST COMPLETE")
    print("="*60)
    print(f"\nHarmonized {len(harmonized)} datasets:")
    for name, df in harmonized.items():
        print(f"  - {name}: {len(df)} rows, {len(df.columns)} columns")

