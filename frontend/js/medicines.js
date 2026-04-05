// Global state for last prediction result
let lastPredictionResult = null;

// Function to store prediction result globally (called from symptom.js after API call)
function storePredictionResult(result) {
    lastPredictionResult = result;
    console.log('✓ Prediction stored for medicine display', result);
    
    // Immediately display medicines
    displayMedicines();
}

// Function to display medicines in Profile tab
function displayMedicines() {
    const medicinesSection = document.getElementById('medicines-section');
    
    if (!medicinesSection) {
        console.warn('⚠️ Medicines section element not found');
        return;
    }
    
    // If no prediction result exists, hide the section
    if (!lastPredictionResult || !lastPredictionResult.medicines) {
        medicinesSection.style.display = 'none';
        return;
    }
    
    const medicines = lastPredictionResult.medicines;
    
    // Check for emergency
    if (lastPredictionResult.emergency) {
        medicinesSection.innerHTML = `
            <div class="medicines-card" style="display: block; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1);">
                <div class="medicines-header" style="border-bottom-color: rgba(239, 68, 68, 0.3);">
                    <h3 style="color: #ef4444; margin: 0 0 8px 0; font-size: 24px;">🚨 MEDICAL EMERGENCY</h3>
                    <p class="medicines-disease" style="color: #fca5a5;">${lastPredictionResult.message}</p>
                </div>
                <div class="medicines-disclaimer">
                    <p>⚠️ <strong>EMERGENCY:</strong> Call emergency services immediately - 911 or 108</p>
                </div>
            </div>
        `;
        medicinesSection.style.display = 'block';
        return;
    }
    
    // Show the medicines section
    medicinesSection.style.display = 'block';
    
    // Update disease name
    document.getElementById('medicines-disease-name').textContent = medicines.disease || '--';
    
    // Update medicines list
    const medicinesList = document.getElementById('medicines-list');
    if (medicines.medicines && Array.isArray(medicines.medicines) && medicines.medicines.length > 0) {
        medicinesList.innerHTML = medicines.medicines
            .map(med => `<div class="medicines-list-item">💊 ${med}</div>`)
            .join('');
    } else {
        medicinesList.innerHTML = '<p style="color: #94a3b8;">Consult your doctor for prescription</p>';
    }
    
    // Update dosage
    document.getElementById('medicines-dosage').textContent = medicines.dosage || 'As advised by physician';
    
    // Update timing
    document.getElementById('medicines-timing').textContent = medicines.timing || 'As per doctor\'s guidance';
    
    // Update precautions
    document.getElementById('medicines-precautions').textContent = medicines.precautions || 'Follow medical professional\'s advice';
    
    // Update explanation
    document.getElementById('medicines-explanation').textContent = medicines.explanation || 'Based on standard treatment guidelines';
    
    console.log('✓ Medicines section displayed successfully');
}

// Hook into switchTab to display medicines when Profile tab is opened
function setupMedicinesTabHook() {
    // Intercept tab switching
    const originalSwitchTab = window.switchTab;
    
    window.switchTab = function(tabName, event) {
        // Call original switchTab function
        originalSwitchTab.call(this, tabName, event);
        
        // If switching to profile tab, display medicines
        if (tabName === 'profile') {
            setTimeout(() => {
                displayMedicines();
            }, 100);
        }
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Medicines system initialized');
    
    // Setup tab hook
    setupMedicinesTabHook();
    
    // Display medicines if on profile tab on load
    const profileTab = document.getElementById('profile-tab');
    if (profileTab && profileTab.classList.contains('active')) {
        setTimeout(() => {
            displayMedicines();
        }, 200);
    }
});

// Export functions for use in other scripts
window.storePredictionResult = storePredictionResult;
window.displayMedicines = displayMedicines;
