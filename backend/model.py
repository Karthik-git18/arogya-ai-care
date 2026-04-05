import pandas as pd
import numpy as np
import os
import re
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

try:
    import nltk
    nltk.data.find('tokenizers/punkt')
except LookupError:
    import nltk
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

class DiseasePredictor:
    def __init__(self):
        self.disease_data = {}
        self.model = None
        self.disease_list = []
        self.medicine_db = {}
        self.synonym_map = {
            'tired': 'fatigue', 'weakness': 'fatigue',
            'cold': 'common cold', 'runny nose': 'common cold',
            'flu': 'influenza', 'swine flu': 'influenza',
            'cough': 'cough', 'cold cough': 'cough',
            'body pain': 'joint pain', 'muscle pain': 'back pain',
            'acne': 'skin rash', 'pimples': 'skin rash',
            'itching': 'allergy', 'itch': 'allergy',
            'stomach pain': 'gastritis', 'abdominal pain': 'acidity',
            'loose stool': 'diarrhea', 'loose motion': 'diarrhea',
            'difficult breathing': 'asthma', 'breathlessness': 'asthma',
            'sore eyes': 'eye irritation', 'burning eyes': 'eye irritation',
            'dental pain': 'toothache', 'gum pain': 'toothache',
            'neck pain': 'cervical spondylosis', 'shoulder pain': 'cervical spondylosis',
            'high blood sugar': 'diabetes', 'low blood pressure': 'hypertension'
        }
        self.critical_symptoms = [
            'chest pain', 'severe chest pain', 'breathing difficulty', 'severe breathing difficulty',
            'severe bleeding', 'heavy bleeding', 'loss of consciousness', 'unconscious',
            'heart attack', 'stroke', 'severe burns', 'fracture', 'poisoning'
        ]
        self.load_and_train()
        
    def load_and_train(self):
        """Load datasets and train ML model"""
        try:
            base_path = os.path.dirname(os.path.abspath(__file__))
            dataset_path = os.path.join(base_path, 'datasets')
            
            # Load medicine database
            medicine_path = os.path.join(base_path, 'medicine_db.json')
            if os.path.exists(medicine_path):
                with open(medicine_path, 'r') as f:
                    self.medicine_db = json.load(f)
            
            # Load datasets
            s2d_df = pd.read_csv(os.path.join(dataset_path, 'Symptom2Disease.csv'))
            desc_df = pd.read_csv(os.path.join(dataset_path, 'symptom_Description.csv'))
            prec_df = pd.read_csv(os.path.join(dataset_path, 'symptom_precaution.csv'))
            
            # Build disease info lookup
            unique_diseases = s2d_df['label'].unique()
            for disease in unique_diseases:
                d_key = str(disease).strip().lower()
                self.disease_data[d_key] = {
                    "original_name": disease,
                    "description": "Information not available for this condition.",
                    "precautions": []
                }
            
            # Populate Description
            for _, row in desc_df.iterrows():
                d_input = str(row['Disease']).strip().lower()
                if d_input in self.disease_data:
                    self.disease_data[d_input]["description"] = str(row['Description'])
            
            # Populate Precautions
            for _, row in prec_df.iterrows():
                d_input = str(row['Disease']).strip().lower()
                if d_input in self.disease_data:
                    precs = []
                    for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
                        if col in row and pd.notna(row[col]):
                            val = str(row[col]).strip()
                            if val: precs.append(val.capitalize())
                    self.disease_data[d_input]["precautions"] = precs
            
            # Prepare training data for TF-IDF + Naive Bayes
            texts = []
            labels = []
            for _, row in s2d_df.iterrows():
                text = str(row['text']).lower()
                label = str(row['label']).strip()
                texts.append(text)
                labels.append(label)
            
            self.disease_list = sorted(list(set(labels)))
            
            # Train TF-IDF + Multinomial Naive Bayes
            self.model = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=200, stop_words='english', ngram_range=(1, 2))),
                ('nb', MultinomialNB())
            ])
            
            self.model.fit(texts, labels)
            print("✓ Model trained successfully with TF-IDF + Naive Bayes + Medicine DB")
            
        except Exception as e:
            print(f"✗ Error loading datasets: {e}")
            import traceback
            traceback.print_exc()
    
    def clean_text(self, text):
        """NLP preprocessing: clean text, lowercase, remove punctuation, tokenize"""
        text = str(text).lower()
        text = re.sub(r'[^\w\s]', '', text)
        tokens = text.split()
        return ' '.join(tokens)
    
    def apply_synonyms(self, text):
        """Apply synonym mapping for better disease matching"""
        cleaned_text = self.clean_text(text)
        for synonym, replacement in self.synonym_map.items():
            cleaned_text = cleaned_text.replace(synonym, replacement)
        return cleaned_text
    
    def extract_symptom_keywords(self, text):
        """Extract important symptom keywords from text"""
        cleaned = self.clean_text(text)
        keywords = [kw.strip() for kw in cleaned.split(',')]
        return [kw for kw in keywords if kw]
    
    def check_critical_symptoms(self, text):
        """Detect critical symptoms that need emergency intervention"""
        text_lower = str(text).lower()
        for symptom in self.critical_symptoms:
            if symptom in text_lower:
                return True
        return False
    
    def get_medicine_data(self, disease_name):
        """Retrieve medicine data for predicted disease"""
        disease_key = disease_name.lower().strip()
        
        # Try exact match
        if disease_key in self.medicine_db:
            return self.medicine_db[disease_key]
        
        # Try partial match
        for db_key, medicine_info in self.medicine_db.items():
            if db_key in disease_key or disease_key in db_key:
                return medicine_info
        
        # Return default if not found
        return {
            "medicines": ["Consult your doctor for prescription"],
            "dosage": "As advised by physician",
            "timing": "As per doctor's guidance",
            "precautions": "Follow medical professional's advice"
        }
    
    def generate_explanation(self, symptoms_list, disease_name):
        """Generate explainable NLP recommendation"""
        if not symptoms_list:
            return f"This recommendation is based on standard treatment guidelines for {disease_name}."
        
        symptoms_str = ', '.join(symptoms_list[:3])
        if len(symptoms_list) > 3:
            symptoms_str += f" and {len(symptoms_list) - 3} more symptoms"
        
        return f"This recommendation is based on detected symptoms: {symptoms_str}."
    
    def predict(self, symptoms_text, context_symptoms=None):
        """Predict disease from symptoms using trained ML model + medicine suggestions"""
        try:
            if not self.model:
                return {'error': 'Model not trained'}
            
            current_text = str(symptoms_text).lower().strip()
            
            if not current_text:
                return {'error': 'No symptoms provided'}
            
            # Check for emergency keywords
            if self.check_critical_symptoms(current_text):
                return {
                    'emergency': True,
                    'message': "🚨 This may be a medical emergency. Please call emergency services immediately.",
                    'medicines': {
                        'disease': 'EMERGENCY - SEEK IMMEDIATE HELP',
                        'medicines': ['Call Emergency Services - 911 or 108'],
                        'dosage': 'Not applicable',
                        'timing': 'Immediately',
                        'precautions': 'Do not delay - seek professional emergency help'
                    }
                }
            
            # Apply NLP preprocessing and synonyms
            processed_text = self.apply_synonyms(current_text)
            symptom_keywords = self.extract_symptom_keywords(processed_text)
            
            # Use trained model to predict
            predicted_disease = self.model.predict([processed_text])[0]
            probabilities = self.model.predict_proba([processed_text])[0]
            
            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            top_diseases = [self.model.classes_[i] for i in top_indices]
            top_probs = [int(probabilities[i] * 100) for i in top_indices]
            
            # Build response with medicines
            predictions = []
            for disease, prob in zip(top_diseases, top_probs):
                d_key = disease.lower()
                d_info = self.disease_data.get(d_key, {
                    "original_name": disease,
                    "description": "Common health condition.",
                    "precautions": ["Consult a healthcare provider", "Rest", "Stay hydrated"]
                })
                predictions.append({
                    "name": d_info.get("original_name", disease),
                    "probability": prob,
                    "description": d_info.get("description", ""),
                    "precautions": d_info.get("precautions", [])
                })
            
            primary = predictions[0]
            
            # Get medicine data for primary prediction
            medicine_data = self.get_medicine_data(primary['name'])
            explanation = self.generate_explanation(symptom_keywords, primary['name'])
            
            return {
                'success': True,
                'extracted_symptoms': symptom_keywords,
                'predictions': predictions,
                'description': primary['description'],
                'precautions': primary['precautions'],
                'doctor_explanation': f"Based on your symptoms, this appears to be **{primary['name']}**. {primary['description']}",
                'follow_up': "Please consult a healthcare professional for proper diagnosis and treatment.",
                'severity_color': "#10B981",
                'medicines': {
                    'disease': primary['name'],
                    'medicines': medicine_data.get('medicines', []),
                    'dosage': medicine_data.get('dosage', 'As advised by physician'),
                    'timing': medicine_data.get('timing', 'As per guidance'),
                    'precautions': medicine_data.get('precautions', ''),
                    'explanation': explanation
                }
            }
            
        except Exception as e:
            print(f"Prediction Error: {e}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}


if __name__ == '__main__':
    predictor = DiseasePredictor()
    result = predictor.predict("fever and headache")
    print(result)
