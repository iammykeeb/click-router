from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return "OK", 200

@app.route('/click', methods=['POST'])
def handle_click():
    # For Phase 2, we ignore the data and just return a dummy URL
    incoming = request.get_json()
    print(f"Received: {incoming}")
    
    return jsonify({
        "status": "success",
        "final_url": "https://www.google.com/search?q=dummy"
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
