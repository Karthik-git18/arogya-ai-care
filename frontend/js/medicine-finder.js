// Medicine Finder - Independent NLP-based medicine lookup
// No dependency on disease prediction

async function findMedicines() {
    console.log('🏥 MEDICINE FINDER: Button clicked!');
    
    // Get elements
    const inputEl = document.getElementById('medicine-symptom-input');
    const resultDiv = document.getElementById('medicine-result');
    const btn = document.querySelector('button[onclick="findMedicines()"]');
    
    console.log('📝 INPUT ELEMENT:', inputEl ? '✓ FOUND' : '❌ NOT FOUND');
    console.log('📊 RESULT DIV:', resultDiv ? '✓ FOUND' : '❌ NOT FOUND');
    console.log('🔘 BUTTON:', btn ? '✓ FOUND' : '❌ NOT FOUND');
    
    // Validate elements exist
    if (!inputEl) {
        console.error('❌ Input element with ID "medicine-symptom-input" not found!');
        return;
    }
    if (!resultDiv) {
        console.error('❌ Result div with ID "medicine-result" not found!');
        return;
    }
    
    const symptom = inputEl.value.trim();
    console.log('📝 SYMPTOM ENTERED:', symptom);
    
    if (!symptom) {
        console.warn('⚠️ Empty symptom - showing alert');
        resultDiv.innerHTML = `
            <div style="padding: 16px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; color: #FCD34D;">
                <strong>⚠️ Please enter a symptom first</strong>
            </div>
        `;
        return;
    }
    
    const originalBtnText = btn ? btn.innerText : "Get Medicine 💊";
    console.log('✓ ALL ELEMENTS FOUND, PROCEEDING...');
    
    // Show loading state
    if (btn) {
        btn.disabled = true;
        btn.innerText = "🔍 Searching...";
    }
    
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;">
            <div style="font-size: 40px; margin-bottom: 16px; animation: spin 2s linear infinite;">💊</div>
            <div style="color: #10B981; font-weight: 700; font-size: 16px;">Finding medicines...</div>
        </div>
        <style>
            @keyframes spin { 100% { transform: rotate(360deg); } }
        </style>
    `;
    
    try {
        console.log('🔄 FETCHING MEDICINES FOR:', symptom);
        
        const response = await fetch('http://localhost:5001/api/medicines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptom: symptom })
        });
        
        console.log('📡 RESPONSE STATUS:', response.status);
        
        const data = await response.json();
        console.log('📊 RESPONSE DATA:', data);
        
        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalBtnText;
        }
        
        if (data.error || !data.success) {
            console.error('❌ ERROR FROM API:', data.error);
            resultDiv.innerHTML = `
                <div style="padding: 20px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; color: #fca5a5;">
                    <p style="margin: 0; font-weight: 500;">❌ ${data.error || 'No medicine data available'}</p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1;">Please consult a healthcare professional.</p>
                </div>
            `;
            return;
        }
        
        console.log('✅ SUCCESS - RENDERING RESULTS');
        
        // Display medicine data
        const medicines = data.medicines || {};
        const medicinesList = medicines.medicines || [];
        
        const medicinesHtml = medicinesList.length > 0
            ? medicinesList.map(med => `<div style="background: rgba(34,197,94,0.1); border-left: 3px solid #10B981; padding: 10px 14px; border-radius: 6px; color: #F1F5F9; font-weight: 500; margin-bottom: 8px;">💊 ${med}</div>`).join('')
            : '<div style="color: #94a3b8;">Information not available</div>';
        
        console.log('🎨 RENDERING RESULTS NOW');
        
        resultDiv.innerHTML = `
            <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(34,197,94,0.3); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px);">
                <h3 style="color: #10B981; margin: 0 0 16px 0; font-size: 20px;">✅ Medicines for "${data.symptom}"</h3>
                
                <div style="margin-bottom: 16px;">
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 8px 0;"><strong>💊 Medicines:</strong></p>
                    ${medicinesHtml}
                </div>
                
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(96,165,250,0.1); border-left: 3px solid #60A5FA; border-radius: 8px;">
                    <p style="color: #cbd5e1; margin: 0 0 4px 0; font-size: 14px;"><strong>📋 Dosage:</strong></p>
                    <p style="color: #CBD5E1; margin: 0; font-size: 13px;">${medicines.dosage || 'As advised by physician'}</p>
                </div>
                
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(34,197,94,0.1); border-left: 3px solid #10B981; border-radius: 8px;">
                    <p style="color: #cbd5e1; margin: 0 0 4px 0; font-size: 14px;"><strong>⏰ When to Take:</strong></p>
                    <p style="color: #CBD5E1; margin: 0; font-size: 13px;">${medicines.timing || 'As per guidance'}</p>
                </div>
                
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(245,158,11,0.1); border-left: 3px solid #F59E0B; border-radius: 8px;">
                    <p style="color: #cbd5e1; margin: 0 0 4px 0; font-size: 14px;"><strong>⚠️ Precautions:</strong></p>
                    <p style="color: #FCD34D; margin: 0; font-size: 13px;">${medicines.precautions || 'Follow medical advice'}</p>
                </div>
                
                <div style="background: rgba(245,158,11,0.1); padding: 12px 14px; border-radius: 8px; border-left: 3px solid #F59E0B;">
                    <p style="color: #FCD34D; margin: 0; font-size: 12px;"><strong>⚠️ DISCLAIMER:</strong> This is NOT a medical prescription. Consult a doctor before taking any medicine.</p>
                </div>
            </div>
        `;
        
        console.log('✅ RESULTS DISPLAYED SUCCESSFULLY');
        
    } catch(err) {
        console.error('🔴 CATCH ERROR - EXCEPTION OCCURRED:', err);
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalBtnText;
        }
        resultDiv.innerHTML = `
            <div style="padding: 20px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px;">
                <p style="color: #fca5a5; margin: 0; font-weight: 500;">❌ Connection Error</p>
                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 13px;">${err.message}</p>
                <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 12px;">Check the browser console (F12) for details.</p>
            </div>
        `;
        console.error('🔴 FULL ERROR:', err.stack);
    }
}

// Initialize on page load
console.log('📂 MEDICINE FINDER SCRIPT LOADED');
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PAGE DOM LOADED - INITIALIZING MEDICINE FINDER');
    console.log('✓ findMedicines function available:', typeof findMedicines === 'function');
    
    // Try to find by input ID
    const input = document.getElementById('medicine-symptom-input');
    if (input) {
        console.log('✓ Input element FOUND with ID: medicine-symptom-input');
    } else {
        console.error('❌ Input element NOT found with ID: medicine-symptom-input');
    }
    
    // Try to find result div
    const resultDiv = document.getElementById('medicine-result');
    if (resultDiv) {
        console.log('✓ Result div FOUND with ID: medicine-result');
    } else {
        console.error('❌ Result div NOT found with ID: medicine-result');
    }
    
    // Try to find button
    const btn = document.querySelector('button[onclick="findMedicines()"]');
    if (btn) {
        console.log('✓ Button FOUND with onclick handler');
    } else {
        console.error('❌ Button NOT found');
    }
    
    console.log('✅ INITIALIZATION COMPLETE - READY FOR INPUT');
});
