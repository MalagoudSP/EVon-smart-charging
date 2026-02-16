-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  vehicle_type VARCHAR(50),
  battery_capacity_kwh DECIMAL(5, 2),
  preferred_charging_speed VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- EV Stations table
CREATE TABLE IF NOT EXISTS ev_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location_address VARCHAR(500),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  total_chargers INTEGER DEFAULT 0,
  available_chargers INTEGER DEFAULT 0,
  charger_types VARCHAR(500),
  power_rating_kw DECIMAL(6, 2),
  pricing_per_kwh DECIMAL(5, 3),
  access_type VARCHAR(50),
  availability_status VARCHAR(50),
  opening_hours VARCHAR(100),
  amenities VARCHAR(500),
  provider_name VARCHAR(255),
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for stations
CREATE INDEX IF NOT EXISTS idx_stations_location 
ON ev_stations (latitude, longitude);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  booking_date TIMESTAMP NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  charger_type VARCHAR(50),
  energy_kwh DECIMAL(6, 2),
  estimated_cost DECIMAL(8, 2),
  actual_cost DECIMAL(8, 2),
  payment_status VARCHAR(50),
  booking_status VARCHAR(50),
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical data for ML training
CREATE TABLE IF NOT EXISTS historical_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  chargers_available INTEGER,
  chargers_in_use INTEGER,
  demand_level VARCHAR(50),
  average_wait_time_minutes INTEGER,
  weather_condition VARCHAR(50),
  temperature_celsius DECIMAL(4, 2),
  traffic_congestion_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for time-series queries
CREATE INDEX IF NOT EXISTS idx_historical_data_timestamp 
ON historical_data (station_id, timestamp DESC);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  prediction_type VARCHAR(100),
  prediction_timestamp TIMESTAMP NOT NULL,
  predicted_value DECIMAL(10, 4),
  confidence_score DECIMAL(3, 2),
  actual_value DECIMAL(10, 4),
  error_rate DECIMAL(5, 2),
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_station_time 
ON predictions (station_id, prediction_timestamp DESC);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_station_id ON bookings(station_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Create view for station demand
CREATE OR REPLACE VIEW station_demand_view AS
SELECT 
  s.id,
  s.name,
  s.latitude,
  s.longitude,
  s.total_chargers,
  s.available_chargers,
  (s.total_chargers - s.available_chargers)::DECIMAL / s.total_chargers * 100 as demand_percentage,
  hd.demand_level,
  hd.average_wait_time_minutes,
  COUNT(b.id) as active_bookings
FROM ev_stations s
LEFT JOIN historical_data hd ON s.id = hd.station_id 
  AND hd.timestamp = (
    SELECT MAX(timestamp) FROM historical_data WHERE station_id = s.id
  )
LEFT JOIN bookings b ON s.id = b.station_id 
  AND b.booking_status = 'active'
GROUP BY s.id, s.name, s.latitude, s.longitude, s.total_chargers, 
         s.available_chargers, hd.demand_level, hd.average_wait_time_minutes;
