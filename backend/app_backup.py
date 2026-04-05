from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import io

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model import DiseasePredictor
from nlp_utils import NLPUtils
from report_analyzer import ReportAnalyzer
from diet_planner import DietPlanner

app = Flask(__name__)
CORS(app)

# Initialize components
try:
    predictor = DiseasePredictor()
    print("✓ Disease predictor initialized")
except Exception as e:
    print(f"✗ Error initializing predictor: {e}")
    predictor = None

nlp = NLPUtils()
analyzer = ReportAnalyzer()
planner = DietPlanner()

# Data storage
USERS_FILE = 'users.json'
PROFILES_FILE = 'profiles.json'

def load_json(filename):
    try:
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                return json.load(f)
    except:
        pass
    return {}

def save_json(filename, data):
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving {filename}: {e}")

# Routes - Static Files
@app.route('/')
def index():
    base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(base_path, 'index.html')

@app.route('/login')
def login_page():
    base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(base_path, 'login.html')

@app.route('/dashboard')
def dashboard():
    base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    return send_from_directory(base_path, 'dashboard.html')

@app.route('/js/<path:filename>')
def serve_js(filename):
    try:
        base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'js')
        return send_from_directory(base_path, filename)
    except:
        return jsonify({'error': 'Not found'}), 404

@app.route('/css/<path:filename>')
def serve_css(filename):
    try:
        base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'css')
        return send_from_directory(base_path, filename)
    except:
        return jsonify({'error': 'Not found'}), 404

@app.route('/<path:filename>')
def static_files(filename):
    try:
        base_path = os.path.join(os.path.dirname(__file__), '..')
        if filename.endswith('.css'):
            return send_from_directory(os.path.join(base_path, 'frontend', 'css'), filename)
        elif filename.endswith('.js'):
            return send_from_directory(os.path.join(base_path, 'frontend', 'js'), filename)
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
            return send_from_directory(os.path.join(base_path, 'frontend', 'assets'), filename)
        return send_from_directory(os.path.join(base_path, 'frontend'), filename)
    except:
        return jsonify({'error': 'Not found'}), 404

# Routes - Authentication
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    users = load_json(USERS_FILE)
    
    email = data.get('email')
    if email in users:
        return jsonify({'success': False, 'error': 'Email already registered'}), 400
    
    users[email] = {
        'name': data.get('name'),
        'password': data.get('password'),
        'created': datetime.now().isoformat()
    }
    save_json(USERS_FILE, users)
    
    return jsonify({'success': True, 'user': {'email': email, 'name': data.get('name')}})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    users = load_json(USERS_FILE)
    
    email = data.get('email')
    password = data.get('password')
    
    if email in users and users[email]['password'] == password:
        return jsonify({'success': True, 'user': {'email': email, 'name': users[email]['name']}})
    
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

# Routes - Symptom Checker
@app.route('/api/predict', methods=['POST'])
def predict():
    if not predictor:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        symptoms = data.get('symptoms', '').strip()
        context_symptoms = data.get('context_symptoms', [])
        
        if not symptoms and not context_symptoms:
            return jsonify({
                'error': 'Please enter your symptoms to continue.'
            }), 400
        
        print(f"✓ Symptom prediction request: {symptoms}")
        result = predictor.predict(symptoms, context_symptoms=context_symptoms)
        return jsonify(result)
        
    except Exception as e:
        print(f"✗ Predict error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Routes - Medicine Finder (Simple NLP-based, independent of prediction)
@app.route('/api/medicines', methods=['POST'])
def find_medicines():
    """Simple NLP-based medicine finder - maps symptoms directly to medicines"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symptom_input = data.get('symptom', '').strip().lower()
        
        if not symptom_input:
            return jsonify({'error': 'Please enter a symptom'}), 400
        
        # Simple dictionary-based NLP mapping
        medicine_map = {
            'fever': {
                'medicines': ['Paracetamol', 'Ibuprofen'],
                'dosage': '500mg every 6-8 hours',
                'timing': 'After food',
                'precautions': 'Stay hydrated, rest well'
            },
            'headache': {
                'medicines': ['Paracetamol', 'Aspirin'],
                'dosage': '500mg as needed',
                'timing': 'After food',
                'precautions': 'Rest in a quiet place'
            },
            'cough': {
                'medicines': ['Dextromethorphan', 'Honey cough syrup'],
                'dosage': '10ml syrup twice daily',
                'timing': 'After meals',
                'precautions': 'Drink warm water frequently'
            },
            'sore throat': {
                'medicines': ['Lozenges', 'Ibuprofen'],
                'dosage': 'As needed',
                'timing': 'After food',
                'precautions': 'Gargle with warm salt water'
            },
            'cold': {
                'medicines': ['Cetirizine', 'Vitamin C'],
                'dosage': 'Once daily',
                'timing': 'Before sleep',
                'precautions': 'Avoid cold drinks, stay warm'
            },
            'back pain': {
                'medicines': ['Ibuprofen', 'Diclofenac'],
                'dosage': 'Twice daily',
                'timing': 'After food',
                'precautions': 'Avoid heavy lifting'
            },
            'joint pain': {
                'medicines': ['Paracetamol', 'Glucosamine'],
                'dosage': 'Twice daily',
                'timing': 'After food',
                'precautions': 'Apply warm compress'
            },
            'acidity': {
                'medicines': ['Pantoprazole', 'Antacids'],
                'dosage': 'Once daily',
                'timing': 'Before meals',
                'precautions': 'Eat light meals, avoid spicy food'
            },
            'diarrhea': {
                'medicines': ['ORS', 'Loperamide'],
                'dosage': 'After each loose stool',
                'timing': 'As needed',
                'precautions': 'Stay hydrated with water and ORS'
            },
            'constipation': {
                'medicines': ['Isabgol', 'Lactulose'],
                'dosage': 'Once daily',
                'timing': 'At night',
                'precautions': 'Eat fiber-rich food'
            },
            'allergy': {
                'medicines': ['Cetirizine', 'Loratadine'],
                'dosage': 'Once daily',
                'timing': 'Before sleep',
                'precautions': 'Avoid allergens'
            },
            'skin rash': {
                'medicines': ['Calamine lotion', 'Hydrocortisone cream'],
                'dosage': 'Apply twice daily',
                'timing': 'External use',
                'precautions': 'Keep area clean and dry'
            },
            'migraine': {
                'medicines': ['Sumatriptan', 'Ibuprofen'],
                'dosage': 'At onset',
                'timing': 'As needed',
                'precautions': 'Avoid bright light and noise'
            },
            'asthma': {
                'medicines': ['Salbutamol inhaler'],
                'dosage': '2 puffs as needed',
                'timing': 'During breathing difficulty',
                'precautions': 'Keep inhaler always handy'
            },
            'nausea': {
                'medicines': ['Ondansetron', 'Ginger tea'],
                'dosage': 'As needed',
                'timing': 'Before meals',
                'precautions': 'Eat light meals, stay hydrated'
            },
            'anxiety': {
                'medicines': ['Ashwagandha', 'Meditation'],
                'dosage': 'Daily',
                'timing': 'Morning and evening',
                'precautions': 'Consult doctor for severe cases'
            }
        }
        
        # Try exact match first
        if symptom_input in medicine_map:
            return jsonify({
                'success': True,
                'symptom': symptom_input,
                'medicines': medicine_map[symptom_input],
                'matched': 'exact'
            })
        
        # Try partial keyword matching
        for key, value in medicine_map.items():
            if key in symptom_input or symptom_input in key:
                return jsonify({
                    'success': True,
                    'symptom': key,
                    'medicines': value,
                    'matched': 'keyword'
                })
        
        # No match found
        return jsonify({
            'success': False,
            'error': 'No medicine data available for this symptom. Please consult a doctor.'
        })
        
    except Exception as e:
        print(f"✗ Medicine finder error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error: {str(e)}'}), 500

# Routes - Chat
@app.route('/api/chat', methods=['POST'])
def chat():
    if not predictor:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({'response': 'No data provided'}), 400
            
        message = data.get('message', '').strip()
        context = data.get('context', {'symptoms': []})
        report_data = data.get('reportData', {})
        
        if not message:
            return jsonify({'response': 'Please type a message to continue.'}), 400
        
        print(f"✓ Chat message: {message}")
        
        # Greetings
        greet_words = ['hello', 'hi', 'hey', 'greet', 'good morning', 'good evening', 'good afternoon', 'halo', 'namaste']
        if any(g in message.lower() for g in greet_words):
            return jsonify({
                'response': "👋 Hello! I'm your Arogya AI Health Assistant. I can help you with:\n\n• 🩺 **Symptom Analysis** - Describe your symptoms\n• 📋 **Medical Reports** - Explain your test results\n• 🥗 **Health Advice** - Get personalized wellness tips\n• 💊 **Diet Planning** - Custom meal suggestions\n\nHow can I assist you today?",
                'context': context
            })
        
        # Health advice keywords
        if any(x in message.lower() for x in ['diet', 'food', 'eat', 'nutrition', 'recipe', 'meal']):
            return jsonify({
                'response': "🥗 For personalized diet advice, please go to the **Diet Planner** section on the dashboard. I can analyze your health metrics and create a custom meal plan for you!",
                'context': context
            })
        
        # Report analysis
        if any(r in message.lower() for r in ['report', 'lab', 'result', 'test', 'score', 'analyze']):
            if not report_data or not report_data.get('health_score'):
                return jsonify({
                    'response': "📄 You haven't uploaded a medical report yet. Please upload a report in the **Dashboard** section, and I can analyze it for you!",
                    'context': context
                })
            else:
                score = report_data.get('health_score', 'unknown')
                diseases = report_data.get('diseases', [])
                response_text = f"📊 **Your Health Report Analysis:**\n\n• Health Score: **{score}/100**"
                if diseases:
                    response_text += f"\n• Detected Conditions: **{', '.join(diseases)}**"
                response_text += "\n\n*Please consult a healthcare professional for confirmation and treatment options.*"
                return jsonify({'response': response_text, 'context': context})
        
        # Default to symptom prediction
        result = predictor.predict(message, context_symptoms=context.get('symptoms', []))
        
        if result.get('emergency'):
            return jsonify({
                'response': "🚨 **MEDICAL EMERGENCY DETECTED:**\n\n" + result.get('message', 'Seek immediate medical attention!'),
                'context': context
            })
        
        if result.get('error'):
            return jsonify({
                'response': f"I couldn't analyze that properly. Could you describe your symptoms more clearly? (e.g., fever, cough, headache)",
                'context': context
            })
        
        if result.get('success'):
            preds = result.get('predictions', [])
            
            # Update context with new symptoms
            new_symptoms = list(set(context.get('symptoms', []) + result.get('extracted_symptoms', [])))
            context['symptoms'] = new_symptoms
            
            if preds:
                primary = preds[0]
                response_text = f"🩺 **AI Analysis Result:**\n\n**Most Likely:** {primary['name']} ({primary['probability']}%)\n\n"
                
                if len(preds) > 1:
                    response_text += "**Other Possibilities:**\n"
                    for p in preds[1:]:
                        response_text += f"• {p['name']} ({p['probability']}%)\n"
                    response_text += "\n"
                
                if primary.get('description'):
                    response_text += f"**About this condition:** {primary['description']}\n\n"
                
                if primary.get('precautions'):
                    response_text += "**Recommended Actions:**\n"
                    for prec in primary['precautions'][:3]:
                        response_text += f"• {prec}\n"
                    response_text += "\n"
                
                response_text += "⚠️ *This is AI analysis only. Please consult a healthcare professional for proper diagnosis.*"
            else:
                response_text = "I couldn't identify specific symptoms. Could you provide more details about what you're experiencing?"
            
            return jsonify({'response': response_text, 'context': context})
        
        return jsonify({
            'response': "I didn't quite understand that. Please describe your symptoms or ask about your health.",
            'context': context
        })
        
    except Exception as e:
        print(f"✗ Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'response': f'Sorry, I encountered an error: {str(e)}'
        }), 500

# Routes - Report Analysis
@app.route('/api/analyze', methods=['POST'])
def analyze():
    report_text = None
    
    # Handle JSON text input
    if request.is_json:
        report_text = request.json.get('report_text', '')
    
    # Handle PDF file upload
    elif 'pdf_file' in request.files:
        if not fitz:
            return jsonify({'error': 'PDF support not available. Please install PyMuPDF.'}), 400
        
        pdf_file = request.files['pdf_file']
        
        if pdf_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Please upload a PDF file only'}), 400
        
        try:
            # Read PDF and extract text using PyMuPDF
            pdf_bytes = pdf_file.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            report_text = ''
            for page in doc:
                report_text += page.get_text() + '\n'
        except Exception as e:
            return jsonify({'error': f'Error reading PDF: {str(e)}'}), 400
    
    if not report_text or not report_text.strip():
        return jsonify({'error': 'No report text provided'}), 400
    
    try:
        # Analyze the report with the new Medical Rule Engine
        analysis_result = analyzer.analyze(report_text)
        
        # Extract patient information from report
        patient_info = extract_patient_info(report_text)
        
        # Combine everything
        response_data = analysis_result
        response_data['patient_info'] = patient_info
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500

from pdf_generator import generate_medical_pdf
from flask import send_file
import io

@app.route('/api/generate_pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    if not data or not data.get('reportData'):
        return jsonify({'error': 'No report data available'}), 400
        
    report_data = data.get('reportData')
    
    try:
        pdf_bytes = generate_medical_pdf(report_data)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='AI_Medical_Report.pdf'
        )
    except Exception as e:
        print(f"PDF Error: {str(e)}")
        return jsonify({'error': f"Failed to generate PDF: {str(e)}"}), 500


def extract_patient_info(text):
    """Extract patient name, age, gender from report text"""
    import re
    
    patient_info = {
        'name': None,
        'age': None,
        'gender': None
    }
    
    # Try to extract name (look for "Patient Name:", "Name:", etc.)
    name_patterns = [
        r'patient\s+name[:\s]+([A-Za-z\s]+?)(?:\n|$)',
        r'^name[:\s]+([A-Za-z\s]+?)(?:\n|$)',
        r'patient[:\s]+([A-Za-z\s]+?)(?:\n|$)',
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            name = match.group(1).strip()
            # Clean up the name - remove common words that shouldn't be there
            name = re.sub(r'\s*(age|gender|id|patient|report|analysis)\s*.*', '', name, flags=re.IGNORECASE).strip()
            if name and len(name) > 2 and not any(word in name.lower() for word in ['patient', 'report', 'analysis', 'date', 'vitals']):
                patient_info['name'] = name
                break
    
    # Extract age (look for age: XX or XX years)
    age_patterns = [
        r'age[:\s]+(\d{1,3})',
        r'(\d{1,3})\s+years?',
        r'age\s+(\d{1,3})',
    ]
    
    for pattern in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            age = match.group(1)
            try:
                age_num = int(age)
                if 1 <= age_num <= 120:
                    patient_info['age'] = age_num
                    break
            except:
                pass
    
    # Extract gender
    gender_patterns = [
        r'gender[:\s]+(male|female|m|f)',
        r'sex[:\s]+(male|female|m|f)',
        r'\b(male|female)\b',
    ]
    
    for pattern in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = match.group(1).lower()
            patient_info['gender'] = 'Male' if gender in ['male', 'm'] else 'Female'
            break
    
    return patient_info


# Health Keywords for NLP Analysis
HEALTH_KEYWORDS = {
    'weight': ['weight', 'overweight', 'heavy', 'fat', 'obese', 'pounds', 'kg'],
    'fatigue': ['tired', 'fatigue', 'exhausted', 'sleepy', 'energy', 'weak', 'lethargic'],
    'stress': ['stress', 'anxious', 'anxiety', 'worried', 'depressed', 'mood'],
    'sleep': ['sleep', 'insomnia', 'rest', 'sleepless', 'sleep disorder'],
    'diet': ['diet', 'eating', 'food', 'junk food', 'fast food', 'unhealthy'],
    'exercise': ['exercise', 'workout', 'gym', 'running', 'walk', 'fitness'],
    'digestion': ['digestion', 'stomach', 'bloating', 'constipation', 'acid reflux']
}

def analyze_health_text(text):
    """Use NLP to detect health issues from user text"""
    if not text:
        return {}
    
    text_lower = text.lower()
    detected = {}
    
    for category, keywords in HEALTH_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                detected[category] = True
                break
    
    return detected

def generate_ai_insights(bmi_category, detected_issues):
    """Generate personalized health insights"""
    insights = []
    
    if detected_issues.get('weight'):
        insights.append("📊 Weight Management: You mentioned weight concerns. Track calorie intake and exercise regularly.")
    
    if detected_issues.get('fatigue'):
        insights.append("⚡ Energy Levels: Fatigue detected. Increase protein intake, stay hydrated, and get adequate sleep.")
    
    if detected_issues.get('stress'):
        insights.append("😌 Stress Relief: Practice meditation, yoga, or light physical activity to manage stress.")
    
    if detected_issues.get('sleep'):
        insights.append("😴 Sleep Quality: Ensure 7-9 hours of quality sleep. Avoid screens 1 hour before bed.")
    
    if detected_issues.get('digestion'):
        insights.append("🫘 Digestive Health: Include fiber-rich foods, probiotics, and stay well hydrated.")
    
    # BMI-specific insights
    if bmi_category == 'Overweight' or bmi_category == 'Obese':
        insights.append("⚖️ BMI Status: Your BMI indicates a need for calorie deficit and regular physical activity.")
    elif bmi_category == 'Underweight':
        insights.append("💪 BMI Status: Focus on nutrient-dense, calorie-rich foods to reach a healthy weight.")
    else:
        insights.append("✅ BMI Status: Your BMI is healthy. Maintain your current healthy lifestyle habits.")
    
    return insights

def generate_personalized_meals(goal, bmi_category, detected_issues):
    """Generate meals tailored to user's needs and detected issues"""
    meals = []
    
    # Base meals for goal
    if goal == 'weight_loss':
        meals.extend([
            'Grilled chicken with steamed broccoli and quinoa',
            'Salmon with mixed vegetables and brown rice',
            'Greek salad with olive oil dressing and chickpeas',
            'Lentil soup with whole wheat bread',
            'Egg white omelet with mushrooms and spinach'
        ])
    elif goal == 'weight_gain':
        meals.extend([
            'Peanut butter smoothie with banana and whole milk',
            'Chicken with brown rice and avocado',
            'High-protein pancakes with almonds',
            'Whole milk yogurt with granola and honey',
            'Lean beef steak with sweet potato and olive oil'
        ])
    else:  # maintenance
        meals.extend([
            'Balanced chicken and brown rice bowl',
            'Baked fish with roasted vegetables',
            'Turkey sandwich on whole wheat with vegetables',
            'Mixed grain bowl with tofu and vegetables',
            'Pasta with lean meat sauce and salad'
        ])
    
    # Add issue-specific meals
    if detected_issues.get('fatigue'):
        meals.extend([
            '🥩 High-protein: Chicken breast or lean beef for energy',
            '🥚 Eggs for quick protein and B vitamins',
            '🍌 Banana with almond butter for sustained energy'
        ])
    
    if detected_issues.get('stress'):
        meals.extend([
            '🍫 Dark chocolate (70% cocoa) for mood boost',
            '🫐 Blueberries rich in antioxidants',
            '🥜 Almonds for magnesium to calm nerves'
        ])
    
    if detected_issues.get('digestion'):
        meals.extend([
            '🥗 Fiber-rich: Whole grains, vegetables, and legumes',
            '🥒 Fermented foods: Yogurt, kimchi for gut health',
            '💧 Hydrate well: At least 8 glasses daily'
        ])
    
    return meals

def generate_personalized_tips(goal, bmi_category, detected_issues):
    """Generate health tips based on comprehensive analysis"""
    tips = []
    
    # Goal-based tips
    if goal == 'weight_loss':
        tips.extend([
            '🏃 Exercise: 150-300 min of moderate cardio per week',
            '🥗 Diet: Create a 500-750 calorie daily deficit',
            '💧 Hydration: Drink 3-4 liters of water daily'
        ])
    elif goal == 'weight_gain':
        tips.extend([
            '🏋️ Strength training: 3-4 times per week',
            '🍽️ Eat 5-6 small meals throughout the day',
            '🥤 Consume calorie-dense, nutrient-rich foods'
        ])
    else:
        tips.extend([
            '✅ Exercise: Maintain 30 min of daily activity',
            '🥗 Diet: Continue balanced meals with all food groups',
            '⚖️ Monitor: Track weight weekly to maintain level'
        ])
    
    # Issue-specific tips
    if detected_issues.get('fatigue'):
        tips.extend([
            '⚡ Power naps: 20-30 minutes can boost energy',
            '☀️ Morning sunlight: Get 15-30 min for natural energy'
        ])
    
    if detected_issues.get('stress'):
        tips.extend([
            '🧘 Meditation: Practice 10 minutes daily',
            '🚶 Nature walk: 20 minutes in fresh air daily'
        ])
    
    if detected_issues.get('sleep'):
        tips.extend([
            '🛏️ Sleep schedule: Go to bed and wake at same time',
            '🌙 Sleep environment: Keep room cool, dark, and quiet'
        ])
    
    tips.extend([
        '📊 Progress tracking: Monitor changes weekly',
        '🩺 Medical check-up: Consult doctor for persistent issues'
    ])
    
    return tips

# Routes - Diet Planner with AI Enhancement
@app.route('/api/diet', methods=['POST'])
def diet():
    data = request.json
    height = data.get('height')
    weight = data.get('weight')
    prompt_text = data.get('health_description', '')
    report_data = data.get('report_data', {})
    
    if not height or not weight:
        return jsonify({'error': 'Height and weight required'}), 400
    
    # Generate the Smart Diet dictionary!
    smart_diet = planner.generate_smart_diet(
        text=prompt_text,
        height=float(height),
        weight=float(weight),
        report_data=report_data
    )
    
    return jsonify({
        'success': True,
        'smart_diet': smart_diet
    })

# Routes - Profile
@app.route('/api/profile', methods=['GET', 'POST'])
def profile():
    profiles = load_json(PROFILES_FILE)
    email = request.args.get('email') or request.json.get('email') if request.json else None
    
    if request.method == 'GET':
        if email in profiles:
            return jsonify(profiles[email])
        return jsonify({'name': '', 'age': '', 'height': '', 'weight': '', 'score': 0})
    
    if request.method == 'POST':
        data = request.json
        age = int(data.get('age', 0))
        height = float(data.get('height', 0))
        weight = float(data.get('weight', 0))
        
        completion = 0
        if data.get('name'):
            completion += 25
        if age:
            completion += 25
        if height:
            completion += 25
        if weight:
            completion += 25
        
        bmi_info = planner.calculate_bmi(height, weight) if height and weight else {'bmi': 0}
        score = 75 + completion // 4
        
        profiles[email] = {
            'name': data.get('name', ''),
            'age': age,
            'height': height,
            'weight': weight,
            'score': min(score, 100),
            'completion': completion,
            'bmi': bmi_info['bmi'] if height and weight else 0
        }
        save_json(PROFILES_FILE, profiles)
        
        return jsonify({'success': True, 'profile': profiles[email]})

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  💙 AROGYA AI CARE - Healthcare AI Assistant")
    print("="*60)
    print("  🚀 Server running at: http://localhost:5001")
    print("  🌐 Frontend: http://localhost:5001")
    print("  📡 API: http://localhost:5001/api/")
    print("="*60 + "\n")
    
    # Run on port 5001
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=True)
