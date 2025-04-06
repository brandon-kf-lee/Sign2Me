from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from collections import deque
import os
import google.generativeai as genai
from dotenv import load_dotenv


# Configuration
MODEL_PATH = "training/asl_knn_model_final.pkl"
SEQUENCE_LENGTH = 10
NUM_LANDMARKS = 21

# Configure Gemini
# Load .env file only when not in production
if os.environ.get("RAILWAY_ENVIRONMENT") is None:
    load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")


# Load trained model
model = joblib.load(MODEL_PATH)

# Sequence buffers
sequence = deque(maxlen=SEQUENCE_LENGTH)
recent_predictions = deque(maxlen=5)

# Flask app
app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "landmarks" not in data:
        return jsonify({"error": "Missing landmark data"}), 400

    landmarks = data["landmarks"]
    if len(landmarks) != NUM_LANDMARKS * 2:
        return jsonify({"error": f"Expected {NUM_LANDMARKS * 2} (x, y) values"}), 400

    # Get target letter from frontend
    target_letter = data.get("target", None)

    # Append to sequence
    sequence.append(landmarks)

    # Check if we have enough frames
    if len(sequence) < SEQUENCE_LENGTH:
        return jsonify({"sign": "", "confidence": "", "feedback": "Waiting for sequence..."})

    # Flatten and reshape for model input
    input_data = np.array(sequence).flatten().reshape(1, -1)

    # Predict
    prediction = model.predict(input_data)[0]
    probs = model.predict_proba(input_data)[0]

    # Get top 2 predictions
    top2_indices = np.argsort(probs)[-2:][::-1]
    top2_labels = [model.classes_[i] for i in top2_indices]
    top2_conf = [probs[i] for i in top2_indices]

    # Smooth prediction
    recent_predictions.append(prediction)
    if len(recent_predictions) >= 3 and all(p == recent_predictions[0] for p in list(recent_predictions)[-3:]):
        final_prediction = prediction
        confidence = f"{top2_conf[0] * 100:.0f}%"

        # feedback = ""

        # # Confidence hint if close
        # if top2_conf[0] - top2_conf[1] < 0.20:
        #     feedback += f" maybe {top2_labels[1]}? "

        # # Special guidance for common confusion
        # if set([top2_labels[0], top2_labels[1]]) <= {"R", "U", "V"}:
        #     feedback += "(Try adjusting finger spacing!)"


        # Gemini Prompt: dynamically build feedback based on confusion
        user_prompt = (
            f"I am a friendly teacher teaching someone ASL letters and words. They tried to sign the letter '{prediction}', "
            f"but our prediction model saw '{final_prediction}' with {confidence} confidence. "
            f"The second most likely guess was '{top2_labels[1]}'. "
            f"The target letter is '{target_letter}'. Use this data to give specific advice, particularly for letter signs that may look similar. "
            f"Can you give them one quick tip to improve their sign for the letter '{target_letter}'?"
        )

        gemini_response = model.generate_content(user_prompt)
        gemini_feedback = gemini_response.text.strip()


        return jsonify({
            "sign": final_prediction,
            "confidence": confidence,
            "top2": [
                {"label": top2_labels[0], "confidence": f"{top2_conf[0]*100:.1f}%"},
                {"label": top2_labels[1], "confidence": f"{top2_conf[1]*100:.1f}%"}
            ],
            "feedback": gemini_feedback  # send Gemini's feedback to frontend
        })

    else:
        return jsonify({
            "sign": "",
            "confidence": "",
            "top2": [],
            "feedback": "Not enough agreement in predictions"
        })

# Dynamic port for Railway
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port)
