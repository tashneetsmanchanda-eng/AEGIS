"""
Mock ML Engine - Simulates the main project's ML outputs
"""


def get_current_risk():
    """
    Simulates ML model output for crisis risk assessment.
    
    Returns:
        dict: Current risk assessment with city, flood risk, predicted disease, and confidence
    """
    return {
        'city': 'Miami',
        'flood_risk': 0.85,
        'predicted_disease': 'Cholera',
        'confidence': 0.92
    }

