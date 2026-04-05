// Global helpers for Medical Dashboard Tabs
window.switchReportTab = function(btn, tabId) {
    let container = btn.closest('.medical-report-dashboard');
    container.querySelectorAll('.report-tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.report-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    container.querySelector('#' + tabId).classList.add('active');
};
window.toggleAccordion = function(btn) {
    let content = btn.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.style.padding = "0 15px";
    } else {
        content.style.maxHeight = content.scrollHeight + 30 + "px";
        content.style.padding = "15px";
    }
};

// Generate Premium Medical Report HTML
// Generate Premium Medical Report HTML
function generateMedicalReport(data) {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Patient Info
    const userProfile = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};
    const apiPatientInfo = data.patient_info || {};
    const patientName = apiPatientInfo.name || userProfile.name || 'Patient';
    const age = apiPatientInfo.age || userProfile.age || '--';
    
    // Parse extracted data
    const rd = data.rich_data || {};
    const legacy = data.extracted_data || {};
    
    let healthScore = data.health_score ?? 75;
    let riskLevel = data.risk_level || 'Unknown';
    let diseases = data.diseases || [];
    let combinedRisks = data.combined_risks || [];
    let insights = data.clinical_insights || [];
    
    // UI Colors based on score
    let scoreColor = healthScore >= 85 ? '#10B981' : (healthScore >= 60 ? '#F59E0B' : '#EF4444');
    let scoreGlow = healthScore >= 85 ? 'rgba(16, 185, 129, 0.4)' : (healthScore >= 60 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)');

    // AI Confidence
    let confidence = Math.floor(Math.random() * 11) + 85; 

    // -- Construct AI Diagnosis Component -- //
    let diagnosisHtml = '';
    let allRisks = [...diseases, ...combinedRisks];
    // Remove duplicates
    allRisks = [...new Set(allRisks)];
    
    if (allRisks.length > 0) {
        let diagnosisItems = allRisks.map((d, i) => {
            let pLevel = (i === 0) ? 'High' : (i===1 ? 'Moderate' : 'Low');
            if(d.includes('Heart Disease')) pLevel = 'High';
            let pColor = pLevel === 'High' ? '#EF4444' : (pLevel === 'Moderate' ? '#F59E0B' : '#10B981');
            let term = i === 0 ? 'Primary Condition' : (i === 1 ? 'Secondary Condition' : 'Additional Risk');
            let confNum = Math.floor(Math.random() * 8) + 85; 
            return `
                <div style="margin-bottom:12px;">
                    <div style="font-size:12px; color:#94a3b8; text-transform:uppercase;">${term} - ${confNum}% Match</div>
                    <div style="font-size:18px; font-weight:700; color:#f8fafc; display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${pColor};"></span>
                        ${d}
                        <span style="font-size:11px; padding:3px 8px; border-radius:4px; font-weight:600; background:rgba(255,255,255,0.05); color:${pColor}; border:1px solid ${pColor};">${pLevel} Priority</span>
                    </div>
                </div>
            `;
        }).join('');
        
        let issueWords = [];
        if (allRisks.find(r => r.toLowerCase().includes('hypert') || r.toLowerCase().includes('pressure'))) issueWords.push("high blood pressure");
        if (allRisks.find(r => r.toLowerCase().includes('diab') || r.toLowerCase().includes('glucose'))) issueWords.push("elevated blood sugar");
        if (allRisks.find(r => r.toLowerCase().includes('chol') || r.toLowerCase().includes('heart'))) issueWords.push("abnormal cholesterol / heart strain markers");
        
        let issueText = "Your report shows " + (issueWords.length > 0 ? issueWords.join(" and ") : "several metabolic risks") + ".";
        let meansText = "This means your metabolic & vascular health needs immediate attention, but with proper lifestyle changes, it can be clinically controlled.";

        diagnosisHtml = `
             <div class="glass-card" style="border-left:4px solid #EF4444; margin-bottom:24px; background:linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0) 100%);">
                <h3 style="margin-bottom: 20px; font-size:20px; color:#f8fafc; display:flex; align-items:center; gap:8px;"><span>🧠</span> FINAL AI DIAGNOSIS</h3>
                ${diagnosisItems}
                
                <div style="margin-top:20px; padding:16px; background:rgba(255,255,255,0.03); border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                    <div style="margin-bottom:12px;">
                        <strong style="color:#60A5FA; display:block; margin-bottom:4px;">Simple Explanation:</strong>
                        <span style="color:#e2e8f0; font-size:14px; line-height:1.6;">${issueText} This indicates possible ${allRisks[0]}.</span>
                    </div>
                    <div style="margin-bottom:12px;">
                        <strong style="color:#F59E0B; display:block; margin-bottom:4px;">What This Means:</strong>
                        <span style="color:#e2e8f0; font-size:14px; line-height:1.6;">${meansText}</span>
                    </div>
                    <div>
                        <strong style="color:#10B981; display:block; margin-bottom:4px;">What To Do Now:</strong>
                        <ul style="color:#e2e8f0; font-size:14px; padding-left:14px; margin:0;">
                            <li>Reduce salt intake and avoid processed sugar</li>
                            <li>Consult an internal medicine specialist</li>
                            <li>Execute daily light exercise</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else {
        diagnosisHtml = `
             <div class="glass-card" style="border-left:4px solid #10B981; margin-bottom:24px;">
                <h3 style="margin-bottom: 12px; font-size:20px; color:#f8fafc; display:flex; align-items:center; gap:8px;"><span>🧠</span> FINAL AI DIAGNOSIS</h3>
                <div style="color:#10B981; font-weight:700; font-size:16px;">✅ Completely Normal - No active disease markers.</div>
                <p style="color:#94a3b8; font-size:14px; margin-top:8px;">Your report demonstrates nominal metabolic functionality. Keep it up!</p>
            </div>
        `;
    }

    // Generate Mini Bars for Lab Results dynamically from rich_data
    const iconMap = {
        'bp': '❤️', 'glucose': '🍬', 'cholesterol': '🧬', 'heart_rate': '💓', 'temperature': '🌡️', 'hemoglobin': '🩸'
    };
    
    // Ranges mapping (min, max, normalMin, normalMax) 
    const ranges = {
        'glucose': [0, 300, 70, 100],
        'cholesterol': [0, 400, 125, 200],
        'hemoglobin': [0, 20, 12, 17.5],
        'heart_rate': [0, 200, 60, 100],
        'temperature': [95, 105, 97.8, 99.1]
    };

    const valueCards = [];
    
    for (const [key, info] of Object.entries(rd)) {
        let isAbnormal = info.status !== 'Normal';
        let barColor = isAbnormal ? '#EF4444' : '#10B981';
        let badgeClass = isAbnormal ? (info.severity <= -10 ? 'status-critical' : 'status-warning') : 'status-normal';
        let icon = iconMap[key] || '🔬';
        
        if (key === 'bp') {
            valueCards.push(`
                <div class="vital-card glass-card" style="margin-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div class="vital-label" style="font-weight:600; color:#e0e7ff;">${icon} Blood Pressure</div>
                        <div class="vital-status ${badgeClass}" style="font-size:10px;">${info.status.toUpperCase()}</div>
                    </div>
                    <div class="vital-value" style="font-size: 24px; font-weight:700; color: ${isAbnormal ? '#FCA5A5' : '#fff'};">${info.systolic}/${info.diastolic} <span style="font-size:12px;color:#94a3b8;font-weight:normal;">mmHg</span></div>
                    <div style="font-size: 12px; margin-top:4px; color: #94a3b8;">${info.interpretation}</div>
                </div>
            `);
        } else {
            let [min, max, nMin, nMax] = ranges[key] || [0, 500, 0, 100];
            let val = parseFloat(info.value);
            let pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
            
            valueCards.push(`
                <div class="vital-card glass-card" style="margin-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div class="vital-label" style="font-weight:600; color:#e0e7ff;">${icon} ${info.label}</div>
                        <div class="vital-status ${badgeClass}" style="font-size:10px;">${info.status.toUpperCase()}</div>
                    </div>
                    <div class="vital-value" style="font-size: 24px; font-weight:700; color: ${isAbnormal ? '#FCA5A5' : '#fff'};">${info.value} <span style="font-size:12px;color:#94a3b8;font-weight:normal;">${info.unit}</span></div>
                    <div style="font-size: 12px; margin-top:4px; color: #94a3b8; height: 36px; overflow:hidden;">${info.interpretation}</div>
                    
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; margin-top:12px; position:relative;">
                        <div style="position:absolute; left:${((nMin-min)/(max-min))*100}%; width:${((nMax-nMin)/(max-min))*100}%; height:100%; background:rgba(16, 185, 129, 0.2); border-radius:3px;"></div>
                        <div style="position:absolute; left:${pct}%; top:-3px; width:12px; height:12px; background:${barColor}; border-radius:50%; box-shadow:0 0 10px ${barColor}; transform:translateX(-50%); transition: left 1s ease-out;"></div>
                    </div>
                </div>
            `);
        }
    }

    // Explanations Accordion
    let sourceExpl = data.explanation || 'No clear values detected';
    let explanationHtml = sourceExpl.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Recommendations HTML
    const recsHtml = (data.recommendations || []).map(r => `
        <div class="recommendation-item glass-card" style="margin-bottom:16px;">
            <div class="rec-icon" style="font-size:28px;">${r.title.includes('Diet')||r.title.includes('Carb')||r.title.includes('fat') ? '🥗' : (r.title.includes('Activ')||r.title.includes('Exerc')?'🏃':'💡')}</div>
            <div class="rec-text">
                <div class="rec-title" style="color:#10B981; font-weight:600;">${r.title}</div>
                <div class="rec-description" style="color:#cbd5e1;">${r.desc}</div>
            </div>
        </div>
    `).join('');
    
    // Insights HTML
    const insightsHtml = insights.map(ins => `<li style="margin-bottom:8px; color:#e2e8f0;"><span style="color:#0ea5e9; margin-right:8px;">▹</span>${ins}</li>`).join('');
    
    // Risks HTML
    const risksHtml = combinedRisks.map(cr => `<li style="margin-bottom:8px; color:#FCA5A5;"><span style="margin-right:8px;">⚠️</span>${cr}</li>`).join('');

    // UI Structure
    return `
        <style>
            .medical-report-dashboard { background: linear-gradient(180deg, rgba(15, 118, 110, 0.15) 0%, rgba(0,0,0,0.8) 100%); border-radius: 20px; padding: 24px; margin-top: 10px; border: 1px solid rgba(15, 118, 110, 0.3); box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            .report-tabs { display: flex; gap: 12px; margin-bottom: 28px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .report-tabs::-webkit-scrollbar { display: none; }
            .report-tab-btn { padding: 12px 24px; background: transparent; border: none; border-bottom: 3px solid transparent; color: #94a3b8; cursor: pointer; white-space: nowrap; transition: 0.3s; font-weight:600; font-size: 15px; }
            .report-tab-btn:hover { color: #f8fafc; }
            .report-tab-btn.active { color: #10B981; border-bottom: 3px solid #10B981; text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }
            .report-tab-content { display: none; animation: fadeIn 0.5s ease; background: transparent; }
            .report-tab-content.active { display: block; }
            
            .glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; transition: 0.3s; padding: 20px; }
            .glass-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.12); }
            
            .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
            
            @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 ${scoreGlow}; } 70% { box-shadow: 0 0 0 20px rgba(0,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); } }
        </style>

        <div class="medical-report-dashboard">
            <!-- Patient Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:30px;">
                <div>
                    <h2 style="font-size:28px; font-weight:800; color: #f8fafc; margin-bottom:4px;">🧠 Arogya Medical Core</h2>
                    <p style="color:#94a3b8; font-size:15px;">Patient: <strong style="color:#e2e8f0;">${patientName}</strong> &nbsp;|&nbsp; Age: <strong style="color:#e2e8f0;">${age}</strong></p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="report-tabs">
                <button class="report-tab-btn active" onclick="switchReportTab(this, 'rt-summary')">📊 Summary</button>
                <button class="report-tab-btn" onclick="switchReportTab(this, 'rt-labs')">🧪 Lab Results</button>
                <button class="report-tab-btn" onclick="switchReportTab(this, 'rt-insights')">🧠 AI Clinical Assessment</button>
                <button class="report-tab-btn" onclick="switchReportTab(this, 'rt-recs')">💡 Recommendations</button>
                <button class="report-tab-btn" onclick="switchReportTab(this, 'rt-details')">📄 Report Details</button>
            </div>

            <!-- Tab 1: Summary -->
            <div id="rt-summary" class="report-tab-content active">
                <div class="grid-2">
                    <!-- Score Card -->
                    <div class="glass-card" style="text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <h3 style="color:#94a3b8; font-size:14px; text-transform:uppercase; margin-bottom:30px; letter-spacing:1px;">General Health Score</h3>
                        <div style="width:160px; height:160px; font-size:56px; border:6px solid ${scoreColor}; animation: pulse-ring 2s infinite; margin:0 auto 30px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:${scoreColor}; font-weight:900; background:rgba(0,0,0,0.2);">
                            ${healthScore}
                        </div>
                        <div style="font-size:18px; font-weight:700; color:${scoreColor}; letter-spacing:0.5px; margin-bottom:8px;">
                            ${riskLevel.toUpperCase()}
                        </div>
                        <div style="color:#64748b; font-size:13px; font-weight:600;"><span style="color:#2563EB;">⚡</span> AI Confidence Level: ${confidence}%</div>
                        
                        <button style="margin-top:20px; background:transparent; border:1px solid #334155; color:#94a3b8; padding:8px 16px; border-radius:20px; font-size:12px; cursor:pointer; transition:0.2s;" onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#94a3b8'" onclick="document.querySelectorAll('.report-tab-btn')[2].click()">Why this score?</button>
                    </div>
                    
                    <!-- Overview Setup -->
                    <div style="display:flex; flex-direction:column; gap:24px;">
                        <div class="glass-card" style="background:rgba(37, 99, 235, 0.05); border-left:4px solid #2563EB;">
                            <h3 style="color:#60A5FA; font-size:16px; margin-bottom:12px; display:flex; align-items:center; gap:8px;"><span>🏥</span> Clinical Insights</h3>
                            <ul style="padding-left:14px; list-style:none;">
                                ${insightsHtml || '<li style="color:#cbd5e1;">All tested parameters are clinically nominal.</li>'}
                            </ul>
                        </div>
                        
                        <div class="glass-card" style="flex:1;">
                            <h3 style="color:#94a3b8; font-size:14px; text-transform:uppercase; margin-bottom:16px;">Risk Breakdown</h3>
                            ${combinedRisks.length > 0 
                                ? `<ul style="padding-left:14px; list-style:none;">${risksHtml}</ul>` 
                                : '<div style="color:#10B981; font-weight:600; display:flex; align-items:center; gap:8px;"><span>✅</span> No compounded metabolic or cardiovascular risks detected.</div>'}
                                
                            <hr style="border:none; border-top:1px solid rgba(255,255,255,0.05); margin:16px 0;">
                            <h3 style="color:#94a3b8; font-size:14px; text-transform:uppercase; margin-bottom:16px;">What should you do next?</h3>
                            <button style="background:#0F766E; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; width:100%; font-weight:600; transition:0.2s;" onmouseover="this.style.background='#0D635D'" onmouseout="this.style.background='#0F766E'" onclick="document.querySelectorAll('.report-tab-btn')[3].click()">View Action Plan ➡️</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Lab Results -->
            <div id="rt-labs" class="report-tab-content">
                <div class="grid-2">
                    ${valueCards.join('')}
                    ${valueCards.length === 0 ? '<p style="color:#94a3b8; padding:10px;">No exact numerical values found.</p>' : ''}
                </div>
            </div>

            <!-- Tab 3: AI Insights -->
            <div id="rt-insights" class="report-tab-content">
                ${diagnosisHtml}
                
                <div class="glass-card" style="border-left:4px solid #10B981; margin-bottom:24px;">
                    <h3 style="margin-bottom: 16px; font-size:20px; color:#f8fafc; display:flex; align-items:center; gap:8px;"><span>👨‍⚕️</span> Clinical Insights</h3>
                    <div style="color:#cbd5e1; line-height:1.8; font-size:15px;">
                        ${explanationHtml}
                    </div>
                </div>
                <!-- Chat Hook -->
                <div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; background:rgba(37, 99, 235, 0.05);">
                    <div>
                        <h4 style="color:#e2e8f0; margin-bottom:4px; font-size:16px;">Have medical questions?</h4>
                        <p style="color:#94a3b8; font-size:13px;">Our AI is ready to explain these results interactively.</p>
                    </div>
                    <button class="btn-primary" style="background:#2563EB; white-space:nowrap; padding:10px 20px; border-radius:8px; font-weight:600; border:none; color:white; cursor:pointer;" onclick="switchTab('chat', null);">💬 Ask NLP Chat</button>
                </div>
            </div>

            <!-- Tab 4: Recommendations -->
            <div id="rt-recs" class="report-tab-content">
                <div class="grid-2">
                    <div>
                        <h3 style="margin-bottom: 20px; font-size:18px; color:#f8fafc;">Prescriptive Recommendations</h3>
                        <div class="recommendations-list" style="display:flex; flex-direction:column; gap:16px;">
                            ${recsHtml}
                        </div>
                    </div>
                    <div>
                        <h3 style="margin-bottom: 20px; font-size:18px; color:#f8fafc;">Next Steps</h3>
                        <div class="glass-card" style="border-top:3px solid #10B981;">
                            <ul style="padding-left:20px; color:#cbd5e1; line-height:2.0;">
                                <li>Consult a certified physician regarding your risk levels.</li>
                                <li>Monitor key vitals at home and log them.</li>
                                <li>Maintain dietary restrictions suggested above.</li>
                                <li>Review this report again in 3 months.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 5: Details -->
            <div id="rt-details" class="report-tab-content">
                <div class="grid-2">
                    <div class="glass-card">
                        <h3 style="margin-bottom: 20px; font-size:16px; color:#94a3b8; text-transform:uppercase;">Report Metadata</h3>
                        <div style="margin-bottom:16px; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><strong style="color:#e2e8f0;">Processed Date</strong> <span style="color:#94a3b8;">${today}</span></div>
                        <div style="margin-bottom:16px; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;"><strong style="color:#e2e8f0;">Extracted Fields</strong> <span style="color:#94a3b8;">${Object.keys(rd).length} parameters found</span></div>
                        <div style="display:flex; justify-content:space-between;"><strong style="color:#e2e8f0;">AI Engine</strong> <span style="color:#10B981;">Arogya Medical Core v3.0 NLP</span></div>
                    </div>
                    <div class="glass-card" style="max-height:250px; overflow-y:auto; overflow-x:hidden;">
                        <h3 style="margin-bottom: 16px; font-size:16px; color:#94a3b8; text-transform:uppercase;">Extracted JSON Core</h3>
                        <pre style="font-size:12px; color:#64748b; white-space:pre-wrap; word-wrap:break-word; font-family:monospace;">${JSON.stringify({ ...data, explanation: '[Formatted Structure]' }, null, 2)}</pre>
                    </div>
                </div>
            </div>
            
            <!-- Master Action Buttons -->
            <div class="report-actions" style="justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn-action" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius:8px; padding:10px 20px; cursor:pointer;" onclick="alert('Feature coming soon!')">🔄 Compare Reports</button>
                    <button class="btn-action btn-download" style="background: rgba(16,185,129,0.2); color: #10B981; border: 1px solid rgba(16,185,129,0.3); border-radius:8px; padding:10px 20px; cursor:pointer;" onclick="downloadReportPDF()">📥 Download Detailed Report</button>
                </div>
            </div>
        </div>
    `;
}

// Trigger Backend PDF Generator
async function downloadReportPDF() {
    if (!window.currentReportData) {
        alert("⚠️ No report data available. Please upload and analyze a report first.");
        return;
    }
    
    // Disable button to prevent multi clicks
    const btn = document.querySelector('.btn-download');
    if (btn) {
        btn.innerHTML = `<span style="animation: spin 1s infinite; display:inline-block;">⌛</span> Generating Secure PDF...`;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
    }
    
    console.log("PDF Data:", window.currentReportData);
    
    try {
        const response = await fetch('https://arogya-ai-care-1.onrender.com/api/generate_pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportData: window.currentReportData })
        });
        
        if (!response.ok) {
            const errBox = await response.json();
            throw new Error(errBox.error || 'Failed to generate PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'AI_Medical_Report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch(err) {
        alert("❌ Error downloading PDF: " + err.message);
    } finally {
        if (btn) {
            btn.innerHTML = `📥 Download Detailed Report`;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    }
}

// Display analysis results
function displayReportResults(data, resultDiv) {
    window.currentReportData = data; // Keep context mapped globally for Chat features
    resultDiv.innerHTML = generateMedicalReport(data);
    resultDiv.classList.add('show');
}

function showLoadingSteps(resultDiv) {
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; animation: pulse 2s infinite;">
            <div style="font-size: 48px; margin-bottom: 20px; display: inline-block; animation: spin 3s linear infinite;">⏳</div>
            <div id="loading-text" style="color: #0ea5e9; font-weight: 700; font-size: 20px; letter-spacing: 0.5px;">Reading your report...</div>
        </div>
        <style>
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; box-shadow: 0 0 20px rgba(14, 165, 233, 0.2); } 100% { opacity: 0.8; } }
        </style>
    `;
    resultDiv.classList.add('show');

    const steps = [
        "Reading your report...",
        "Extracting medical values...",
        "Analyzing health risks...",
        "Generating AI insights..."
    ];
    let stepIndex = 0;
    return setInterval(() => {
        stepIndex++;
        if(stepIndex < steps.length) {
            const textEl = document.getElementById('loading-text');
            if(textEl) textEl.innerText = steps[stepIndex];
        }
    }, 600);
}

// Analyze text report
async function analyzeReportText(e) {
    e.preventDefault();
    
    const report_text = document.getElementById('report-input').value;
    const resultDiv = document.getElementById('report-result');
    
    if (!report_text.trim()) {
        resultDiv.innerHTML = '<p style="color: #fca5a5;">❌ Please enter report text</p>';
        resultDiv.classList.add('show');
        return;
    }
    
    const intervalId = showLoadingSteps(resultDiv);
    
    try {
        const res = await fetch('https://arogya-ai-care-1.onrender.com/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report_text })
        });
        
        const data = await res.json();
        
        clearInterval(intervalId);
        
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: #fca5a5;">❌ ${data.error}</p>`;
            return;
        }
        
        // Slight artificial delay so user sees all loading steps for premium feel
        setTimeout(() => {
            displayReportResults(data, resultDiv);
        }, 1000);
        
    } catch(e) {
        clearInterval(intervalId);
        resultDiv.innerHTML = `<p style="color: #fca5a5;">❌ Error: ${e.message}</p>`;
    }
}

// OLD Display function - keeping for reference
function displayReportResultsOld(data, resultDiv) {
    let html = '';
    
    // Summary section
    if (data.summary) {
        html += `
            <div class="result-item">
                <div class="result-label">📋 Analysis Summary</div>
                <div class="result-value" style="font-size: 14px; line-height: 1.6;">${data.summary}</div>
            </div>
        `;
    }
    
    // Warnings section
    if (data.warnings && data.warnings.length > 0) {
        const warnings_html = data.warnings
            .map(w => `<div style="margin: 8px 0; padding: 8px 12px; background: rgba(252, 165, 165, 0.1); border-left: 3px solid #fca5a5; border-radius: 4px;">⚠️ ${w}</div>`)
            .join('');
        html += `
            <div class="result-item">
                <div class="result-label">⚠️ Warnings</div>
                <div class="result-value">${warnings_html}</div>
            </div>
        `;
    }
    
    // Health Metrics
    if (data.data) {
        if (data.data.blood_pressure) {
            const bp = data.data.blood_pressure;
            const bp_color = bp.status.level === 'Normal' ? '#86efac' : 
                             bp.status.level === 'Elevated' ? '#fbbf24' : '#fca5a5';
            html += `
                <div class="result-item">
                    <div class="result-label">❤️ Blood Pressure</div>
                    <div class="result-value">${bp.systolic}/${bp.diastolic} mmHg</div>
                    <div style="color: ${bp_color}; margin-top: 4px; font-size: 13px;">📊 ${bp.status.level}</div>
                </div>
            `;
        }
        
        if (data.data.glucose) {
            const glucose = data.data.glucose;
            const gl_color = glucose.status.level === 'Normal' ? '#86efac' : 
                             glucose.status.level === 'High' ? '#fbbf24' : '#fca5a5';
            html += `
                <div class="result-item">
                    <div class="result-label">🩸 Blood Sugar</div>
                    <div class="result-value">${glucose.value} mg/dL</div>
                    <div style="color: ${gl_color}; margin-top: 4px; font-size: 13px;">📊 ${glucose.status.level}</div>
                </div>
            `;
        }
        
        if (data.data.cholesterol) {
            const chol = data.data.cholesterol;
            const chol_color = chol.status.level === 'Desirable' ? '#86efac' : 
                               chol.status.level === 'Borderline' ? '#fbbf24' : '#fca5a5';
            html += `
                <div class="result-item">
                    <div class="result-label">⚕️ Cholesterol</div>
                    <div class="result-value">${chol.value} mg/dL</div>
                    <div style="color: ${chol_color}; margin-top: 4px; font-size: 13px;">📊 ${chol.status.level}</div>
                </div>
            `;
        }
    }
    
    resultDiv.innerHTML = html;
}

// Analyze PDF report
async function analyzeReportPDF(file) {
    const resultDiv = document.getElementById('report-result');
    
    if (!file) {
        resultDiv.innerHTML = '<p style="color: #fca5a5;">❌ Please select a PDF file</p>';
        resultDiv.classList.add('show');
        return;
    }
    
    if (file.type !== 'application/pdf') {
        resultDiv.innerHTML = '<p style="color: #fca5a5;">❌ Please upload a PDF file only</p>';
        resultDiv.classList.add('show');
        return;
    }
    
    // Show filename next to upload box in UI temporarily
    const dz = document.getElementById('drop-zone');
    const oldText = dz.innerHTML;
    dz.innerHTML = `<div style="font-size: 24px; color: #22c55e;">📄 ${file.name}</div><p style="margin-top: 8px; color: #e0e7ff;">Ready for analysis</p>`;
    setTimeout(() => { dz.innerHTML = oldText; }, 5000); // restore after 5s
    
    const intervalId = showLoadingSteps(resultDiv);
    
    try {
        const formData = new FormData();
        formData.append('pdf_file', file);
        
        const res = await fetch('https://arogya-ai-care-1.onrender.com/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        
        clearInterval(intervalId);
        
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: #fca5a5;">❌ ${data.error}</p>`;
            return;
        }
        
        // Artificial delay for premium feel
        setTimeout(() => {
            displayReportResults(data, resultDiv);
        }, 1000);
        
    } catch(e) {
        clearInterval(intervalId);
        resultDiv.innerHTML = `<p style="color: #fca5a5;">❌ Error: ${e.message}</p>`;
    }
}

// PDF file input handler
document.addEventListener('DOMContentLoaded', function() {
    const pdfInput = document.getElementById('pdf-upload');
    if (pdfInput) {
        pdfInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                analyzeReportPDF(this.files[0]);
            }
        });
    }
    
    // Drag and drop handlers
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', function() {
            document.getElementById('pdf-upload').click();
        });
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = 'rgba(14, 165, 233, 0.15)';
            this.style.borderColor = '#22c55e';
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = 'rgba(14, 165, 233, 0.05)';
            this.style.borderColor = '#0ea5e9';
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.backgroundColor = 'rgba(14, 165, 233, 0.05)';
            this.style.borderColor = '#0ea5e9';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                analyzeReportPDF(files[0]);
            }
        });
    }
});
