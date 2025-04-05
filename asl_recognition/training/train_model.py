import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report
import joblib
import glob
import pyarrow.parquet as pq

# CONFIG
DATA_DIR = "../data/custom"
SEQUENCE_LENGTH = 10
NUM_LANDMARKS = 21
MODEL_PATH = "../data/asl_knn_model_v1.pkl"

def load_data():
    X, y = [], []

    for sign_name in os.listdir(DATA_DIR):
        sign_dir = os.path.join(DATA_DIR, sign_name)
        if not os.path.isdir(sign_dir):
            continue

        for file in glob.glob(os.path.join(sign_dir, "*.parquet")):
            df = pq.read_table(file).to_pandas()

            # Get all hand landmarks only
            hand_landmarks = df[df['type'] == 'right_hand']
            if len(hand_landmarks) != NUM_LANDMARKS * SEQUENCE_LENGTH:
                continue  # Skip incomplete sequences

            # Flatten sequence
            features = []
            for frame in range(SEQUENCE_LENGTH):
                frame_data = hand_landmarks[hand_landmarks['frame'] == frame]
                frame_data = frame_data.sort_values(by='landmark_index')
                #coords = frame_data[['x', 'y', 'z']].values.flatten()
                coords = frame_data[['x', 'y']].values.flatten()
                features.extend(coords)

            if len(features) == NUM_LANDMARKS * 3 * SEQUENCE_LENGTH:
                X.append(features)
                y.append(sign_name)

    return np.array(X), np.array(y)

print("Loading data...")
X, y = load_data()

print("Training on", len(X), "samples across", len(set(y)), "classes.")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)

# Train model
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("📈 Classification Report:\n")
print(classification_report(y_test, y_pred))

# Save
joblib.dump(model, MODEL_PATH)
print(f"✅ Saved model to {MODEL_PATH}")
