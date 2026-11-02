
from pathlib import Path
import pandas as pd

# Find the dataset file
script_folder = Path(__file__).resolve().parent
file_path = script_folder / "dataset" / "Instagram_Captions_100k_Dataset.xlsx"

# Read Excel file
df = pd.read_excel(file_path)

# Display dataset information
print("Dataset loaded successfully!")
print("Shape:", df.shape)

print("\nColumn names:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())

print("\nMissing values:")
print(df.isnull().sum())

# //////////////////////
print("\nCategory distribution:")
print(df["category"].value_counts())

print("\nUnique categories:")
print(df["category"].unique())

print("\nLanguage distribution:")
print(df["language"].value_counts())

# //////////////////////

print("\nSample captions from each category:")

for category in df["category"].unique():
    print(f"\n--- {category} ---")
    samples = df[df["category"] == category]["caption_text"].head(5)
    for caption in samples:
        print("-", caption)
