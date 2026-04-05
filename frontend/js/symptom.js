let symptomContext = new Set();

async function checkSymptoms(e) {
    // Prevent form submission and stop event propagation
    e.preventDefault();
    e.stopPropagation();
    
    const inputEl = document.getElementById('symptoms-input');
    const symptoms = inputEl.value.trim();
    
    if (!symptoms) {
        alert("Please enter your symptoms to continue.");
        return;
    }

    const resultDiv = document.getElementById('symptom-result');
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerText;

    // Disable button and show loading
    btn.disabled = true;
    btn.innerText = "🧠 Analyzing...";
    
    // Show loading animation
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;">
            <div style="font-size: 48px; margin-bottom: 20px; animation: spin 2s linear infinite;">🧠</div>
            <div style="color: #10B981; font-weight: 700; font-size: 18px;">Analyzing your symptoms...</div>
            <div style="color: #94a3b8; font-size: 14px; margin-top: 10px;">Using AI medical database</div>
        </div>
        <style>
            @keyframes spin { 100% { transform: rotate(360deg); } }
        </style>
    `;
    resultDiv.classList.add('show');
    
    try {
        const response = await fetch('https://arogya-ai-care-1.onrender.com/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                symptoms: symptoms,
                context_symptoms: Array.from(symptomContext) 
            })
        });
        
        const data = await response.json();
        
        // Re-enable button
        btn.disabled = false;
        btn.innerText = originalBtnText;
        
        if (data.error) {
            resultDiv.innerHTML = `<div style="padding:20px; color: #fca5a5; background:rgba(239,68,68,0.1); border-radius:12px; border: 1px solid rgba(239,68,68,0.3);">❌ Error: ${data.error}</div>`;
            return;
        }

        if (data.emergency) {
            resultDiv.innerHTML = `
                <div style="border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.15); padding: 20px; border-radius: 12px;">
                    <h3 style="color:#ef4444; margin:0 0 10px 0;"><span>🚨</span> MEDICAL EMERGENCY</h3>
                    <p style="color:#f8fafc; margin:10px 0;">${data.message}</p>
                </div>
            `;
            // Store even emergency for reference
            if (typeof storePredictionResult === 'function') {
                storePredictionResult(data);
            }
            return;
        }
        
        if (!data.success) {
            resultDiv.innerHTML = `<div style="padding:20px; color: #94a3b8; background:rgba(255,255,255,0.05); border-radius:12px;">Please describe your symptoms more clearly (e.g., "fever and headache")</div>`;
            return;
        }

        // Update context
        if (data.extracted_symptoms) {
            data.extracted_symptoms.forEach(s => symptomContext.add(s));
        }

        // Build result HTML - DISEASE PREDICTION ONLY
        const predictions = data.predictions || [];
        const preds_html = predictions.map(p => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #60A5FA;">
                <span style="color:#f8fafc; font-weight:600;">${p.name}</span>
                <span style="color:#60A5FA; font-weight:700; background:rgba(96,165,250,0.1); padding:4px 10px; border-radius:12px;">${p.probability}%</span>
            </div>
        `).join('');
        
        const precautions_html = (data.precautions || []).map(p => `<li style="margin: 8px 0;">${p}</li>`).join('');
        
        resultDiv.innerHTML = `
            <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px);">
                <h3 style="color: #10B981; margin: 0 0 16px 0; font-size: 20px;">✅ Analysis Complete</h3>
                
                <div style="margin-bottom: 20px;">
                    <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Possible Conditions:</strong></p>
                    ${preds_html}
                </div>
                
                ${data.description ? `
                <div style="margin-bottom: 20px; padding: 12px; background: rgba(96,165,250,0.1); border-left: 3px solid #60A5FA; border-radius: 8px;">
                    <p style="color: #cbd5e1; margin: 0;"><strong>About this:</strong> ${data.description}</p>
                </div>
                ` : ''}
                
                ${precautions_html ? `
                <div style="margin-bottom: 20px;">
                    <p style="color: #cbd5e1; margin: 0 0 10px 0;"><strong>🏥 Recommended Actions:</strong></p>
                    <ul style="color: #94a3b8; margin: 0; padding-left: 20px;">
                        ${precautions_html}
                    </ul>
                </div>
                ` : ''}
                
                <div style="background: rgba(245,158,11,0.1); padding: 12px 14px; border-radius: 8px; border-left: 3px solid #F59E0B;">
                    <p style="color: #FCD34D; margin: 0; font-size: 13px;"><strong>⚠️ NOTE:</strong> This is AI-based disease analysis for informational purposes. Always consult a qualified healthcare professional for proper diagnosis and treatment.</p>
                </div>
            </div>
        `;
        
    } catch(err) {
        btn.disabled = false;
        btn.innerText = originalBtnText;
        resultDiv.innerHTML = `<div style="padding:20px; color: #fca5a5; background:rgba(239,68,68,0.1); border-radius:12px;">❌ Connection Error: ${err.message}</div>`;
        console.error('Fetch error:', err);
    }
}

function clearSymptomContext() {
    symptomContext.clear();
    document.getElementById('symptom-result').innerHTML = '<p style="text-align: center; color: #94a3b8;">Context cleared. Start a new diagnosis.</p>';
}
