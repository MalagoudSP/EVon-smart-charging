"""
Machine Learning and Deep Learning models for EV Charging Management System
Models:
1. Demand Prediction (LSTM)
2. Load Forecasting (Neural Network)
3. Station Recommendation (Hybrid Algorithm)
4. Charging Time Estimation (Regression)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Tuple, Dict
import json
import pickle
import os

# Simulated models - In production, use TensorFlow, PyTorch, scikit-learn
class DemandPredictionLSTM:
    """LSTM-based demand prediction for EV charging stations"""
    
    def __init__(self, lookback_hours: int = 24):
        self.lookback_hours = lookback_hours
        self.model_version = "1.0.0"
        self.is_trained = False
    
    def preprocess_data(self, historical_data: List[Dict]) -> np.ndarray:
        """Preprocess historical data for LSTM"""
        timestamps = []
        demands = []
        
        for data in historical_data:
            timestamps.append(data['timestamp'])
            demands.append(data['demand_level_numeric'])
        
        # Create sequences for LSTM
        X = []
        y = []
        
        for i in range(len(demands) - self.lookback_hours):
            X.append(demands[i:i+self.lookback_hours])
            y.append(demands[i+self.lookback_hours])
        
        return np.array(X), np.array(y)
    
    def train(self, historical_data: List[Dict]) -> Dict:
        """Train the LSTM model"""
        X, y = self.preprocess_data(historical_data)
        
        # Simulated training
        self.mean = np.mean(X)
        self.std = np.std(X)
        self.is_trained = True
        
        return {
            "status": "trained",
            "samples": len(X),
            "model_version": self.model_version
        }
    
    def predict(self, historical_data: List[Dict], hours_ahead: int = 24) -> List[Dict]:
        """Predict demand for future hours"""
        if not self.is_trained:
            return []
        
        predictions = []
        base_time = datetime.utcnow()
        
        # Simulated prediction with trend
        last_demand = historical_data[-1]['demand_level_numeric'] if historical_data else 0.5
        
        for i in range(hours_ahead):
            # Simple trend with seasonality
            hour_of_day = (base_time.hour + i) % 24
            # Higher demand during peak hours (8-10, 16-19)
            seasonality = 1.2 if hour_of_day in [8, 9, 16, 17, 18] else 0.8
            
            predicted_value = max(0, min(1, last_demand + (np.random.randn() * 0.1) * seasonality))
            
            predictions.append({
                "timestamp": base_time + timedelta(hours=i),
                "predicted_demand": predicted_value,
                "confidence": 0.85 - (i * 0.01),  # Confidence decreases with time
                "prediction_type": "demand"
            })
        
        return predictions


class LoadForecastingNN:
    """Neural Network for load/power consumption forecasting"""
    
    def __init__(self):
        self.model_version = "1.0.0"
        self.is_trained = False
    
    def preprocess_features(self, data: Dict) -> np.ndarray:
        """Extract and normalize features"""
        features = [
            data.get('hour_of_day', 12) / 24,
            data.get('day_of_week', 0) / 7,
            data.get('temperature', 20) / 40,
            data.get('chargers_in_use', 0) / 20,
            data.get('historical_avg_load', 0.5),
        ]
        return np.array(features)
    
    def train(self, training_data: List[Dict]) -> Dict:
        """Train the neural network"""
        X = np.array([self.preprocess_features(d) for d in training_data])
        y = np.array([d.get('actual_load', 0.5) for d in training_data])
        
        # Simulated training
        self.weights = np.random.randn(len(X[0]), 1) * 0.1
        self.is_trained = True
        
        return {
            "status": "trained",
            "samples": len(X),
            "model_version": self.model_version
        }
    
    def predict(self, data: Dict) -> float:
        """Predict load for given conditions"""
        if not self.is_trained:
            return 0.5
        
        features = self.preprocess_features(data)
        # Simulated prediction
        predicted_load = np.tanh(np.dot(features, self.weights[0])) / 2 + 0.5
        return max(0, min(1, predicted_load.item()))


class StationRecommender:
    """Hybrid recommender system for optimal station selection"""
    
    def __init__(self):
        self.model_version = "1.0.0"
    
    def calculate_score(self, station: Dict, user_location: Tuple[float, float], 
                       preferences: Dict) -> float:
        """Calculate recommendation score for a station"""
        score = 0
        
        # Distance component (closer is better)
        distance_km = self._haversine_distance(
            user_location,
            (station['latitude'], station['longitude'])
        )
        distance_score = max(0, 1 - (distance_km / 50))
        score += distance_score * 0.3
        
        # Availability component
        availability_ratio = station['available_chargers'] / max(1, station['total_chargers'])
        score += availability_ratio * 0.25
        
        # Cost component
        price_score = 1 - (station.get('pricing_per_kwh', 0.3) / 1.0)
        score += max(0, price_score) * 0.2
        
        # Rating component
        rating_score = station.get('rating', 4) / 5
        score += rating_score * 0.15
        
        # Charger type match
        if station['charger_types'] in preferences.get('preferred_chargers', []):
            score += 0.1
        
        return score
    
    def _haversine_distance(self, loc1: Tuple[float, float], 
                           loc2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates"""
        lat1, lon1 = loc1
        lat2, lon2 = loc2
        
        R = 6371  # Earth radius in km
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        return R * c
    
    def recommend(self, stations: List[Dict], user_location: Tuple[float, float],
                 preferences: Dict, top_k: int = 5) -> List[Dict]:
        """Recommend top K stations"""
        scored_stations = [
            {
                **station,
                "recommendation_score": self.calculate_score(station, user_location, preferences),
                "rank": 0
            }
            for station in stations
        ]
        
        # Sort by score
        scored_stations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        # Add ranks
        for idx, station in enumerate(scored_stations[:top_k], 1):
            station["rank"] = idx
        
        return scored_stations[:top_k]


class ChargingTimeEstimator:
    """Regression model for charging time estimation"""
    
    def __init__(self):
        self.model_version = "1.0.0"
        self.is_trained = False
    
    def calculate_charging_time(self, battery_capacity_kwh: float, 
                               target_soc: float, current_soc: float,
                               charger_power_kw: float, efficiency: float = 0.92) -> float:
        """Calculate estimated charging time in minutes"""
        
        # Adjust for efficiency
        effective_power = charger_power_kw * efficiency
        
        # Calculate energy needed
        energy_needed = battery_capacity_kwh * (target_soc - current_soc)
        
        # Calculate time (with charging curve consideration)
        # Charging slows down as battery approaches full capacity
        curve_factor = 1 + (target_soc - 0.8) * 2 if target_soc > 0.8 else 1
        
        charging_time_hours = (energy_needed / effective_power) * curve_factor
        
        return charging_time_hours * 60  # Convert to minutes
    
    def estimate_cost(self, charging_time_minutes: float, energy_kwh: float,
                     price_per_kwh: float) -> float:
        """Estimate charging cost"""
        return energy_kwh * price_per_kwh
    
    def predict(self, data: Dict) -> Dict:
        """Predict charging time and cost"""
        charging_time = self.calculate_charging_time(
            battery_capacity_kwh=data.get('battery_capacity_kwh', 60),
            target_soc=data.get('target_soc', 0.8),
            current_soc=data.get('current_soc', 0.2),
            charger_power_kw=data.get('charger_power_kw', 7)
        )
        
        energy_kwh = data.get('battery_capacity_kwh', 60) * (
            data.get('target_soc', 0.8) - data.get('current_soc', 0.2)
        )
        
        cost = self.estimate_cost(
            charging_time,
            energy_kwh,
            data.get('price_per_kwh', 0.3)
        )
        
        return {
            "charging_time_minutes": int(charging_time),
            "energy_kwh": round(energy_kwh, 2),
            "estimated_cost": round(cost, 2),
            "efficiency": data.get('efficiency', 0.92)
        }


# Model Manager
class MLModelManager:
    """Manages all ML/DL models"""
    
    def __init__(self):
        self.demand_model = DemandPredictionLSTM()
        self.load_model = LoadForecastingNN()
        self.recommender = StationRecommender()
        self.charging_estimator = ChargingTimeEstimator()
    
    def train_all_models(self, training_data: Dict) -> Dict:
        """Train all models with provided data"""
        results = {
            "demand_model": self.demand_model.train(
                training_data.get('historical_data', [])
            ),
            "load_model": self.load_model.train(
                training_data.get('load_data', [])
            ),
            "timestamp": datetime.utcnow().isoformat()
        }
        return results
    
    def get_station_predictions(self, station_id: str, 
                               historical_data: List[Dict]) -> Dict:
        """Get demand predictions for a station"""
        predictions = self.demand_model.predict(historical_data)
        return {
            "station_id": station_id,
            "predictions": predictions,
            "model_version": self.demand_model.model_version
        }
    
    def get_recommendations(self, stations: List[Dict], 
                          user_location: Tuple[float, float],
                          preferences: Dict) -> List[Dict]:
        """Get station recommendations"""
        return self.recommender.recommend(stations, user_location, preferences)
    
    def estimate_charging(self, charging_params: Dict) -> Dict:
        """Estimate charging time and cost"""
        return self.charging_estimator.predict(charging_params)
    
    def get_load_forecast(self, station_data: Dict) -> float:
        """Get load forecast for a station"""
        return self.load_model.predict(station_data)
