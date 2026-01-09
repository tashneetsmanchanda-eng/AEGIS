"""
Disease Outbreak Data Generator
Generates synthetic disease outbreak data correlated with flood conditions.
Based on WHO and CDC documented epidemiological correlations.
"""

import pandas as pd
import numpy as np
from pathlib import Path


def generate_disease_data(flood_df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    """
    Generate disease outbreak probabilities based on flood conditions.
    
    Disease correlations based on research:
    - Malaria: Stagnant water (monsoon + poor drainage) increases mosquito breeding
    - Cholera: Water contamination (flood severity + urban areas)
    - Leptospirosis: Flood duration + population exposure
    - Hepatitis A/E: Sanitation infrastructure damage
    """
    np.random.seed(seed)
    n_samples = len(flood_df)
    
    # Extract relevant features (normalize to 0-1 range for calculations)
    # Assuming features are in 1-10 scale based on the flood.csv structure
    monsoon = flood_df['MonsoonIntensity'].values / 10
    drainage = flood_df.get('DrainageSystems', pd.Series(np.random.randint(1, 11, n_samples))).values / 10
    
    # Get additional features if available, else generate reasonable proxies
    if 'Urbanization' in flood_df.columns:
        urbanization = flood_df['Urbanization'].values / 10
    else:
        urbanization = np.random.uniform(0.2, 0.9, n_samples)
    
    if 'Deforestation' in flood_df.columns:
        deforestation = flood_df['Deforestation'].values / 10
    else:
        deforestation = np.random.uniform(0.1, 0.8, n_samples)
    
    if 'Siltation' in flood_df.columns:
        siltation = flood_df['Siltation'].values / 10
    else:
        siltation = np.random.uniform(0.1, 0.7, n_samples)
    
    if 'IneffectiveDisasterPreparedness' in flood_df.columns:
        poor_preparedness = flood_df['IneffectiveDisasterPreparedness'].values / 10
    else:
        poor_preparedness = np.random.uniform(0.2, 0.8, n_samples)
    
    flood_prob = flood_df['FloodProbability'].values
    
    # --- Malaria Risk ---
    # Increases with stagnant water (poor drainage + high monsoon)
    # Research: 30% increased risk in flood-prone areas
    stagnant_water_factor = (1 - drainage) * monsoon
    temperature_factor = np.random.uniform(0.6, 1.0, n_samples)  # Tropical temps
    base_malaria = 0.15  # Base endemic rate
    malaria_risk = base_malaria + (0.35 * stagnant_water_factor * temperature_factor) + (0.20 * flood_prob)
    malaria_risk = np.clip(malaria_risk + np.random.normal(0, 0.05, n_samples), 0, 1)
    
    # --- Cholera Risk ---
    # Increases with water contamination and urban density
    # Spikes after infrastructure damage
    contamination_factor = flood_prob * (1 - drainage) * urbanization
    infrastructure_damage = poor_preparedness * flood_prob
    base_cholera = 0.05  # Base rate
    cholera_risk = base_cholera + (0.40 * contamination_factor) + (0.25 * infrastructure_damage)
    cholera_risk = np.clip(cholera_risk + np.random.normal(0, 0.03, n_samples), 0, 1)
    
    # --- Leptospirosis Risk ---
    # Increases with flood duration and population exposure
    # Often from contact with contaminated water
    exposure_factor = flood_prob * urbanization * (1 - drainage)
    environmental_factor = deforestation * siltation
    base_lepto = 0.03
    leptospirosis_risk = base_lepto + (0.30 * exposure_factor) + (0.15 * environmental_factor)
    leptospirosis_risk = np.clip(leptospirosis_risk + np.random.normal(0, 0.02, n_samples), 0, 1)
    
    # --- Hepatitis A/E Risk ---
    # Linked to sanitation breakdown and fecal-oral transmission
    sanitation_breakdown = poor_preparedness * flood_prob * (1 - drainage)
    overcrowding_factor = urbanization * flood_prob  # Displacement into shelters
    base_hepatitis = 0.02
    hepatitis_risk = base_hepatitis + (0.25 * sanitation_breakdown) + (0.15 * overcrowding_factor)
    hepatitis_risk = np.clip(hepatitis_risk + np.random.normal(0, 0.02, n_samples), 0, 1)
    
    # Create the disease dataset
    disease_df = pd.DataFrame({
        # Copy relevant features from flood data
        'MonsoonIntensity': flood_df['MonsoonIntensity'].values,
        'FloodProbability': flood_prob,
        'DrainageScore': drainage * 10,
        'UrbanizationScore': urbanization * 10,
        'DeforestationScore': deforestation * 10,
        'PreparednessScore': (1 - poor_preparedness) * 10,  # Invert so higher = better
        
        # Disease risk probabilities
        'MalariaRisk': malaria_risk,
        'CholeraRisk': cholera_risk,
        'LeptospirosisRisk': leptospirosis_risk,
        'HepatitisRisk': hepatitis_risk,
        
        # Overall disease outbreak risk (weighted average)
        'OverallDiseaseRisk': (
            0.35 * malaria_risk + 
            0.30 * cholera_risk + 
            0.20 * leptospirosis_risk + 
            0.15 * hepatitis_risk
        )
    })
    
    return disease_df


def main():
    """Generate and save disease outbreak data."""
    # Load flood data
    project_root = Path(__file__).parent.parent
    flood_path = project_root / "flood.csv"
    
    print(f"Loading flood data from: {flood_path}")
    flood_df = pd.read_csv(flood_path)
    print(f"Flood data shape: {flood_df.shape}")
    print(f"Columns: {list(flood_df.columns)}")
    
    # Generate disease data
    print("\nGenerating disease outbreak data...")
    disease_df = generate_disease_data(flood_df)
    print(f"Disease data shape: {disease_df.shape}")
    
    # Save to processed folder
    processed_dir = project_root / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = processed_dir / "disease_outbreak_data.csv"
    disease_df.to_csv(output_path, index=False)
    print(f"\nSaved disease data to: {output_path}")
    
    # Print summary statistics
    print("\n--- Disease Risk Summary ---")
    for col in ['MalariaRisk', 'CholeraRisk', 'LeptospirosisRisk', 'HepatitisRisk', 'OverallDiseaseRisk']:
        print(f"{col}: mean={disease_df[col].mean():.3f}, std={disease_df[col].std():.3f}")
    
    # Also create a combined dataset with all features
    combined_df = pd.concat([flood_df, disease_df.drop(columns=['MonsoonIntensity', 'FloodProbability'])], axis=1)
    combined_path = processed_dir / "combined_disaster_disease_data.csv"
    combined_df.to_csv(combined_path, index=False)
    print(f"\nSaved combined data to: {combined_path}")
    
    return disease_df


if __name__ == "__main__":
    main()
