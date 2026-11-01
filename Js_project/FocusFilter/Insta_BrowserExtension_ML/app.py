import pandas as pd
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Create Flask application
app = Flask(__name__)

# Load our dataset
data = pd.read_csv("dataset/cleaned_instagram_posts.csv")

# Prepare captions and categories
captions = data["clean_caption"]
categories = data["category"]

# Convert captions into numbers
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(captions)

# Train Naive Bayes model
model = MultinomialNB()
model.fit(X, categories)

print("Naive Bayes model trained successfully!")

# Home route
@app.route("/")
def home():
    return "InstaFocus Backend is Running!"

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():

    # Receive caption from extension
    content = request.get_json()

    if not content or not isinstance(content.get("caption"), str):
        return jsonify({"error": "Please provide a valid caption"}), 400

    caption = content["caption"].strip()

    if not caption:
        return jsonify({"error": "Caption cannot be empty"}), 400

    # Convert caption into numerical features
    caption_vector = vectorizer.transform([caption])

    # Predict category
    prediction = model.predict(caption_vector)

    # Return prediction
    return jsonify({
        "caption": caption,
        "category": prediction[0]
    })

# Start server
if __name__ == "__main__":
    app.run(debug=True)