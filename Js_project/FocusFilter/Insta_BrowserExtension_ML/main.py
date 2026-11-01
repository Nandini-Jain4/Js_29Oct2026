import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Load cleaned dataset
data = pd.read_csv("dataset/cleaned_instagram_posts.csv")

# Convert captions into numerical features
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(data["clean_caption"])

# Get category labels
y = data["category"]

# Create Naive Bayes model
model = MultinomialNB()

# Train the model
model.fit(X, y)

# Test with a new Instagram caption
new_caption = ["Advanced Python programming tutorial"]

# Convert new caption into numbers
new_X = vectorizer.transform(new_caption)

# Predict its category
prediction = model.predict(new_X)

print("New Caption:", new_caption[0])
print("Predicted Category:", prediction[0])