-- Sample data for EVon database

-- Insert sample users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, vehicle_type, battery_capacity_kwh, preferred_charging_speed, is_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'demo@example.com', '$2b$12$KIX1J5c2Vhq5e.U3nIGWDe7YfLr.uTR6iQ7zRKL8e4X9yC8YXQJsy', 'Demo', 'User', '+1-555-0000', 'tesla-model-3', 60, 'fast', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'john@example.com', '$2b$12$KIX1J5c2Vhq5e.U3nIGWDe7YfLr.uTR6iQ7zRKL8e4X9yC8YXQJsy', 'John', 'Doe', '+1-555-0001', 'chevy-bolt', 65, 'standard', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'jane@example.com', '$2b$12$KIX1J5c2Vhq5e.U3nIGWDe7YfLr.uTR6iQ7zRKL8e4X9yC8YXQJsy', 'Jane', 'Smith', '+1-555-0002', 'tesla-model-y', 75, 'fast', TRUE);

-- Insert sample EV stations
INSERT INTO ev_stations (id, name, location_address, latitude, longitude, total_chargers, available_chargers, charger_types, power_rating_kw, pricing_per_kwh, access_type, availability_status, opening_hours, amenities, provider_name, rating, review_count)
VALUES
  ('650e8400-e29b-41d4-a716-446655440000'::uuid, 'Downtown Charging Hub', '123 Main St, Downtown', 40.7128, -74.0060, 16, 8, 'DC Fast, Level 2', 150, 0.35, 'public', 'Available', '24/7', 'Restroom, WiFi, Coffee', 'ChargeCo', 4.8, 156),
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, 'Shopping Mall Station', '456 Mall Dr, Downtown', 40.7580, -73.9855, 20, 14, 'Level 2', 7, 0.28, 'public', 'Available', '08:00-22:00', 'Restroom, WiFi, Parking', 'ElectroCharge', 4.5, 89),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, 'Airport Charging Station', '789 Airport Rd, Airport', 40.6413, -73.7781, 32, 5, 'DC Fast, Level 2', 120, 0.42, 'public', 'Limited', '24/7', 'Lounge, WiFi, Restaurant', 'QuickCharge', 4.2, 234),
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, 'Park Street Level 2', '321 Park Ave, Downtown', 40.7489, -73.9680, 8, 8, 'Level 2', 7, 0.25, 'public', 'Available', '06:00-23:00', 'Parking, WiFi', 'GreenEnergy', 4.7, 112),
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, 'Tech Park DC Fast', '999 Tech Ave, Tech District', 40.7614, -73.9776, 12, 3, 'DC Fast', 200, 0.48, 'public', 'Limited', '24/7', 'Lounge, WiFi, Parking', 'TechCharge', 4.3, 167);

-- Insert sample bookings
INSERT INTO bookings (id, user_id, station_id, booking_date, start_time, end_time, duration_minutes, charger_type, energy_kwh, estimated_cost, actual_cost, payment_status, booking_status, created_at)
VALUES
  ('750e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', NOW() - INTERVAL '5 days' + INTERVAL '2 hours 45 minutes', 45, 'DC Fast', 35.5, 12.43, 12.43, 'paid', 'completed', NOW() - INTERVAL '5 days'),
  ('750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', NOW() - INTERVAL '3 days' + INTERVAL '1 hour 30 minutes', 30, 'Level 2', 15.2, 4.26, 4.26, 'paid', 'completed', NOW() - INTERVAL '3 days'),
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '1 hour', NOW() - INTERVAL '1 day' + INTERVAL '1 hour 20 minutes', 80, 'DC Fast', 42.0, 14.70, NULL, 'pending', 'confirmed', NOW() - INTERVAL '1 day');

-- Insert sample historical data (time-series data for ML training)
INSERT INTO historical_data (id, station_id, timestamp, chargers_available, chargers_in_use, demand_level, average_wait_time_minutes, weather_condition, temperature_celsius, traffic_congestion_level)
VALUES
  -- Downtown Charging Hub - last 7 days
  ('850e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '00:00', 14, 2, 'low', 2, 'sunny', 22, 'low'),
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '08:00', 4, 12, 'high', 15, 'sunny', 24, 'high'),
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '16:00', 3, 13, 'very_high', 22, 'cloudy', 20, 'very_high'),
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '22:00', 12, 4, 'low', 5, 'rainy', 18, 'low'),
  
  -- Shopping Mall - last 7 days
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '00:00', 18, 2, 'low', 1, 'sunny', 22, 'low'),
  ('850e8400-e29b-41d4-a716-446655440005'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '12:00', 8, 12, 'high', 12, 'sunny', 25, 'medium'),
  ('850e8400-e29b-41d4-a716-446655440006'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '18:00', 5, 15, 'very_high', 18, 'cloudy', 21, 'high'),
  ('850e8400-e29b-41d4-a716-446655440007'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '23:00', 16, 4, 'low', 3, 'clear', 19, 'low'),

  -- Airport - last 7 days
  ('850e8400-e29b-41d4-a716-446655440008'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '06:00', 25, 7, 'medium', 8, 'sunny', 23, 'low'),
  ('850e8400-e29b-41d4-a716-446655440009'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '12:00', 8, 24, 'very_high', 30, 'sunny', 26, 'high'),
  ('850e8400-e29b-41d4-a716-446655440010'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '18:00', 10, 22, 'very_high', 25, 'cloudy', 22, 'very_high'),
  ('850e8400-e29b-41d4-a716-446655440011'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '7 days' + INTERVAL '00:00', 28, 4, 'low', 2, 'clear', 18, 'low');

-- Insert sample predictions
INSERT INTO predictions (id, station_id, prediction_type, prediction_timestamp, predicted_value, confidence_score, model_version)
VALUES
  ('950e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, 'demand', NOW() + INTERVAL '2 hours', 0.75, 0.92, '1.0.0'),
  ('950e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, 'demand', NOW() + INTERVAL '4 hours', 0.68, 0.88, '1.0.0'),
  ('950e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, 'demand', NOW() + INTERVAL '6 hours', 0.55, 0.85, '1.0.0'),
  ('950e8400-e29b-41d4-a716-446655440003'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, 'load_forecast', NOW() + INTERVAL '1 hour', 0.62, 0.89, '1.0.0'),
  ('950e8400-e29b-41d4-a716-446655440004'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, 'demand', NOW() + INTERVAL '3 hours', 0.82, 0.91, '1.0.0');

-- Insert sample payments
INSERT INTO payments (id, booking_id, user_id, amount, currency, payment_method, status)
VALUES
  ('a50e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 12.43, 'USD', 'credit_card', 'completed'),
  ('a50e8400-e29b-41d4-a716-446655440001'::uuid, '750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 4.26, 'USD', 'credit_card', 'completed'),
  ('a50e8400-e29b-41d4-a716-446655440002'::uuid, '750e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 14.70, 'USD', 'debit_card', 'pending');

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_station_id ON bookings(station_id);
CREATE INDEX idx_historical_data_timestamp ON historical_data(station_id, timestamp DESC);
CREATE INDEX idx_predictions_station_time ON predictions(station_id, prediction_timestamp DESC);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_stations_location ON ev_stations(latitude, longitude);
