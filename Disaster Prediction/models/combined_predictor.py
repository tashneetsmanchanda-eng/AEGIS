import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any
import joblib
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))


class CombinedPredictor:
    
    def __init__(self, flood_model=None, disease_model=None, 
                 flood_pipeline=None, disease_pipeline=None):
        self.flood_model = flood_model
        self.disease_model = disease_model
        self.flood_pipeline = flood_pipeline
        self.disease_pipeline = disease_pipeline
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        
        flood_features = pd.DataFrame([input_data])
        
        for col in self.flood_pipeline.feature_columns:
            if col not in flood_features.columns:
                flood_features[col] = 5 
        
        flood_features = flood_features[self.flood_pipeline.feature_columns]
        X_flood = self.flood_pipeline.scaler.transform(flood_features.values)
        flood_prob = float(self.flood_model.predict(X_flood)[0])

        disease_input = {
            'MonsoonIntensity': input_data.get('MonsoonIntensity', 5),
            'FloodProbability': flood_prob,
            'DrainageScore': input_data.get('DrainageScore', 
                                            input_data.get('DrainageSystems', 5)),
            'UrbanizationScore': input_data.get('UrbanizationScore',
                                                input_data.get('Urbanization', 5)),
            'DeforestationScore': input_data.get('DeforestationScore',
                                                 input_data.get('Deforestation', 5)),
            'PreparednessScore': input_data.get('PreparednessScore', 5)
        }
        
        disease_features = pd.DataFrame([disease_input])
        disease_features = disease_features[self.disease_pipeline.feature_columns]
        X_disease = self.disease_pipeline.scaler.transform(disease_features.values)

        disease_predictions = self.disease_model.predict(X_disease)[0]

        result = {
            'flood_probability': flood_prob,
            'flood_risk_level': self._get_risk_level(flood_prob),
            'disease_risks': {
                'malaria': float(disease_predictions[0]),
                'cholera': float(disease_predictions[1]),
                'leptospirosis': float(disease_predictions[2]),
                'hepatitis': float(disease_predictions[3])
            },
            'overall_disease_risk': float(np.mean(disease_predictions)),
            'disease_risk_level': self._get_risk_level(np.mean(disease_predictions)),
            'recommendations': self._get_recommendations(flood_prob, disease_predictions)
        }
        
        return result
    
    def _get_risk_level(self, probability: float) -> str:
        
        if probability < 0.2:
            return 'LOW'
        elif probability < 0.4:
            return 'MODERATE'
        elif probability < 0.6:
            return 'HIGH'
        elif probability < 0.8:
            return 'VERY HIGH'
        else:
            return 'CRITICAL'
    
    def _get_recommendations(self, flood_prob: float, disease_risks: np.ndarray) -> list:
        
        recommendations = []
      
        if flood_prob > 0.5:
            recommendations.append("⚠️ High flood risk - activate emergency protocols")
            recommendations.append("🏠 Prepare evacuation routes and shelters")
        elif flood_prob > 0.3:
            recommendations.append("📢 Monitor water levels closely")
            recommendations.append("🏗️ Check drainage infrastructure")
        
        malaria, cholera, lepto, hepatitis = disease_risks
        
        if malaria > 0.3:
            recommendations.append("🦟 Deploy mosquito control measures (larva control, nets)")
            recommendations.append("💊 Stock antimalarial medications")
        
        if cholera > 0.2:
            recommendations.append("💧 Ensure water chlorination and purification")
            recommendations.append("🏥 Prepare oral rehydration supplies")
        
        if lepto > 0.2:
            recommendations.append("👢 Distribute protective gear for flood cleanup")
            recommendations.append("🐀 Implement rodent control measures")
        
        if hepatitis > 0.2:
            recommendations.append("🧼 Enhance sanitation and hygiene facilities")
            recommendations.append("💉 Consider hepatitis vaccination campaigns")
        
        if not recommendations:
            recommendations.append("✅ Risk levels are low - maintain standard monitoring")
        
        return recommendations
    
    def save(self, path: Path):
        joblib.dump(self, path)
        
    @classmethod
    def load(cls, path: Path) -> 'CombinedPredictor':
        return joblib.load(path)
    
    @classmethod
    def from_saved_models(cls, models_dir: Path) -> 'CombinedPredictor':
        from models.flood_model import FloodPredictor
        from models.disease_model import DiseasePredictor
        from data.feature_pipeline import FeaturePipeline
        
        flood_model = FloodPredictor.load(models_dir / "flood_model.joblib")
        disease_model = DiseasePredictor.load(models_dir / "disease_model.joblib")
        flood_pipeline = FeaturePipeline.load(models_dir / "flood_pipeline.joblib")
        disease_pipeline = FeaturePipeline.load(models_dir / "disease_pipeline.joblib")
        
        return cls(flood_model, disease_model, flood_pipeline, disease_pipeline)


def build_and_save():
    project_root = Path(__file__).parent.parent
    models_dir = project_root / "models" / "saved"
    
    print("Loading trained models...")
    predictor = CombinedPredictor.from_saved_models(models_dir)
    
    print("\n--- Test Prediction ---")
    test_input = {
        'MonsoonIntensity': 8,
        'TopographyDrainage': 3,
        'RiverManagement': 4,
        'Deforestation': 7,
        'Urbanization': 6,
        'DrainageSystems': 3,
        'IneffectiveDisasterPreparedness': 7,
        'Siltation': 5
    }
    
    result = predictor.predict(test_input)
    
    print(f"\nFlood Probability: {result['flood_probability']:.2%}")
    print(f"Flood Risk Level: {result['flood_risk_level']}")
    print(f"\nDisease Risks:")
    for disease, risk in result['disease_risks'].items():
        print(f"  {disease.capitalize()}: {risk:.2%}")
    print(f"\nOverall Disease Risk: {result['overall_disease_risk']:.2%}")
    print(f"Disease Risk Level: {result['disease_risk_level']}")
    print(f"\nRecommendations:")
    for rec in result['recommendations']:
        print(f"  {rec}")
    
    predictor.save(models_dir / "combined_predictor.joblib")
    print(f"\n✓ Combined predictor saved to: {models_dir / 'combined_predictor.joblib'}")
    
    return predictor


if __name__ == "__main__":
    build_and_save()
