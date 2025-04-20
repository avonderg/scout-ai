from io import BytesIO
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import onnxruntime as ort
import pandas as pd
import os
import uvicorn

# === Load ONNX model and species list ===
onnx_model_path = "model/bird_classifier.onnx"
session = ort.InferenceSession(onnx_model_path)

# Load class labels
df = pd.read_csv("../model/labels.csv")
species_list = sorted(df["species"].unique())

# === Set up FastAPI app ===
app = FastAPI()

# Enable frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Image preprocessing for ONNX ===
def preprocess_image(image_bytes):
    image = Image.open(image_bytes).resize((224, 224)).convert("RGB")
    image = np.array(image).astype("float32") / 255.0
    image = np.expand_dims(image, axis=0)  # Shape: (1, 224, 224, 3)
    return image

# === Prediction endpoint ===
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_data = await file.read()

    # Process image
    image_array = preprocess_image(BytesIO(image_data))
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: image_array})
    preds = outputs[0]

    top_idx = int(np.argmax(preds))
    confidence = float(np.max(preds))

    return {
        "species": species_list[top_idx],
        "confidence": f"{confidence:.2%}",
        "class_index": top_idx
    }

# Optional: run locally
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
