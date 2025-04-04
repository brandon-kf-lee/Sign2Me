import cv2
import mediapipe as mp
import numpy as np
import joblib
from collections import deque, Counter
import pandas as pd

# CONFIG
MODEL_PATH = "asl_knn_model.pkl"
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

        # Extract 21 (x, y, z) landmarks
        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

        sequence.append(landmarks)

        if len(sequence) == SEQUENCE_LENGTH:
            # Flatten the 10-frame sequence
            input_data = np.array(sequence).flatten().reshape(1, -1)

            # Make prediction
            prediction = model.predict(input_data)[0]

            # Smoothen prediction
            recent_predictions.append(prediction)
            smoothed = Counter(recent_predictions).most_common(1)[0][0]

            prediction_text = f"Sign: {smoothed}"
            cv2.putText(frame_output, prediction_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0, 255, 0), 2, cv2.LINE_AA)

    else:
        sequence.clear()

    cv2.imshow("Live ASL Prediction", frame_output)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()