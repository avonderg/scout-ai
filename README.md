# Scout-AI

**Project Overview**  
Scout-AI is a full-stack web application that identifies bird species from user-uploaded photos. It pairs a React/TypeScript frontend (deployed on Vercel) with a FastAPI/ONNX backend (hosted on Render). Under the hood, a MobileNetV2 model is fine-tuned on over 200 species using more than 11,000 high-resolution images from the CUB-200-2011 dataset, trained in TensorFlow and converted to ONNX for fast inference.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally)  
- [Model Training](#model-training)  
- [Deployment](#deployment)  
- [Project Structure](#project-structure)  
- [API Reference](#api-reference)  
- [Contributing](#contributing)  

---

## Features

- **Rapid Inference**  
  Upload a bird photo and receive species name and confidence score in seconds.  
- **AI-Generated Descriptions**  
  Fetches a concise, one-sentence fact about each species via OpenAI.  
- **Responsive UI**  
  Built with React, Material UI theming, and smooth scrolling/toast notifications.  
- **Reliable Hosting**  
  Frontend on Vercel; backend on Render for auto-deploys and scalable performance.  

---

## Tech Stack

- **Frontend**  
  React • TypeScript • Material UI • Lottie animation
- **Backend**  
  FastAPI • Uvicorn • ONNX Runtime  
- **Modeling**  
  TensorFlow Keras (MobileNetV2) • tf2onnx → ONNX  
- **Deployment**  
  Vercel (frontend) • Render (backend)  
- **Data**  
  CUB-200-2011 dataset (11,000+ high-res images, 200+ bird species)

---

## Architecture

1. **Upload**  
   React client sends image to `POST /predict`.  
2. **Inference**  
   FastAPI loads `bird_classifier.onnx`, preprocesses the image, runs ONNX Runtime, and returns species name and confidence.  
3. **Description**  
   Frontend calls `POST /api/describe` (in `describe.js`) to retrieve an AI-generated description.  
4. **Display**  
   React renders a result card with species, confidence percentage, and the description.  

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 16 & npm or yarn  
- **Python** ≥ 3.8  

### Installation

```bash
# Clone the repository
git clone https://github.com/avonderg/scout-ai.git
cd scout-ai

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

---
### Running Locally
# Start the backend
`uvicorn main:app --reload --host 0.0.0.0 --port 8000`

# In a separate terminal, start the frontend
`cd frontend`
`npm run dev`

Open your browser to `http://localhost:3000`.

---
### Model Training
The training script (model/train.py) performs:

1. **Data Preparation**
Loads labels and images, resizes them to 224×224 via tf.data.

2. **Model Definition**
Uses a frozen MobileNetV2 backbone with a new classification head.

3. **Training Pipeline**
Applies callbacks: ReduceLROnPlateau, EarlyStopping, ModelCheckpoint.

4. **Export**
Saves the final Keras model and converts it to ONNX with tf2onnx.

To retrain:
```bash
cd model
python train.py
```

---
### Deployment

* **Frontend**
Automatic Vercel deploys on pushes to main.

* **Backend**
Automatic Render deploys from main; no Dockerfile required.

---
### Project Structure
```bash
scout-ai/
├── backend/           # FastAPI application (main.py, bird_classifier.onnx, labels.csv)
├── frontend/          # React application (App.tsx, describe.js, assets)
├── model/             # Training script & data (train.py, labels.csv)
├── test_images/       # Sample photos for manual testing
└── README.md          # This documentation
```
---
### API Reference
`POST /predict`
* **Form Data:** 
* `file` (image)

* Response:

```bash
{
  "species": "012.Red_Winged_Blackbird",
  "confidence": "94.32%",
  "class_index": 12
}
```

`POST /api/describe`
* **JSON Body:**
```bash
{ "species": "Red-Winged Blackbird" }
```

* Response:
``` bash
{
  "description": "The Red-Winged Blackbird is known for its distinctive shoulder patches and melodious song."
}
```

---
### Contributing
-  **Issues**
  * Feel free to open issues for bug reports, feature requests, or questions.

-  **Pull Requests**
* Please open an issue first to discuss your proposed changes.
* All code contributions require review and approval before merging.
* Maintainers reserve the right to revise or adjust contributions to ensure stability.
