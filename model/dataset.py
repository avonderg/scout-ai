import pandas as pd

# Load metadata from dataset
images = pd.read_csv("data/CUB_200_2011/images.txt", sep=" ", names=["image_id", "image_filename"])
labels = pd.read_csv("data/CUB_200_2011/image_class_labels.txt", sep=" ", names=["image_id", "label"])
classes = pd.read_csv("data/CUB_200_2011/classes.txt", sep=" ", names=["label", "species"])

# Merge into a dataset
df = images.merge(labels, on="image_id").merge(classes, on="label")

# Convert to a CSV
df.to_csv("model/labels.csv", index=False)
