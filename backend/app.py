from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Arogya AI Care Backend Running ��"

@app.route("/health")
def health():
    return {"status": "ok"}
