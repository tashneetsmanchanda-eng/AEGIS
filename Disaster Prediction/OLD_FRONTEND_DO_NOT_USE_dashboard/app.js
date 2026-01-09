/**
 * Disaster & Disease Prediction Dashboard
 * JavaScript Application Logic
 */

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// State
let isLoading = false;

// DOM Elements
const form = document.getElementById('prediction-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
    initializeNavigation();
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
});

/**
 * Initialize range sliders with value display
 */
function initializeSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}_val`);
        
        // Set initial value
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
        
        // Update on change
        slider.addEventListener('input', () => {
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;
            }
        });
    });
}

/**
 * Initialize navigation buttons
 */
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;
            
            // Update buttons
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update views
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${targetView}-view`).classList.add('active');
        });
    });
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    setLoading(true);
    
    // Collect form data
    const formData = new FormData(form);
    const requestData = {
        monsoon_intensity: parseFloat(formData.get('monsoon_intensity')),
        topography_drainage: parseFloat(formData.get('topography_drainage')),
        river_management: parseFloat(formData.get('river_management')),
        deforestation: parseFloat(formData.get('deforestation')),
        urbanization: parseFloat(formData.get('urbanization')),
        climate_change: parseFloat(formData.get('climate_change')),
        drainage_systems: parseFloat(formData.get('drainage_systems')),
        disaster_preparedness: parseFloat(formData.get('disaster_preparedness')),
        siltation: parseFloat(formData.get('siltation')),
        deteriorating_infrastructure: parseFloat(formData.get('deteriorating_infrastructure')),
        coastal_vulnerability: 5,
        landslides: 5,
        watersheds: 5,
        population_score: 5,
        wetland_loss: 5,
        inadequate_planning: 5,
        political_factors: 5
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict/combined`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        updateResults(result);
        showToast('Prediction completed successfully!', 'success');
        
    } catch (error) {
        console.error('Prediction error:', error);
        showToast(`Error: ${error.message}. Make sure the API server is running.`, 'error');
        
        // Show demo data if API is unavailable
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showDemoResults(requestData);
        }
    } finally {
        setLoading(false);
    }
}

/**
 * Update results display
 */
function updateResults(result) {
    // Update flood gauge
    updateFloodGauge(result.flood_probability, result.flood_risk_level);
    
    // Update disease risks
    updateDiseaseRisks(result.disease_risks, result.overall_disease_risk, result.disease_risk_level);
    
    // Update recommendations
    updateRecommendations(result.recommendations);
}

/**
 * Update flood gauge visualization
 */
function updateFloodGauge(probability, riskLevel) {
    const gaugeValue = document.getElementById('flood-value');
    const gaugeLevel = document.getElementById('flood-level');
    const gaugeFill = document.getElementById('flood-gauge-fill');
    
    // Update text
    gaugeValue.textContent = `${Math.round(probability * 100)}%`;
    gaugeLevel.textContent = riskLevel;
    
    // Update gauge arc
    // The arc length for the gauge is approximately 251.2 (half circle with radius 80)
    const arcLength = 251.2;
    const fillLength = arcLength * probability;
    gaugeFill.style.strokeDasharray = `${fillLength} ${arcLength}`;
    
    // Update color based on risk level
    const riskColors = {
        'LOW': '#10b981',
        'MODERATE': '#f59e0b',
        'HIGH': '#f97316',
        'VERY HIGH': '#ef4444',
        'CRITICAL': '#dc2626'
    };
    
    gaugeLevel.style.color = riskColors[riskLevel] || '#94a3b8';
}

/**
 * Update disease risks display
 */
function updateDiseaseRisks(diseases, overallRisk, riskLevel) {
    const diseaseMap = {
        'malaria': 'malaria-risk',
        'cholera': 'cholera-risk',
        'leptospirosis': 'leptospirosis-risk',
        'hepatitis': 'hepatitis-risk'
    };
    
    Object.entries(diseases).forEach(([disease, risk]) => {
        const element = document.getElementById(diseaseMap[disease]);
        if (element) {
            const bar = element.querySelector('.disease-bar-fill');
            const value = element.querySelector('.disease-value');
            
            bar.style.width = `${risk * 100}%`;
            value.textContent = `${Math.round(risk * 100)}%`;
            
            // Color based on risk
            if (risk > 0.5) {
                bar.style.background = 'linear-gradient(90deg, #f97316, #ef4444)';
            } else if (risk > 0.3) {
                bar.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
            } else {
                bar.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
            }
        }
    });
    
    // Update overall risk
    const overallValue = document.getElementById('overall-disease-value');
    const overallLevel = document.getElementById('overall-disease-level');
    
    overallValue.textContent = `${Math.round(overallRisk * 100)}%`;
    overallLevel.textContent = riskLevel;
    
    // Set level class
    overallLevel.className = 'overall-level';
    if (riskLevel === 'LOW') overallLevel.classList.add('low');
    else if (riskLevel === 'MODERATE') overallLevel.classList.add('moderate');
    else if (riskLevel === 'HIGH' || riskLevel === 'VERY HIGH') overallLevel.classList.add('high');
    else overallLevel.classList.add('critical');
}

/**
 * Update recommendations list
 */
function updateRecommendations(recommendations) {
    const list = document.getElementById('recommendations-list');
    list.innerHTML = '';
    
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

/**
 * Show demo results when API is unavailable
 */
function showDemoResults(input) {
    // Generate demo predictions based on input
    const monsoon = input.monsoon_intensity / 10;
    const drainage = input.drainage_systems / 10;
    const preparedness = input.disaster_preparedness / 10;
    
    const floodProb = Math.min(0.95, Math.max(0.05, 
        0.3 + (monsoon * 0.3) - (drainage * 0.2) - (preparedness * 0.15) + (Math.random() * 0.1)
    ));
    
    const malariaRisk = Math.min(0.9, Math.max(0.05, floodProb * 0.6 + (1 - drainage) * 0.2));
    const choleraRisk = Math.min(0.9, Math.max(0.03, floodProb * 0.5 + (1 - drainage) * 0.15));
    const leptoRisk = Math.min(0.8, Math.max(0.02, floodProb * 0.4));
    const hepatitisRisk = Math.min(0.7, Math.max(0.02, floodProb * 0.3 + (1 - preparedness) * 0.1));
    
    const overallRisk = (malariaRisk + choleraRisk + leptoRisk + hepatitisRisk) / 4;
    
    const getRiskLevel = (prob) => {
        if (prob < 0.2) return 'LOW';
        if (prob < 0.4) return 'MODERATE';
        if (prob < 0.6) return 'HIGH';
        if (prob < 0.8) return 'VERY HIGH';
        return 'CRITICAL';
    };
    
    const demoResult = {
        flood_probability: floodProb,
        flood_risk_level: getRiskLevel(floodProb),
        disease_risks: {
            malaria: malariaRisk,
            cholera: choleraRisk,
            leptospirosis: leptoRisk,
            hepatitis: hepatitisRisk
        },
        overall_disease_risk: overallRisk,
        disease_risk_level: getRiskLevel(overallRisk),
        recommendations: generateDemoRecommendations(floodProb, malariaRisk, choleraRisk)
    };
    
    updateResults(demoResult);
    showToast('Showing demo predictions (API offline)', 'warning');
}

/**
 * Generate demo recommendations
 */
function generateDemoRecommendations(floodProb, malariaRisk, choleraRisk) {
    const recs = [];
    
    if (floodProb > 0.5) {
        recs.push('⚠️ High flood risk - activate emergency protocols');
        recs.push('🏠 Prepare evacuation routes and shelters');
    } else if (floodProb > 0.3) {
        recs.push('📢 Monitor water levels closely');
    }
    
    if (malariaRisk > 0.3) {
        recs.push('🦟 Deploy mosquito control measures (larva control, nets)');
    }
    
    if (choleraRisk > 0.2) {
        recs.push('💧 Ensure water chlorination and purification');
    }
    
    if (recs.length === 0) {
        recs.push('✅ Risk levels are low - maintain standard monitoring');
    }
    
    return recs;
}

/**
 * Set loading state
 */
function setLoading(loading) {
    isLoading = loading;
    submitBtn.disabled = loading;
    
    if (loading) {
        btnText.hidden = true;
        btnLoader.hidden = false;
    } else {
        btnText.hidden = false;
        btnLoader.hidden = true;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
