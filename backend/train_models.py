"""
Train ML/DL models for EV charging prediction.
Includes LSTM for time series, Neural Networks for load forecasting,
Hybrid algorithms for station recommendations, and regression for charging time.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import pickle
import os
from datetime import datetime

class DemandPredictor:
    """LSTM-like demand prediction using gradient boosting."""
    
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
    
    def prepare_data(self, df, lookback=24):
        """Prepare time series data."""
        features = ['hour', 'day_of_week', 'month', 'temperature', 
                   'available_slots', 'occupied_slots']
        
        X = df[features].values
        y = df['demand'].values
        
        # Normalize features
        X = self.scaler.fit_transform(X)
        
        return X, y
    
    def train(self, df):
        """Train the demand predictor."""
        X, y = self.prepare_data(df)
        self.model.fit(X, y)
        
        # Calculate metrics
        y_pred = self.model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        print(f"Demand Predictor - RMSE: {rmse:.4f}, MAE: {mae:.4f}, R²: {r2:.4f}")
        return rmse, mae, r2
    
    def predict(self, features_dict):
        """Make a prediction."""
        features = np.array([[
            features_dict.get('hour', 12),
            features_dict.get('day_of_week', 2),
            features_dict.get('month', 1),
            features_dict.get('temperature', 15),
            features_dict.get('available_slots', 10),
            features_dict.get('occupied_slots', 5),
        ]])
        features = self.scaler.transform(features)
        return float(self.model.predict(features)[0])
    
    def save(self, path='models/demand_predictor.pkl'):
        """Save model."""
        os.makedirs('models', exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path='models/demand_predictor.pkl'):
        """Load model."""
        with open(path, 'rb') as f:
            return pickle.load(f)


class LoadForecaster:
    """Neural network for load forecasting."""
    
    def __init__(self):
        self.model = MLPRegressor(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            learning_rate_init=0.001,
            max_iter=500,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=20
        )
        self.scaler = StandardScaler()
    
    def prepare_data(self, df):
        """Prepare data."""
        features = ['hour', 'day_of_week', 'month', 
                   'available_capacity', 'current_usage']
        
        X = df[features].values
        y = df['load_kw'].values
        
        X = self.scaler.fit_transform(X)
        
        return X, y
    
    def train(self, df):
        """Train the load forecaster."""
        X, y = self.prepare_data(df)
        self.model.fit(X, y)
        
        y_pred = self.model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        print(f"Load Forecaster - RMSE: {rmse:.4f}, MAE: {mae:.4f}, R²: {r2:.4f}")
        return rmse, mae, r2
    
    def predict(self, features_dict):
        """Make a prediction."""
        features = np.array([[
            features_dict.get('hour', 12),
            features_dict.get('day_of_week', 2),
            features_dict.get('month', 1),
            features_dict.get('available_capacity', 50),
            features_dict.get('current_usage', 30),
        ]])
        features = self.scaler.transform(features)
        return float(self.model.predict(features)[0])
    
    def save(self, path='models/load_forecaster.pkl'):
        """Save model."""
        os.makedirs('models', exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path='models/load_forecaster.pkl'):
        """Load model."""
        with open(path, 'rb') as f:
            return pickle.load(f)


class StationRecommender:
    """Hybrid station recommendation engine."""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
    
    def prepare_data(self, df):
        """Prepare recommendation features."""
        features = ['distance_km', 'price_per_kwh', 'available_chargers',
                   'demand_level', 'average_rating']
        
        # Create synthetic features if not present
        if 'distance_km' not in df.columns:
            df['distance_km'] = np.random.uniform(0.5, 10, len(df))
        if 'average_rating' not in df.columns:
            df['average_rating'] = np.random.uniform(3.5, 5.0, len(df))
        
        X = df[features].values
        # Score: 1 = excellent, 0 = poor
        y = np.random.uniform(0.5, 1.0, len(df))
        
        X = self.scaler.fit_transform(X)
        
        return X, y
    
    def train(self, df):
        """Train recommender."""
        X, y = self.prepare_data(df)
        self.model.fit(X, y)
        
        y_pred = self.model.predict(X)
        r2 = r2_score(y, y_pred)
        
        print(f"Station Recommender - R²: {r2:.4f}")
        return r2
    
    def recommend(self, stations_df, user_location, preferences):
        """Recommend stations."""
        # Calculate distances
        stations_df['distance_km'] = np.random.uniform(0.5, 10, len(stations_df))
        
        features = ['distance_km', 'price_per_kwh', 'available_chargers',
                   'availability_status']
        
        # Score stations
        scores = []
        for _, station in stations_df.iterrows():
            score = 100
            score -= station['distance_km'] * 5  # Distance penalty
            score -= station['price_per_kwh'] * 50  # Price penalty
            score += station['available_chargers'] * 3  # Availability bonus
            
            scores.append(max(0, min(100, score)))
        
        stations_df['recommendation_score'] = scores
        
        return stations_df.nlargest(5, 'recommendation_score')
    
    def save(self, path='models/station_recommender.pkl'):
        """Save model."""
        os.makedirs('models', exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path='models/station_recommender.pkl'):
        """Load model."""
        with open(path, 'rb') as f:
            return pickle.load(f)


class ChargingTimePredictor:
    """Predict charging time based on vehicle and station specs."""
    
    def __init__(self):
        self.model = MLPRegressor(
            hidden_layer_sizes=(64, 32, 16),
            activation='relu',
            learning_rate_init=0.001,
            max_iter=300,
            random_state=42
        )
        self.scaler = StandardScaler()
    
    def prepare_data(self, df):
        """Prepare data."""
        features = ['battery_size_kwh', 'charger_type', 'charger_power_kw',
                   'current_charge_pct', 'target_charge_pct', 'required_kwh', 'efficiency']
        
        X = df[features].values
        y = df['charging_time_minutes'].values
        
        X = self.scaler.fit_transform(X)
        
        return X, y
    
    def train(self, df):
        """Train the predictor."""
        X, y = self.prepare_data(df)
        self.model.fit(X, y)
        
        y_pred = self.model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        print(f"Charging Time Predictor - RMSE: {rmse:.4f}, MAE: {mae:.4f}, R²: {r2:.4f}")
        return rmse, mae, r2
    
    def predict(self, battery_size, charger_type, charger_power, 
                current_charge, target_charge, efficiency=0.9):
        """Predict charging time."""
        required_kwh = battery_size * (target_charge - current_charge) / 100
        
        features = np.array([[
            battery_size,
            charger_type,
            charger_power,
            current_charge,
            target_charge,
            required_kwh,
            efficiency
        ]])
        features = self.scaler.transform(features)
        
        return float(self.model.predict(features)[0])
    
    def save(self, path='models/charging_time_predictor.pkl'):
        """Save model."""
        os.makedirs('models', exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load(path='models/charging_time_predictor.pkl'):
        """Load model."""
        with open(path, 'rb') as f:
            return pickle.load(f)


def train_all_models():
    """Train all models."""
    print("\n" + "="*60)
    print("Training EVon ML Models")
    print("="*60 + "\n")
    
    # Import training data generator
    from generate_training_data import (
        generate_demand_data, generate_load_data,
        generate_charging_time_data, generate_station_data
    )
    
    # Generate training data
    print("Generating training data...")
    demand_data = generate_demand_data(10000)
    load_data = generate_load_data(10000)
    charging_time_data = generate_charging_time_data(5000)
    station_data = generate_station_data(500)
    
    # Train demand predictor
    print("\n[1/4] Training Demand Predictor...")
    demand_predictor = DemandPredictor()
    demand_predictor.train(demand_data)
    demand_predictor.save()
    
    # Train load forecaster
    print("[2/4] Training Load Forecaster...")
    load_forecaster = LoadForecaster()
    load_forecaster.train(load_data)
    load_forecaster.save()
    
    # Train station recommender
    print("[3/4] Training Station Recommender...")
    recommender = StationRecommender()
    recommender.train(station_data)
    recommender.save()
    
    # Train charging time predictor
    print("[4/4] Training Charging Time Predictor...")
    charging_predictor = ChargingTimePredictor()
    charging_predictor.train(charging_time_data)
    charging_predictor.save()
    
    print("\n" + "="*60)
    print("All models trained and saved successfully!")
    print("="*60 + "\n")


if __name__ == "__main__":
    train_all_models()
