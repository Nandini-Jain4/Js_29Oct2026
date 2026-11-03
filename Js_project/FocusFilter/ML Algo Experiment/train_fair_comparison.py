
from pathlib import Path
import pandas as pd
import time

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import LinearSVC

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support
)

# Find project folder
script_folder = Path(__file__).resolve().parent

# Load fair train-test datasets
train_df = pd.read_csv(script_folder / "train_data.csv")
test_df = pd.read_csv(script_folder / "test_data.csv")

# Separate captions and categories
X_train = train_df["caption_text"].fillna("").astype(str)
y_train = train_df["category"]

X_test = test_df["caption_text"].fillna("").astype(str)
y_test = test_df["category"]

# Convert text into TF-IDF features
vectorizer = TfidfVectorizer(ngram_range=(1, 2))

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Define algorithms
models = {
    "Naive Bayes": MultinomialNB(),
    "Decision Tree": DecisionTreeClassifier(
        random_state=42,
        class_weight="balanced"
    ),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "SVM": LinearSVC(
        class_weight="balanced",
        random_state=42
    )
}

results = []

# Train and evaluate each algorithm
for name, model in models.items():

    print(f"\nTraining {name}...")

    model.fit(X_train_tfidf, y_train)

    start_time = time.time()
    y_pred = model.predict(X_test_tfidf)
    prediction_time = time.time() - start_time

    accuracy = accuracy_score(y_test, y_pred)

    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    results.append({
        "Algorithm": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1-score": f1,
        "Prediction Time (seconds)": prediction_time
    })

# Display comparison
results_df = pd.DataFrame(results)

print("\nFAIR ALGORITHM COMPARISON")
print(results_df.to_string(index=False))

# Save results
output_path = script_folder / "fair_comparison_results.csv"
results_df.to_csv(output_path, index=False)

print("\nResults saved to:", output_path)
