import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import LabelEncoder

# Load data and model
data = pd.read_excel("Cleaned_Combined_Clubs_finals.xlsx")
y = data['Formation']
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
model = joblib.load('best_rf_model.pkl')

# Function to predict the formation
def get_prediction_model(xG, xGA, Poss, xA, KP, PPA, PrgP):
    df = pd.DataFrame({'xG': [xG], 'xGA': [xGA], 'Poss': [Poss], 'xA': [xA], 'KP': [KP], 'PPA': [PPA], 'PrgP': [PrgP]})
    predicted_formation = model.predict(df)
    return label_encoder.inverse_transform(predicted_formation)[0]

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/predict_formation', methods=['POST'])
def predict_formation():
    data = request.get_json()
    required_keys = ["xG", "xGA", "Poss", "xA", "KP", "PPA", "PrgP"]
    
    # Check if all required keys are present in the request
    if not all(key in data for key in required_keys):
        return jsonify(error="Missing keys in request data"), 400
    
    prediction = get_prediction_model(data["xG"], data["xGA"], data["Poss"], data["xA"], data["KP"], data["PPA"], data["PrgP"])
    return jsonify(prediction=prediction)

if __name__ == "__main__":
    app.run(debug=True)  # Turn off debug in production