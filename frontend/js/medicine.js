/**
 * MEDICINE FINDER - Clean NLP-Based Implementation
 * Simple keyword matching with reliable UI updates
 * No dependencies, no form submission issues
 */

// ====== MEDICINE DATABASE ======
const medicineDB = {
    fever: {
        medicines: ['Paracetamol', 'Ibuprofen'],
        dosage: '500mg every 6 hours',
        timing: 'After food',
        precautions: 'Stay hydrated, rest well'
    },
    headache: {
        medicines: ['Paracetamol', 'Aspirin'],
        dosage: '500mg as needed',
        timing: 'After food',
        precautions: 'Rest in a quiet place'
    },
    cough: {
        medicines: ['Dextromethorphan', 'Honey syrup'],
        dosage: '10ml twice daily',
        timing: 'After meals',
        precautions: 'Drink warm water frequently'
    },
    cold: {
        medicines: ['Cetirizine', 'Vitamin C'],
        dosage: '10mg once daily',
        timing: 'Before sleep',
        precautions: 'Avoid cold drinks, stay warm'
    },
    'body ache': {
        medicines: ['Ibuprofen', 'Paracetamol'],
        dosage: '400mg twice daily',
        timing: 'After food',
        precautions: 'Take with milk, avoid alcohol'
    },
    'back pain': {
        medicines: ['Ibuprofen', 'Diclofenac'],
        dosage: '400mg twice daily',
        timing: 'After food',
        precautions: 'Avoid heavy lifting, rest'
    },
    nausea: {
        medicines: ['Ondansetron', 'Ginger tea'],
        dosage: 'As needed',
        timing: 'Before meals',
        precautions: 'Eat light meals, stay hydrated'
    },
    throat: {
        medicines: ['Throat lozenges', 'Warm salt water'],
        dosage: 'As needed',
        timing: 'Multiple times daily',
        precautions: 'Gargle regularly, stay hydrated'
    }
};

// ====== HELPER FUNCTIONS ======

/**
 * Clean and normalize text
 */
function cleanText(text) {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

/**
 * Find matching medicine from database
 */
function findMedicine(input) {
    if (!input || input.trim() === '') {
        return { error: 'Please enter a symptom' };
    }

    const cleaned = cleanText(input);
    
    // Try exact match first
    if (medicineDB[cleaned]) {
        return { symptom: input, data: medicineDB[cleaned], found: true };
    }
    
    // Try partial match (if input contains a key)
    for (const [key, value] of Object.entries(medicineDB)) {
        if (cleaned.includes(key) || key.includes(cleaned)) {
            return { symptom: input, data: value, found: true };
        }
    }
    
    // No match found
    return { error: `No medicine found for "${input}"`, found: false };
}

/**
 * Display results in a nicely formatted card
 */
function displayResult(result) {
    const outputEl = document.getElementById('med_output');
    
    if (result.error) {
        outputEl.innerHTML = `
            <div style="padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; color: #fca5a5; font-size: 13px; text-align: center;">
                ${result.error}
            </div>
        `;
        return;
    }
    
    if (!result.found) {
        outputEl.innerHTML = `
            <div style="padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; color: #fca5a5; font-size: 13px; text-align: center;">
                No medicine found for this symptom
            </div>
        `;
        return;
    }
    
    const data = result.data;
    const medicinesList = data.medicines.map(m => `<div style="padding: 8px 12px; background: rgba(34,197,94,0.08); border-left: 3px solid #22c55e; border-radius: 4px; margin-bottom: 6px; color: #f1f5f9; font-size: 13px;">💊 ${m}</div>`).join('');
    
    outputEl.innerHTML = `
        <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 14px; backdrop-filter: blur(10px);">
            <h4 style="color: #22c55e; margin: 0 0 12px 0; font-size: 14px;">✓ Medicines for "${result.symptom}"</h4>
            
            <div style="margin-bottom: 10px;">
                <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 6px 0; font-weight: 500;">💊 Medicines:</p>
                ${medicinesList}
            </div>
            
            <div style="background: rgba(96,165,250,0.08); border-left: 2px solid #60a5fa; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px;">
                <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 4px 0;"><strong>📋 Dosage:</strong></p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">${data.dosage}</p>
            </div>
            
            <div style="background: rgba(34,197,94,0.08); border-left: 2px solid #22c55e; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px;">
                <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 4px 0;"><strong>⏰ When to Take:</strong></p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">${data.timing}</p>
            </div>
            
            <div style="background: rgba(245,158,11,0.08); border-left: 2px solid #f59e0b; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px;">
                <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 4px 0;"><strong>⚠️ Precautions:</strong></p>
                <p style="color: #fcd34d; font-size: 12px; margin: 0;">${data.precautions}</p>
            </div>
            
            <div style="background: rgba(245,158,11,0.08); border-left: 2px solid #f59e0b; padding: 8px 10px; border-radius: 4px; margin-top: 8px;">
                <p style="color: #fcd34d; font-size: 11px; margin: 0;"><strong>⚠️ DISCLAIMER:</strong> This is not a medical prescription. Consult a doctor before taking any medicine.</p>
            </div>
        </div>
    `;
}

// ====== MAIN HANDLER ======

function handleMedicineFinder() {
    const inputEl = document.getElementById('med_input');
    const symptom = inputEl.value;
    
    const result = findMedicine(symptom);
    displayResult(result);
    
    // Clear input for next search
    inputEl.value = '';
    inputEl.focus();
}

// ====== INITIALIZE ======

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('med_btn');
    const input = document.getElementById('med_input');
    const output = document.getElementById('med_output');
    
    if (!btn || !input || !output) {
        console.error('❌ Medicine Finder: Required elements not found');
        return;
    }
    
    // Click handler
    btn.addEventListener('click', handleMedicineFinder);
    
    // Enter key handler
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleMedicineFinder();
        }
    });
    
    console.log('✅ Medicine Finder initialized successfully');
});
