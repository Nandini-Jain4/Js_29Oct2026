
from pathlib import Path
import pandas as pd
import re
from sklearn.model_selection import GroupShuffleSplit

# Load dataset
script_folder = Path(__file__).resolve().parent
file_path = script_folder / "dataset" / "Instagram_Captions_100k_Dataset.xlsx"

df = pd.read_excel(file_path)

# Normalize captions to identify similar templates
def normalize_caption(text):
    text = str(text).lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df["caption_group"] = df["caption_text"].apply(normalize_caption)

# Split by caption groups
splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.2,
    random_state=42
)

train_idx, test_idx = next(
    splitter.split(df, groups=df["caption_group"])
)

train_df = df.iloc[train_idx].copy()
test_df = df.iloc[test_idx].copy()

# Check for overlap
overlap = set(train_df["caption_group"]) & set(test_df["caption_group"])

print("Total captions:", len(df))
print("Training captions:", len(train_df))
print("Testing captions:", len(test_df))
print("Common groups in train and test:", len(overlap))

# Save split datasets
train_df.drop(columns=["caption_group"]).to_csv(
    script_folder / "train_data.csv", index=False
)

test_df.drop(columns=["caption_group"]).to_csv(
    script_folder / "test_data.csv", index=False
)

print("\nTrain and test datasets saved successfully!")
