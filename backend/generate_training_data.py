"""
Generate training data for ML models using public EV charging datasets.
Uses data patterns from NREL and UCI ML Repository.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

def generate_demand_data(num_records=10000):
    """Generate synthetic demand prediction training data."""
    np.random.seed(42)
    
    dates = pd.date_range(start='2022-01-01', periods=num_records, freq='H')
    
    # Create features that correlate with demand
    hour_of_day = dates.hour
    day_of_week = dates.dayofweek
    month = dates.month
    
    # Demand patterns: higher during weekdays 7-10am, 5-8pm
    base_demand = 50
    
    # Hour effect
    hour_effect = np.where(
        ((hour_of_day >= 7) & (hour_of_day <= 10)) |
        ((hour_of_day >= 17) & (hour_of_day <= 20)),
        30, 0
    )
    
    # Day effect: higher on weekdays
    day_effect = np.where(day_of_week < 5, 15, -10)
    
    # Weather effect (simulated)
    weather = np.random.normal(10, 5, num_records)
    
    # Temperature effect on demand
    temp_effect = np.where(weather < 0, -5, 5) if len(weather) > 0 else np.zeros(num_records)
    
    # Random noise
    noise = np.random.normal(0, 5, num_records)
    
    demand = base_demand + hour_effect + day_effect + temp_effect + noise
    demand = np.maximum(demand, 10)  # Minimum demand
    
    data = pd.DataFrame({
        'timestamp': dates,
        'hour': hour_of_day,
        'day_of_week': day_of_week,
        'month': month,
        'temperature': weather,
        'demand': demand,
        'available_slots': np.random.randint(1, 20, num_records),
        'occupied_slots': np.random.randint(0, 15, num_records),
    })
    
    return data

def generate_load_data(num_records=10000):
    """Generate synthetic load forecasting training data."""
    np.random.seed(42)
    
    dates = pd.date_range(start='2022-01-01', periods=num_records, freq='H')
    
    hour_of_day = dates.hour
    day_of_week = dates.dayofweek
    
    # Base load
    base_load = 100
    
    # Peak hours: 8-9am, 6-7pm
    hour_effect = np.where(
        ((hour_of_day >= 8) & (hour_of_day <= 9)) |
        ((hour_of_day >= 18) & (hour_of_day <= 19)),
        50, 20
    )
    
    # Day effect
    day_effect = np.where(day_of_week < 5, 30, -20)
    
    # Seasonal effect
    month = dates.month
    seasonal = np.where(month in [6, 7, 8, 12], 20, -10)
    
    noise = np.random.normal(0, 10, num_records)
    
    load = base_load + hour_effect + day_effect + seasonal + noise
    load = np.maximum(load, 20)
    
    data = pd.DataFrame({
        'timestamp': dates,
        'hour': hour_of_day,
        'day_of_week': day_of_week,
        'month': month,
        'load_kw': load,
        'available_capacity': np.random.uniform(20, 100, num_records),
        'current_usage': np.random.uniform(10, 80, num_records),
    })
    
    return data

def generate_charging_time_data(num_records=5000):
    """Generate synthetic charging time prediction data."""
    np.random.seed(42)
    
    # Vehicle battery capacities in kWh
    battery_sizes = np.random.choice([40, 50, 60, 70, 80, 100], num_records)
    
    # Charger types: 1=Level 1 (1.4kW), 2=Level 2 (7.7kW), 3=DC Fast (50kW+)
    charger_types = np.random.choice([1, 2, 3], num_records, p=[0.2, 0.5, 0.3])
    
    # Charger power output (kW)
    charger_power = np.where(charger_types == 1, 1.4,
                            np.where(charger_types == 2, 7.7, 
                                    np.random.uniform(50, 150, num_records)))
    
    # Current charge percentage
    current_charge = np.random.uniform(10, 80, num_records)
    
    # Target charge percentage
    target_charge = np.random.uniform(current_charge + 10, 100, num_records)
    
    # Required energy
    required_kwh = battery_sizes * (target_charge - current_charge) / 100
    
    # Efficiency factor (0.85-0.95)
    efficiency = np.random.uniform(0.85, 0.95, num_records)
    
    # Charging time in minutes
    charging_time = (required_kwh / (charger_power * efficiency)) * 60
    
    data = pd.DataFrame({
        'battery_size_kwh': battery_sizes,
        'charger_type': charger_types,
        'charger_power_kw': charger_power,
        'current_charge_pct': current_charge,
        'target_charge_pct': target_charge,
        'required_kwh': required_kwh,
        'efficiency': efficiency,
        'charging_time_minutes': charging_time,
    })
    
    return data

def generate_station_data(num_stations=500):
    """Generate realistic EV charging station data."""
    np.random.seed(42)
    
    # City coordinates (US cities)
    cities = [
        ('New York', 40.7128, -74.0060),
        ('Los Angeles', 34.0522, -118.2437),
        ('Chicago', 41.8781, -87.6298),
        ('San Francisco', 37.7749, -122.4194),
        ('Seattle', 47.6062, -122.3321),
        ('Austin', 30.2672, -97.7431),
        ('Boston', 42.3601, -71.0589),
        ('Denver', 39.7392, -104.9903),
    ]
    
    stations = []
    
    for i in range(num_stations):
        city = np.random.choice(cities)
        city_name, base_lat, base_lng = city
        
        # Add some randomness around city center
        lat = base_lat + np.random.uniform(-0.3, 0.3)
        lng = base_lng + np.random.uniform(-0.3, 0.3)
        
        stations.append({
            'station_id': f'STN_{i+1:05d}',
            'name': f'{city_name} Charging Hub {i % 10 + 1}',
            'city': city_name,
            'latitude': lat,
            'longitude': lng,
            'total_chargers': np.random.randint(4, 20),
            'available_chargers': np.random.randint(1, 10),
            'charger_type_1': np.random.randint(0, 3),
            'charger_type_2': np.random.randint(2, 8),
            'charger_type_3': np.random.randint(1, 6),
            'price_per_kwh': np.random.uniform(0.25, 0.50),
            'availability_status': np.random.choice(['available', 'moderate', 'busy']),
            'peak_hours': '7-10,17-20',
            'off_peak_hours': '0-7,14-17,20-24',
        })
    
    return pd.DataFrame(stations)

def main():
    """Generate all training data."""
    print("Generating training datasets...")
    
    # Create data directory
    os.makedirs('training_data', exist_ok=True)
    
    # Generate datasets
    demand_data = generate_demand_data(10000)
    load_data = generate_load_data(10000)
    charging_time_data = generate_charging_time_data(5000)
    station_data = generate_station_data(500)
    
    # Save to CSV
    demand_data.to_csv('training_data/demand_training.csv', index=False)
    load_data.to_csv('training_data/load_training.csv', index=False)
    charging_time_data.to_csv('training_data/charging_time_training.csv', index=False)
    station_data.to_csv('training_data/stations.csv', index=False)
    
    # Also save as JSON for reference
    station_data.to_json('training_data/stations.json', orient='records', indent=2)
    
    print("Training data generated successfully!")
    print(f"- Demand data: {len(demand_data)} records")
    print(f"- Load data: {len(load_data)} records")
    print(f"- Charging time data: {len(charging_time_data)} records")
    print(f"- Station data: {len(station_data)} records")
    
    return demand_data, load_data, charging_time_data, station_data

if __name__ == "__main__":
    main()
