from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading ML model, encoders, and metadata...")
# 1. Load ML Assets
model = tf.keras.models.load_model("wide_and_deep_model.keras")
user_encoder = joblib.load("user_encoder.pkl")
movie_encoder = joblib.load("movie_encoder.pkl")
ag_encoder = joblib.load("ag_encoder.pkl")
gg_encoder = joblib.load("gg_encoder.pkl")

# 2. Load Metadata Dictionaries for Human-Readable Output
# Load Movies
movies_df = pd.read_csv('ml-1m/movies.dat', sep='::', header=None, names=['MovieID', 'Title', 'Genres'], engine='python', encoding='latin-1')
movie_dict = pd.Series(movies_df.Title.values, index=movies_df.MovieID).to_dict()

# Load Users & map demographic codes to readable text
users_df = pd.read_csv('ml-1m/users.dat', sep='::', header=None, names=['UserID', 'Gender', 'Age', 'Occupation', 'Zip-code'], engine='python', encoding='latin-1')

age_map = {1: "Under 18", 18: "18-24", 25: "25-34", 35: "35-44", 45: "45-49", 50: "50-55", 56: "56+"}
gender_map = {"M": "Male", "F": "Female"}

user_dict = {}
for _, row in users_df.iterrows():
    # Example format: "18-24 year-old Male"
    user_dict[row['UserID']] = f"{age_map.get(row['Age'], 'Unknown Age')} year-old {gender_map.get(row['Gender'], '')}"

print("API Engine Ready!")

@app.get("/predict")
def predict_rating(user_id: int, movie_id: int, age_genre: str, gender_genre: str, year_scaled: float):
    try:
        # 1. Format ML payload
        u_idx = user_encoder.transform([user_id])[0]
        m_idx = movie_encoder.transform([movie_id])[0]
        ag_idx = ag_encoder.transform([age_genre])[0]
        gg_idx = gg_encoder.transform([gender_genre])[0]
        
        payload = {
            'User_Idx': np.array([u_idx]),
            'Movie_Idx': np.array([m_idx]),
            'Year_Scaled': np.array([year_scaled]),
            'Age_Genre_Idx': np.array([ag_idx]),
            'Gender_Genre_Idx': np.array([gg_idx])
        }
        
        # 2. Predict
        prediction = model.predict(payload, verbose=0)
        predicted_rating = float(prediction[0][0])
        
        # 3. Lookup Metadata (with fallbacks if ID isn't found)
        movie_title = movie_dict.get(movie_id, f"Unknown Movie (ID: {movie_id})")
        user_desc = user_dict.get(user_id, f"Unknown User (ID: {user_id})")
        
        # 4. Return enriched payload
        return {
            "success": True,
            "predicted_rating": round(predicted_rating, 2),
            "movie_title": movie_title,
            "user_desc": user_desc
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}