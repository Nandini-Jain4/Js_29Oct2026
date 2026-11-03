
from pathlib import Path
import pandas as pd

# Find dataset
script_folder = Path(__file__).resolve().parent
file_path = script_folder / "dataset" / "Instagram_Captions_100k_Dataset.xlsx"

# Load dataset
df = pd.read_excel(file_path)

# Count exact duplicate captions
duplicate_count = df["caption_text"].duplicated().sum()

# Count unique captions
unique_count = df["caption_text"].nunique()

# Total captions
total_count = len(df)

print("Total captions:", total_count)
print("Unique captions:", unique_count)
print("Duplicate captions:", duplicate_count)
print("Duplicate percentage:", round((duplicate_count / total_count) * 100, 2), "%")