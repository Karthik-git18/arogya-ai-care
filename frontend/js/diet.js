function setDietPrompt(text) {
    document.getElementById('diet-ai-prompt').value = text;
}

// Generate the beautiful DOM
function renderAINutritionDashboard(dietData) {
    const bmi = dietData.bmi_info;
    const nut = dietData.nutrition;
    const plan = dietData.daily_plan;
    
    // Convert macros format dynamically for progress bars
    let proPct = nut.protein.includes('High') ? 35 : (nut.protein.includes('Moderate') ? 20 : 10);
    let carbPct = nut.carbs.includes('High') ? 50 : (nut.carbs.includes('Moderate') ? 40 : 20);
    let fatPct = nut.fat.includes('High') ? 35 : (nut.fat.includes('Moderate') ? 25 : 15);

    let goalTitle = dietData.goal.replace('_', ' ').toUpperCase();
    
    // Warnings
    let warningsHtml = dietData.warnings.map(w => `<div style="color:#FCA5A5; margin-bottom:8px; display:flex; align-items:flex-start; gap:8px;"><span style="flex-shrink:0;">⚠️</span><span>${w}</span></div>`).join('');
    
    // Insights
    let insightsHtml = dietData.insights.map(i => `<div style="color:#cbd5e1; margin-bottom:12px; display:flex; align-items:flex-start; gap:8px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;"><span style="color:#0ea5e9;">🧠</span><span>${i}</span></div>`).join('');

    // Groceries
    let groceriesHtml = dietData.groceries.map(g => `<span style="padding:6px 12px; background:rgba(34, 197, 94, 0.1); border:1px solid rgba(34,197,94,0.3); border-radius:20px; color:#10B981; font-size:13px; font-weight:600;">🛒 ${g}</span>`).join('');

    // Medical Conditions Flags
    let conditionsHtml = dietData.conditions.map(c => {
        let label = c === 'diabetes_risk' ? 'High Glucose Alert' : (c === 'cardio_risk' ? 'Heart Health Alert' : 'BP Alert');
        return `<span style="padding:6px 12px; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); border-radius:8px; color:#FCA5A5; font-size:12px; font-weight:700;">🏥 ${label}</span>`;
    }).join(' ');

    const html = `
        <style>
            .diet-dash { animation: fadeIn 0.5s ease; color: #f8fafc; margin-top:20px; }
            .diet-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom:24px; }
            .diet-glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            
            .meal-card { background: rgba(255,255,255,0.03); border-left: 4px solid #10B981; padding: 16px; border-radius: 12px; margin-bottom: 16px; transition: 0.3s; }
            .meal-card:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); }
            .meal-title { font-size: 16px; font-weight: 700; color: #10B981; margin-bottom: 8px; display:flex; align-items:center; gap:8px; }
            .meal-desc { color: #e2e8f0; font-size: 14px; line-height: 1.6; }
            
            .prog-container { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 6px; overflow:hidden; }
            .prog-bar { height: 100%; border-radius: 4px; transition: width 1s ease-out; }
            
            .diet-action-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 20px; border-radius: 10px; cursor: pointer; transition: 0.2s; flex:1; font-weight:600; text-align:center; }
            .diet-action-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        </style>

        <div class="diet-dash">
            <!-- Header Summary -->
            <div class="diet-glass" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; border-top: 4px solid #0ea5e9;">
                <div>
                    <h3 style="font-size:24px; font-weight:800; background: linear-gradient(135deg, #22c55e, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Your AI Nutrition Plan</h3>
                    <p style="color:#94a3b8; font-size:14px; margin-top:4px;">Target Goal: <strong style="color:#e2e8f0;">${goalTitle}</strong></p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:12px; color:#94a3b8; text-transform:uppercase; margin-bottom:4px;">Current BMI</div>
                    <div style="font-size:32px; font-weight:900; color:#10B981;">${bmi.bmi} <span style="font-size:14px; font-weight:normal; color:#e2e8f0;">${bmi.category}</span></div>
                </div>
                ${conditionsHtml ? `<div style="width:100%; display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">${conditionsHtml}</div>` : ''}
            </div>

            <div class="diet-grid" style="margin-top:24px;">
                <!-- Left Col: Meals -->
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <div class="diet-glass">
                        <h4 style="font-size:18px; font-weight:700; margin-bottom:20px; color:#f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:10px;">🍽️ Recommended Daily Menu</h4>
                        
                        <div class="meal-card">
                            <div class="meal-title"><span>🍳</span> Breakfast</div>
                            <div class="meal-desc">${plan.breakfast}</div>
                        </div>
                        <div class="meal-card">
                            <div class="meal-title"><span>🥗</span> Lunch</div>
                            <div class="meal-desc">${plan.lunch}</div>
                        </div>
                        <div class="meal-card">
                            <div class="meal-title"><span>🍲</span> Dinner</div>
                            <div class="meal-desc">${plan.dinner}</div>
                        </div>
                        <div class="meal-card" style="border-color:#F59E0B;">
                            <div class="meal-title" style="color:#F59E0B;"><span>🍎</span> Snacks</div>
                            <div class="meal-desc">${plan.snacks}</div>
                        </div>
                    </div>
                </div>

                <!-- Right Col: Macros, Insights & Warnings -->
                <div style="display:flex; flex-direction:column; gap:24px;">
                    <!-- Macros -->
                    <div class="diet-glass" style="background: rgba(37, 99, 235, 0.05); border-color: rgba(37,99,235,0.2);">
                        <h4 style="font-size:16px; font-weight:700; margin-bottom:20px; color:#60A5FA;">📊 Target Macros & Nutrition</h4>
                        
                        <div style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:13px; color:#e2e8f0; font-weight:600;">
                                <span>🔥 Calories Target</span> <span>${nut.calories} kcal</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:13px; color:#94a3b8; margin-bottom:4px;">
                                <span>💪 Protein: ${nut.protein}</span> <span>${proPct}%</span>
                            </div>
                            <div class="prog-container"><div class="prog-bar" style="width:${proPct}%; background:#10B981;"></div></div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:13px; color:#94a3b8; margin-bottom:4px;">
                                <span>🌾 Carbs: ${nut.carbs}</span> <span>${carbPct}%</span>
                            </div>
                            <div class="prog-container"><div class="prog-bar" style="width:${carbPct}%; background:#F59E0B;"></div></div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; font-size:13px; color:#94a3b8; margin-bottom:4px;">
                                <span>🥑 Fat: ${nut.fat}</span> <span>${fatPct}%</span>
                            </div>
                            <div class="prog-container"><div class="prog-bar" style="width:${fatPct}%; background:#EF4444;"></div></div>
                        </div>
                    </div>

                    <!-- Insights & Warnings -->
                    <div class="diet-glass">
                        <h4 style="font-size:16px; font-weight:700; margin-bottom:16px; color:#f8fafc;">💡 AI Reasoning & Insights</h4>
                        ${insightsHtml}
                        
                        ${warningsHtml.length > 0 ? `
                        <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
                            <h4 style="font-size:14px; font-weight:700; margin-bottom:12px; color:#FCA5A5;">⚠️ Critical Dietary Warnings</h4>
                            ${warningsHtml}
                        </div>
                        ` : ''}
                    </div>

                    <!-- Smart Grocery List -->
                    <div class="diet-glass">
                        <h4 style="font-size:16px; font-weight:700; margin-bottom:16px; color:#f8fafc;">📝 Auto-Generated Grocery List</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            ${groceriesHtml}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interactions -->
            <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:20px;">
                <button class="diet-action-btn" style="background:rgba(37,99,235,0.2); border-color:rgba(37,99,235,0.5); color:#60A5FA;" onclick="switchTab('chat', null)">💬 Discuss Diet with AI</button>
                <button class="diet-action-btn" onclick="window.print()">📥 Download Routine PDF</button>
                <button class="diet-action-btn" onclick="document.getElementById('smart-input-panel').scrollIntoView({behavior: 'smooth'})">🔄 Tweak Goal</button>
            </div>
        </div>
    `;

    return html;
}

function showDietLoadingSteps(resultDiv) {
    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 60px 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; animation: pulse 2s infinite; margin-top: 24px;">
            <div style="font-size: 56px; margin-bottom: 24px; display: inline-block; animation: pop 1s infinite alternate;">🧠</div>
            <div id="diet-loading-text" style="color: #10B981; font-weight: 700; font-size: 22px; letter-spacing: 0.5px;">Generating your diet plan...</div>
            <div style="color: #94a3b8; font-size:14px; margin-top:12px;">Understanding your body metrics...</div>
        </div>
        <style>
            @keyframes pop { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        </style>
    `;
    
    // Make visible!!
    resultDiv.classList.add('show');
    
    const steps = [
        "Fusing medical report data...",
        "Applying NLP to calculate symptom constraints...",
        "Formulating optimal macro-nutrient splits...",
        "Handcrafting your clinical dietary meals..."
    ];
    let stepIndex = 0;
    return setInterval(() => {
        if(stepIndex < steps.length) {
            const textEl = document.getElementById('diet-loading-text');
            if(textEl) textEl.innerText = steps[stepIndex];
            stepIndex++;
        }
    }, 800);
}

async function generateDietPlan(e) {
    e.preventDefault();
    console.log("Generate Diet Clicked");
    
    const height = document.getElementById('diet-height').value;
    const weight = document.getElementById('diet-weight').value;
    const healthDescription = document.getElementById('diet-ai-prompt').value;
    
    const resultDiv = document.getElementById('diet-result');
    const intervalId = showDietLoadingSteps(resultDiv);
    
    // Attempt to pull medical report context globally
    const reportData = window.currentReportData || {};
    
    try {
        const res = await fetch('https://arogya-ai-care-1.onrender.com/api/diet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                height: height, 
                weight: weight, 
                health_description: healthDescription,
                report_data: reportData
            })
        });
        
        const data = await res.json();
        clearInterval(intervalId);
        
        if (data.error) {
            resultDiv.innerHTML = `<p style="padding:24px; background:rgba(239,68,68,0.1); border-radius:12px; color: #fca5a5;">❌ Engine Error: ${data.error}</p>`;
            return;
        }
        
        // Simulating setDietData by storing it globally and triggering render
        window.dietData = data.smart_diet;
        
        if (data.success && window.dietData) {
            setTimeout(() => {
                resultDiv.innerHTML = renderAINutritionDashboard(window.dietData);
                // Attach the new diet to global context so chat can read it!
                window.currentDietPlan = window.dietData;
            }, 800); // Artificial polish delay
        } else {
            resultDiv.innerHTML = `<p style="color: #fca5a5;">❌ Unable to generate diet plan. Try again.</p>`;
        }
        
    } catch(err) {
        clearInterval(intervalId);
        resultDiv.innerHTML = `<p style="padding:24px; color: #fca5a5; background:rgba(239,68,68,0.1); border-radius:12px;">❌ Unable to generate diet plan. Try again.</p>`;
    }
}
