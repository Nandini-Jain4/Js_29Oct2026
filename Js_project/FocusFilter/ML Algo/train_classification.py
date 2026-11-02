
from pathlib import Path
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import LinearSVC

from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# 1. Load dataset
script_folder = Path(__file__).resolve().parent
file_path = script_folder / "dataset" / "Instagram_Captions_100k_Dataset.xlsx"

df = pd.read_excel(file_path)

# 2. Select input and target
X = df["caption_text"].fillna("").astype(str)
y = df["category"]

# 3. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 4. TF-IDF conversion
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# 5. Define classification algorithms
models = {
    "Naive Bayes": MultinomialNB(),
    "Decision Tree": DecisionTreeClassifier(
        random_state=42, class_weight="balanced"
    ),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "SVM": LinearSVC(
        class_weight="balanced", random_state=42
    )
}

# 6. Train and evaluate each model
results = []

for name, model in models.items():
    print(f"\nTraining {name}...")

    model.fit(X_train_tfidf, y_train)
    y_pred = model.predict(X_test_tfidf)

    accuracy = accuracy_score(y_test, y_pred)

    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred,
        average="macro",
        zero_division=0
    )

    results.append({
        "Algorithm": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1-score": f1
    })

# 7. Display comparison
results_df = pd.DataFrame(results)

print("\nCLASSIFICATION ALGORITHM COMPARISON")
print(results_df.to_string(index=False))

# 8. Save results
output_path = script_folder / "classification_results.csv"
results_df.to_csv(output_path, index=False)

print("\nResults saved to:", output_path)
