import cv2
import mediapipe as mp
import numpy as np
import joblib
from collections import deque, Counter
import pandas as pd

# CONFIG
MODEL_PATH = "training/asl_knn_model_final.pkl"
SEQUENCE_LENGTH = 10
NUM_LANDMARKS = 21

# Load trained model
model = joblib.load(MODEL_PATH)

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

# Sequence buffer
sequence = deque(maxlen=SEQUENCE_LENGTH)

# Queuing recent predictions to smooth output, show most common prediciton over the last few frames
recent_predictions = deque(maxlen=5)

# Webcam
cap = cv2.VideoCapture(0)
print("🎥 Starting prediction. Press 'q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        continue

    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    frame_output = frame.copy()
    prediction_text = ""

    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        mp_draw.draw_landmarks(frame_output, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # Extract 21 (x, y) landmarks, normalise to the wrist (like when training)
        wrist = hand_landmarks.landmark[0]
        landmarks = []
        for i in range(NUM_LANDMARKS):
            lm = hand_landmarks.landmark[i]
            norm_x = lm.x - wrist.x
            norm_y = lm.y - wrist.y
            landmarks.extend([norm_x, norm_y])
        
        sequence.append(landmarks)

        if len(sequence) == SEQUENCE_LENGTH:
            # Flatten the 10-frame sequence
            input_data = np.array(sequence).flatten().reshape(1, -1)

            # Make prediction
            prediction = model.predict(input_data)[0]

            # Get top two predictions
            probs = model.predict_proba(input_data)[0]
            top2_indices = np.argsort(probs)[-2:][::-1]  # Top 2
            top2_labels = [model.classes_[i] for i in top2_indices]
            top2_conf = [probs[i] for i in top2_indices]

            # Smoothen prediction, only show if last 3 predictions were all the same
            recent_predictions.append(prediction)
            if len(recent_predictions) >= 3 and all(p == recent_predictions[0] for p in list(recent_predictions)[-3:]):
                prediction_text = f"Sign: {prediction}"

                # If top 2 are close in probability, offer guidance
                if top2_conf[0] - top2_conf[1] < 0.20:
                    prediction_text += f" maybe {top2_labels[1]}?"

                # If top 2 are either R, U, or V, offer guidance
                if set([top2_labels[0], top2_labels[1]]) <= {"R", "U", "V"}:
                    prediction_text += " (Try adjusting finger spacing!)"

            else:
                prediction_text = ""
            
            cv2.putText(frame_output, prediction_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0, 255, 0), 2, cv2.LINE_AA)

    else:
        sequence.clear()

    cv2.imshow("Live ASL Prediction", frame_output)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()