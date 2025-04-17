import tensorflow as tf
import keras2onnx
import onnx
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (Input, Conv2D, DepthwiseConv2D, MaxPooling2D,
                                     Flatten, Dense, Dropout, BatchNormalization, ReLU)
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping, ModelCheckpoint

# === Load CSV with image paths and labels ===
df = pd.read_csv("model/labels.csv")
species_list = sorted(df["species"].unique())
species_to_index = {species: i for i, species in enumerate(species_list)}
df["label"] = df["species"].map(species_to_index)
num_species = len(species_list)

# === Preprocessing function ===
def process_image(image_path, label):
    image_path = image_path.numpy().decode() if isinstance(image_path.numpy(), bytes) else image_path.numpy()
    full_path = os.path.join("data/CUB_200_2011/images", image_path)
    image = load_img(full_path, target_size=(224, 224))
    image = img_to_array(image) / 255.0
    return image.astype(np.float32), np.int32(label)

# === Wrap it for TF dataset ===
def tf_process_image(image_path, label):
    image, label = tf.py_function(process_image, [image_path, label], [tf.float32, tf.int32])
    image.set_shape([224, 224, 3])
    label.set_shape([])
    return image, label

# === Build dataset ===
image_paths = df["image_filename"].values
labels = df["label"].values

full_ds = tf.data.Dataset.from_tensor_slices((image_paths, labels))
full_ds = full_ds.map(tf_process_image, num_parallel_calls=tf.data.AUTOTUNE)
full_ds = full_ds.shuffle(1000)

# === Split into training/validation ===
val_size = int(0.2 * len(image_paths))
val_ds = full_ds.take(val_size).batch(32).prefetch(tf.data.AUTOTUNE)
train_ds = full_ds.skip(val_size).batch(32).prefetch(tf.data.AUTOTUNE)

# === Define MiniBirdNet (MobileNet-style custom CNN) ===
def depthwise_block(filters):
    return [
        DepthwiseConv2D(kernel_size=3, padding='same'),
        BatchNormalization(),
        ReLU(),
        Conv2D(filters, kernel_size=1, padding='same'),
        BatchNormalization(),
        ReLU(),
        MaxPooling2D(2, 2),
        Dropout(0.25)
    ]

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,         # We don't want the 1000 ImageNet classes
    weights='imagenet'         # Load pretrained weights
)

base_model.trainable = False  # Freeze it for now

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(512, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(num_species, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# === Callbacks ===
lr_callback = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, verbose=1)
early_stop = EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True)
checkpoint = ModelCheckpoint(
    "/content/drive/MyDrive/bird-models/bird_classifier_epoch_{epoch:02d}.keras",
    save_best_only=False,
    save_freq='epoch',
    verbose=1
)
# === Train model ===
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=30,
    callbacks=[lr_callback, early_stop, checkpoint],
    verbose=1
)

# === Save model ===
model.save("model/bird_classifier_final.keras")
print("✅ Final model saved to model/bird_classifier_final.keras")
# Convert to ONNX
onnx_model = keras2onnx.convert_keras(model, model.name)

# Save it
onnx.save_model(onnx_model, "model/bird_classifier.onnx")
print("✅ ONNX model saved!")

# === Plot accuracy & loss ===
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']
epochs_range = range(len(acc))

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Train Acc')
plt.plot(epochs_range, val_acc, label='Val Acc')
plt.title('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Train Loss')
plt.plot(epochs_range, val_loss, label='Val Loss')
plt.title('Loss')
plt.legend()

plt.tight_layout()
plt.savefig("training_metrics.png")
plt.show()