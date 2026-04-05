import re

class ReportAnalyzer:
    def __init__(self):
        # Enhanced regex patterns
        self.patterns = {
            'bp': r'(?:bp|blood pressure|b\.p\.)\s*:?\s*(\d{2,3})\s*[/\\]\s*(\d{2,3})',
            'glucose': r'(?:fasting blood sugar|fasting sugar|blood sugar|glucose|fbs|ppbs|sugar)\s*:?\s*(\d{2,4})',
            'cholesterol': r'(?:total cholesterol|ldl|hdl|cholesterol|chol|lipid)\s*:?\s*(\d{2,4})',
            'hemoglobin': r'(?:hemoglobin|hb|hgb)\s*:?\s*(\d{1,2}\.?\d*)',
            'heart_rate': r'(?:heart rate|pulse|hr)\s*:?\s*(\d{2,3})',
            'temperature': r'(?:temperature|temp)\s*:?\s*(\d{2,3}\.?\d*)'
        }
    
    def analyze(self, text):
        text = str(text).lower()
        extracted_data_legacy = {}
        extracted_data_rich = {}
        
        score_deduction = 0
        diseases = set()
        clinical_insights = []
        combined_risks = []
        
        # Blood Pressure
        bp_match = re.search(self.patterns['bp'], text)
        if bp_match:
            sys = int(bp_match.group(1))
            dia = int(bp_match.group(2))
            extracted_data_legacy['bp_systolic'] = sys
            extracted_data_legacy['bp_diastolic'] = dia
            
            interpretation = "Normal blood pressure."
            status = "Normal"
            sev = 0
            
            if sys > 160 or dia > 100:
                status = "Severe High"
                sev = 20
                interpretation = "Indicates Stage 2 Hypertension, significant risk of cardiovascular events if untreated."
                diseases.add("Hypertension")
                clinical_insights.append("Your blood pressure is extremely elevated, entering a hypertensive crisis range.")
            elif sys > 140 or dia > 90:
                status = "High"
                sev = 10
                interpretation = "Indicates Stage 1 Hypertension, causing increased strain on your heart."
                diseases.add("Hypertension")
                clinical_insights.append("Blood pressure shows elevated hypertension risk.")
            elif sys > 120 or dia > 80:
                status = "Mildly High"
                sev = 5
                interpretation = "Elevated BP, a precursor to hypertension."
                clinical_insights.append("Your blood pressure is slightly elevated. Lifestyle modifications are suggested.")
            elif sys < 90 or dia < 60:
                status = "Low"
                sev = 10
                interpretation = "Hypotension, which may cause dizziness or fainting."
                clinical_insights.append("Your blood pressure is unusually low.")
            
            score_deduction += sev
            extracted_data_rich['bp'] = {
                "systolic": sys, "diastolic": dia, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': 'mmHg', 'label': 'Blood Pressure'
            }

        # Glucose
        glucose_match = re.search(self.patterns['glucose'], text)
        if glucose_match:
            glucose = int(glucose_match.group(1))
            extracted_data_legacy['glucose'] = glucose
            
            status, interpretation, sev = "Normal", "Healthy glucose levels.", 0
            if glucose >= 200:
                status, sev = "Severe High", 20
                interpretation = "Very high levels indicating probable active diabetes."
                diseases.add("Diabetes Risk")
                clinical_insights.append("Your glucose level is dangerously above normal.")
            elif glucose > 125:
                status, sev = "High", 10
                interpretation = "Indicates possible diabetes or severe insulin resistance."
                diseases.add("Diabetes Risk")
                clinical_insights.append("Your glucose level is significantly above normal.")
            elif glucose > 100:
                status, sev = "Mildly High", 5
                interpretation = "Pre-diabetes range, careful diet monitoring needed."
                clinical_insights.append("Glucose is creeping into pre-diabetic ranges.")
            elif glucose < 70:
                status, sev = "Low", 10
                interpretation = "Hypoglycemia, which can cause fainting and fatigue."
                clinical_insights.append("Your blood sugar is unusually low, risking hypoglycemia.")
                
            score_deduction += sev
            extracted_data_rich['glucose'] = {
                "value": glucose, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': 'mg/dL', 'label': 'Blood Sugar'
            }

        # Cholesterol
        chol_match = re.search(self.patterns['cholesterol'], text)
        if chol_match:
            chol = int(chol_match.group(1))
            extracted_data_legacy['cholesterol'] = chol
            status, interpretation, sev = "Normal", "Healthy cholesterol levels.", 0
            if chol > 240:
                status, sev = "High", 20
                interpretation = "Dangerous plaque buildup risk, potential artery blockage."
                diseases.add("Heart Disease Risk")
                clinical_insights.append("Cholesterol levels may actively increase heart risk.")
            elif chol > 200:
                status, sev = "Mildly High", 10
                interpretation = "Borderline high cholesterol. Monitor saturated fat intake."
                clinical_insights.append("Cholesterol is elevated above optimal levels.")
                
            score_deduction += sev
            extracted_data_rich['cholesterol'] = {
                "value": chol, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': 'mg/dL', 'label': 'Cholesterol'
            }
            
        # Hemoglobin
        hb_match = re.search(self.patterns['hemoglobin'], text)
        if hb_match:
            hb = float(hb_match.group(1))
            extracted_data_legacy['hemoglobin'] = hb
            status, interpretation, sev = "Normal", "Healthy oxygen carrying capacity.", 0
            if hb < 9:
                status, sev = "Severe Low", 20
                interpretation = "Severe anemia, critical low oxygen transport affecting organs."
                diseases.add("Anemia Risk")
                clinical_insights.append("Hemoglobin is severely depleted.")
            elif hb < 12:
                status, sev = "Low", 10
                interpretation = "Anemia indicator, commonly causes fatigue and weakness."
                diseases.add("Anemia Risk")
                clinical_insights.append("You show markers for anemia (low hemoglobin).")
                
            score_deduction += sev
            extracted_data_rich['hemoglobin'] = {
                "value": hb, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': 'g/dL', 'label': 'Hemoglobin'
            }

        # Heart Rate
        hr_match = re.search(self.patterns['heart_rate'], text)
        if hr_match:
            hr = int(hr_match.group(1))
            extracted_data_legacy['heart_rate'] = hr
            status, interpretation, sev = "Normal", "Normal resting pulse.", 0
            if hr > 120:
                status, sev = "Severe High", 15
                interpretation = "Tachycardia, very high resting heart rate."
                clinical_insights.append("Your resting heart rate is alarmingly high.")
            elif hr > 100:
                status, sev = "High", 5
                interpretation = "Elevated pulse, indicative of stress, low fitness, or cardiovascular exertion."
                clinical_insights.append("Heart rate is somewhat elevated.")
                
            score_deduction += sev
            extracted_data_rich['heart_rate'] = {
                "value": hr, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': 'bpm', 'label': 'Heart Rate'
            }

        # Temperature
        temp_match = re.search(self.patterns['temperature'], text)
        if temp_match:
            temp = float(temp_match.group(1))
            extracted_data_legacy['temperature'] = temp
            status, interpretation, sev = "Normal", "Normal body temperature.", 0
            if temp >= 102.0:
                status, sev = "High", 15
                interpretation = "High grade fever, strong indicator of acute immunological response."
                diseases.add("Infection Risk")
                clinical_insights.append("You have a high-grade fever.")
            elif temp >= 100.4:
                status, sev = "Mildly High", 5
                interpretation = "Low grade fever."
                clinical_insights.append("You are experiencing a mild fever.")
                
            score_deduction += sev
            extracted_data_rich['temperature'] = {
                "value": temp, "status": status, "interpretation": interpretation, "severity": -sev, 'unit': '°F', 'label': 'Temperature'
            }

        # Multi-variable analysis
        if ('bp' in extracted_data_rich and extracted_data_rich['bp']['severity'] <= -10) and ('cholesterol' in extracted_data_rich and extracted_data_rich['cholesterol']['severity'] <= -10):
            combined_risks.append("Cardiovascular Risk (High BP + High Cholesterol)")
        
        if ('glucose' in extracted_data_rich and extracted_data_rich['glucose']['severity'] <= -10) and ('bp' in extracted_data_rich and extracted_data_rich['bp']['severity'] <= -5):
            combined_risks.append("Metabolic Syndrome Risk (High Glucose + Elevated BP)")

        # Calculate score
        health_score = max(0, min(100, 100 - score_deduction))
        
        risk_level = "Safe / Normal"
        if health_score < 60:
            risk_level = "Danger / Critical"
        elif health_score < 85:
            risk_level = "Moderate Alert"
            
        return {
            "extracted_data": extracted_data_legacy,
            "rich_data": extracted_data_rich,
            "diseases": list(diseases),
            "clinical_insights": clinical_insights,
            "combined_risks": combined_risks,
            "risk_level": risk_level,
            "health_score": health_score,
            "explanation": self._generate_structured_explanation(extracted_data_rich, combined_risks),
            "recommendations": self._generate_recommendations(diseases, extracted_data_rich)
        }

    def _generate_structured_explanation(self, rich_data, combined_risks):
        if not rich_data:
            return "No readable vitals detected."
            
        parts = ["**Key Findings:**"]
        for key, info in rich_data.items():
            if info.get('status') != 'Normal':
                if key == 'bp':
                    name = "Blood Pressure"
                    val = f"{info['systolic']}/{info['diastolic']} mmHg"
                else:
                    name = key.replace('_', ' ').title()
                    val = info['value']
                
                parts.append(f"• **{name} is {info['status']}** ({val}): {info['interpretation']}")
                
        if len(parts) == 1:
            return "Your vitals are completely stable and fall within the optimal medical thresholds. Keep up the excellent routine!"
        
        parts.append("\n**Why it matters:**")
        parts.append("Abnormalities in these parameters directly trigger the body's compensatory mechanisms, adding continuous structural strain to your physiological systems.")
        
        parts.append("\n**What it leads to:**")
        if combined_risks:
            parts.append(f"If unmanaged, this overlapping combination heavily accelerates: **{', '.join(combined_risks)}**.")
        else:
            parts.append("If left unmanaged, isolated abnormal trends can silently evolve into chronic medical conditions affecting your longevity and quality of life.")
            
        return "\n".join(parts)
        
    def _generate_recommendations(self, diseases, rich_data):
        recs = []
        if not diseases and not any(r['status'] != 'Normal' for r in rich_data.values()):
            return [
                {"title": "Maintain Routine", "desc": "Keep up your good habits and routine health checkups."},
                {"title": "Stay Active", "desc": "Keep engaging in 30 minutes of daily physical activity."}
            ]
            
        if "Hypertension" in diseases:
            recs.append({"title": "Dietary monitoring", "desc": "Reduce sodium intake severely. Focus on the DASH diet."})
        if "Diabetes Risk" in diseases:
            recs.append({"title": "Glucose control", "desc": "Eliminate refined sugars. Switch to high-fiber complex carbohydrates."})
        if "Heart Disease Risk" in diseases:
            recs.append({"title": "Cardio-protective fats", "desc": "Cut saturated fats. Add Omega-3s and olive oil to your meals."})
        if "Anemia Risk" in diseases:
            recs.append({"title": "Iron supplementation", "desc": "Incorporate iron-rich leafy greens and consider physician-prescribed supplements."})
            
        if not recs:
            recs = [
                {"title": "Schedule Checkup", "desc": "Schedule a routine consultation to have a physician review these slight elevations."}
            ]
        return recs


