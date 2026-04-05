import re

class DietPlanner:
    def __init__(self):
        pass
    
    def calculate_bmi(self, height_cm, weight_kg):
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        
        if bmi < 18.5:
            category = "Underweight"
            advice = "Focus on nutrient-dense, calorie-rich foods."
        elif bmi < 25:
            category = "Normal Weight"
            advice = "Maintain your healthy lifestyle with a balanced diet."
        elif bmi < 30:
            category = "Overweight"
            advice = "Focus on a moderate calorie deficit and regular exercise."
        else:
            category = "Obese"
            advice = "Prioritize medical guidance, heart-healthy habits, and significant calorie monitoring."
        
        return {
            'bmi': round(bmi, 1),
            'category': category,
            'advice': advice
        }

    def determine_goal(self, text, bmi_category):
        text = text.lower()
        if 'lose' in text or 'loss' in text or 'cut' in text or 'reduce weight' in text:
            return 'weight_loss'
        if 'gain' in text or 'muscle' in text or 'bulk' in text:
            return 'weight_gain'
        
        if bmi_category == 'Overweight' or bmi_category == 'Obese':
            return 'weight_loss'
        if bmi_category == 'Underweight':
            return 'weight_gain'
        return 'maintenance'

    def extract_health_conditions(self, text, report_data):
        conditions = []
        text = text.lower()
        
        # From text
        if 'sugar' in text or 'diabet' in text: conditions.append('diabetes_risk')
        if 'cholesterol' in text or 'heart' in text: conditions.append('cardio_risk')
        if 'blood pressure' in text or 'bp' in text or 'hypertension' in text: conditions.append('hypertension')
        
        # From report data
        if report_data and isinstance(report_data, dict):
            diseases = report_data.get('diseases', [])
            for d in diseases:
                d = d.lower()
                if 'diab' in d and 'diabetes_risk' not in conditions: conditions.append('diabetes_risk')
                if 'heart' in d or 'cholesterol' in d and 'cardio_risk' not in conditions: conditions.append('cardio_risk')
                if 'hyper' in d and 'hypertension' not in conditions: conditions.append('hypertension')
                
            rich_data = report_data.get('rich_data', {})
            if rich_data.get('glucose', {}).get('status') == 'High':
                if 'diabetes_risk' not in conditions: conditions.append('diabetes_risk')
                
            if rich_data.get('cholesterol', {}).get('status') in ['High', 'Severely High']:
                if 'cardio_risk' not in conditions: conditions.append('cardio_risk')
                
        return list(set(conditions))

    def generate_smart_diet(self, text, height, weight, report_data):
        bmi_info = self.calculate_bmi(height, weight)
        goal = self.determine_goal(text, bmi_info['category'])
        conditions = self.extract_health_conditions(text, report_data)
        
        # Base macros
        nutrition = {
            'calories': 2000,
            'protein': 'Moderate (15-20%)',
            'carbs': 'Moderate (50-55%)',
            'fat': 'Moderate (25-30%)',
            'water': '2.5 - 3.0 Liters'
        }
        
        if goal == 'weight_loss':
            nutrition['calories'] -= 400
            nutrition['protein'] = 'High (25-30%)'
            nutrition['carbs'] = 'Low-Moderate (40-45%)'
        elif goal == 'weight_gain':
            nutrition['calories'] += 500
            nutrition['protein'] = 'High (25%)'
            nutrition['carbs'] = 'High (50%)'

        daily_plan = {
            'breakfast': 'Oatmeal with berries and a handful of walnuts.',
            'lunch': 'Grilled chicken breast with quinoa and mixed green salad.',
            'dinner': 'Baked salmon with steamed asparagus and sweet potato.',
            'snacks': 'Greek yogurt with almonds or apple slices.'
        }
        
        warnings = []
        insights = [f"Based on your BMI of {bmi_info['bmi']}, your primary goal should be {goal.replace('_', ' ')}."]
        groceries = ["Spinach", "Broccoli", "Chicken Breast / Tofu", "Berries", "Quinoa", "Walnuts", "Greek Yogurt"]

        # Adjust for medical
        if 'diabetes_risk' in conditions:
            nutrition['carbs'] = 'Low, Complex Only (30-35%)'
            daily_plan['breakfast'] = 'Scrambled eggs with spinach and avocado (No bread).'
            daily_plan['lunch'] = 'Large leafy green salad with grilled turkey and olive oil.'
            daily_plan['snacks'] = 'Handful of almonds or celery sticks with peanut butter.'
            warnings.append("⚠️ Strictly avoid refined sugars, juices, and processed carbs.")
            insights.append("🩸 AI detected elevated sugar risk. Carb intake has been drastically restricted.")
            groceries = ["Eggs", "Spinach", "Avocado", "Turkey", "Olive Oil", "Almonds"]
            
        if 'cardio_risk' in conditions or 'hypertension' in conditions:
            nutrition['fat'] = 'Low, Healthy Fats Only (20%)'
            daily_plan['dinner'] = 'Steamed fish with broccoli and a small portion of brown rice.'
            warnings.append("⚠️ Drastically reduce sodium (salt) intake and avoid fried/fatty foods.")
            insights.append("🫀 AI adjusted your plan to heart-healthy, low-sodium options due to vascular risk markers.")
            groceries.append("Oats")
            groceries.append("Salmon")
            
        if 'tired' in text.lower() or 'fatigue' in text.lower():
            daily_plan['snacks'] = 'Banana with chia seeds and green tea to boost sustained energy.'
            insights.append("⚡ Fatigue detected. Adjusted snacks to include B-vitamins and slow-release energy sources.")
            
        # Compile response
        return {
            'bmi_info': bmi_info,
            'goal': goal,
            'conditions': conditions,
            'nutrition': nutrition,
            'daily_plan': daily_plan,
            'warnings': warnings,
            'insights': insights,
            'groceries': groceries
        }
