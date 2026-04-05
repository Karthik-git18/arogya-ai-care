import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class NLPUtils:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.emergency_keywords = ['chest pain', 'breathing', 'severe bleeding', 'heart attack', 'stroke', 'unconscious', 'fainting', 'severe pain']
        self.symptom_keywords = ['fever', 'headache', 'cough', 'cold', 'pain', 'nausea', 'vomiting', 'dizzy', 'dizziness', 'stomach', 'ache', 'rash', 'itch', 'fatigue', 'weakness', 'throat']
        self.duration_pattern = re.compile(r'(\d+)\s*(days?|weeks?|months?|years?|hrs?|hours?)')

    def tokenize(self, text):
        try:
            text = str(text).lower()
            text = re.sub(r'[^a-z\s]', '', text)
            tokens = word_tokenize(text)
            return [token for token in tokens if token not in self.stop_words and len(token) > 1]
        except:
            return []
            
    def check_emergency(self, text):
        text_lower = str(text).lower()
        return any(ekw in text_lower for ekw in self.emergency_keywords)

    def extract_symptoms(self, text):
        text_lower = str(text).lower()
        found_symptoms = []
        for kw in self.symptom_keywords:
            if kw in text_lower:
                found_symptoms.append(kw)
        
        # Attempt minimal compound detection
        if "stomach pain" in text_lower and "stomach" in found_symptoms:
            found_symptoms.remove("stomach")
            if "pain" in found_symptoms: found_symptoms.remove("pain")
            found_symptoms.append("stomach pain")
            
        duration_match = self.duration_pattern.search(text_lower)
        duration = duration_match.group(0) if duration_match else None
        
        return found_symptoms, duration

    def get_intent_and_entities(self, text):
        text_lower = str(text).lower()
        
        if self.check_emergency(text_lower):
            return {'intent': 'emergency'}
            
        found_symptoms, duration = self.extract_symptoms(text_lower)
        # If symptoms found or explicitly saying they are sick
        if len(found_symptoms) > 0 or any(word in text_lower for word in ['symptom', 'sick', 'ill']):
            return {
                'intent': 'symptom',
                'symptoms': found_symptoms,
                'duration': duration
            }
            
        if any(word in text_lower for word in ['what should i do', 'help', 'advice', 'treatment', 'medication']):
            return {'intent': 'follow_up'}
            
        if any(word in text_lower for word in ['diet', 'food', 'exercise', 'workout', 'fit', 'healthy']):
            return {'intent': 'general_health'}
            
        if any(word in text_lower for word in ['hello', 'hi', 'hey', 'greet']):
            return {'intent': 'greeting'}
            
        if 'report' in text_lower or 'explain' in text_lower:
            return {'intent': 'report_inquiry'}

        return {'intent': 'general'}
