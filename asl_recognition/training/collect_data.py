import cv2
import mediapipe as mp
import os
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import time
from uuid import uuid4

# CONFIG
SIGN = input("Enter sign label (e.g. A, B, hello): ").strip()
SEQUENCE_LENGTH = 10  # frames per sequence
SAVE_DIR = os.path.join("../data", "custom", SIGN)
os.makedirs(SAVE_DIR, exist_ok=True)

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

# Webcam
cap = cv2.VideoCapture(0)
num_captured = 0

print(f"Capturing data for sign '{SIGN}' — press 's' to record a sequence, 'q' to quit.")

sequence_data = []

def extract_landmarks(landmarks, frame_idx):
    wrist = landmarks.landmark[0]
    rows = []
    for i, lm in enumerate(landmarks.landmark):
        rows.append({
            "frame": frame_idx,
            "row_id": "".join((str(frame_idx), "-", "right_hand", "-", str(i))), #TODO: detect between left and right hands?
            "type": "right_hand",  # or "left_hand" if needed
            "landmark_index": i,
            "x": lm.x - wrist.x, # Normalise position of landmarks based on the wrist. Will keep landmark positions consistent
            "y": lm.y - wrist.y,
            #"z": lm.z
        })
    return rows

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        continue

    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)

    annotated = frame.copy()
    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(annotated, handLms, mp_hands.HAND_CONNECTIONS)

    cv2.imshow("Collecting Sign Data", annotated)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('s'):
        num_captured += 1
        print(f"Recording {SEQUENCE_LENGTH} frames...")
        sequence = []
        frames_collected = 0
         
        while frames_collected < SEQUENCE_LENGTH:
            ret, frame = cap.read()
            if not ret:
                continue
                     
            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)
             
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                sequence.extend(extract_landmarks(hand_landmarks, frames_collected))
                frames_collected += 1
                 
            annotated = frame.copy()
            if results.multi_hand_landmarks:
                mp_draw.draw_landmarks(annotated, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
            cv2.putText(annotated, f"Saved Samples: {num_captured}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.imshow("Collecting Sign Data", annotated)
            cv2.waitKey(1)

        # Save to .parquet
        df = pd.DataFrame(sequence)
        file_name = f"{SIGN}_{uuid4().hex[:8]}.parquet"
        pq.write_table(pa.Table.from_pandas(df), os.path.join(SAVE_DIR, file_name))
        print(f"✅ Saved: {file_name}")

    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()