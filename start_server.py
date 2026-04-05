#!/usr/bin/env python3

import sys
import os

# Change to app directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

if __name__ == '__main__':
    from backend.app import app
    print("="*70)
    print("AROGYA AI CARE - Starting Application")
    print("="*70)
    print("✓ Server starting at http://localhost:5000")
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)
