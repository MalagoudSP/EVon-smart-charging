# EVon: Smart EV Charging Management System - Setup Guide

## Overview

EVon is a comprehensive EV charging management system that uses machine learning and deep learning to predict demand, optimize charging times, and recommend the best charging stations based on real-time data, location, pricing, and traffic conditions.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js Frontend (React)               │
│  (Authentication, Station Finder, Dashboard, Booking)   │
└────────────────────────┬────────────────────────────────┘
                         │
           HTTP/REST API │
                         │
┌────────────────────────▼────────────────────────────────┐
│              FastAPI Backend (Python)                   │
│  (User Auth, Stations, Bookings, Predictions)           │
└────────────────────────┬────────────────────────────────┘
                         │
        SQLAlchemy ORM   │
                         │
┌────────────────────────▼────────────────────────────────┐
│              PostgreSQL Database                        │
│  (Users, Stations, Bookings, Historical Data)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│          ML/DL Models (Integrated with Backend)         │
│  • Demand Prediction (LSTM)                             │
│  • Load Forecasting (Neural Network)                    │
│  • Station Recommendation (Hybrid Algorithm)            │
│  • Charging Time Estimation (Regression)                │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ & npm/pnpm
- Python 3.9+
- PostgreSQL 13+
- Git

## Installation & Setup

### 1. Frontend Setup (Next.js)

```bash
# Install dependencies
pnpm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with your configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Database Setup (PostgreSQL)

```bash
# Create database
createdb evon_db

# Initialize schema
psql evon_db -f scripts/init-db.sql

# Add sample data (optional)
psql evon_db -f scripts/seed-data.sql
```

### 3. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with your configuration
DATABASE_URL=postgresql://user:password@localhost:5432/evon_db
SECRET_KEY=your-secret-key-change-in-production

# Run migrations (if needed)
alembic upgrade head
```

## Running the Application

### Development Environment

**Terminal 1 - Frontend:**
```bash
pnpm dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

**Terminal 3 - Database (if needed):**
```bash
# Make sure PostgreSQL is running
# macOS: brew services start postgresql
# Windows: Services > PostgreSQL > Start
```

## Project Structure

```
.
├── app/
│   ├── page.tsx                 # Home page
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── stations/page.tsx       # Station finder
│   ├── booking/[stationId]/page.tsx # Booking page
│   ├── dashboard/page.tsx      # User dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   └── bookings/route.ts
│   └── globals.css
├── backend/
│   ├── main.py                 # FastAPI app & routes
│   ├── ml_models.py            # ML/DL models
│   ├── requirements.txt         # Python dependencies
│   └── .env.example
├── scripts/
│   ├── init-db.sql             # Database schema
│   └── seed-data.sql           # Sample data
├── components/ui/              # shadcn components
├── auth.config.ts              # NextAuth configuration
└── package.json
```

## Key Features

### 1. Authentication
- User registration with vehicle details
- JWT-based authentication
- Password hashing with bcrypt
- Session management with NextAuth

### 2. Station Finder
- Real-time station availability
- Distance-based filtering
- Price comparison
- Advanced search filters
- Station rating system
- Charger type filtering

### 3. Booking System
- Smart charging time estimation
- Cost prediction
- Battery SOC (State of Charge) management
- Real-time availability checking
- Booking confirmation and tracking

### 4. ML/DL Models

#### Demand Prediction (LSTM)
- Predicts station demand for next 24 hours
- Considers time of day, day of week, historical patterns
- Helps users choose optimal charging times

#### Load Forecasting (Neural Network)
- Predicts power consumption at stations
- Factors: temperature, chargers in use, time
- Grid optimization insights

#### Station Recommender (Hybrid)
- Combines multiple factors:
  - Distance from user location
  - Station availability
  - Pricing
  - Rating/reviews
  - Charger type compatibility
- Returns top K recommendations

#### Charging Time Estimator (Regression)
- Predicts charging duration
- Considers:
  - Battery capacity
  - Current & target SOC
  - Charger power rating
  - Charging curve efficiency
- Estimates total cost

### 5. Dashboard
- Real-time charging analytics
- Monthly cost tracking
- Booking history
- Demand trend visualization
- Savings recommendations

## API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
```

### Stations
```
GET    /api/stations                    - List nearby stations
GET    /api/stations/{station_id}       - Get station details
```

### Bookings
```
POST   /api/bookings                    - Create booking
GET    /api/bookings/{user_id}          - Get user bookings
PUT    /api/bookings/{booking_id}       - Update booking
DELETE /api/bookings/{booking_id}       - Cancel booking
```

### Predictions
```
GET    /api/predictions/{station_id}    - Get demand predictions
GET    /api/forecasts/{station_id}      - Get load forecasts
```

## ML Model Training & Inference

### Training Models

```python
from backend.ml_models import MLModelManager

manager = MLModelManager()

# Prepare training data
training_data = {
    'historical_data': [...],  # Historical demand/load data
    'load_data': [...]         # Load data samples
}

# Train all models
results = manager.train_all_models(training_data)
```

### Making Predictions

```python
# Get demand predictions
predictions = manager.get_station_predictions(
    station_id='station-123',
    historical_data=[...]
)

# Get recommendations
recommendations = manager.get_recommendations(
    stations=[...],
    user_location=(40.7128, -74.0060),
    preferences={'preferred_chargers': ['DC Fast']}
)

# Estimate charging
estimates = manager.estimate_charging({
    'battery_capacity_kwh': 60,
    'current_soc': 20,
    'target_soc': 80,
    'charger_power_kw': 150
})
```

## Database Schema

### Users Table
- Stores user profiles
- Vehicle information
- Preferences

### EV_Stations Table
- Station locations (latitude/longitude)
- Charger availability
- Pricing information
- Ratings and reviews

### Bookings Table
- User booking records
- Duration and cost information
- Payment status

### Historical_Data Table
- Time-series data for predictions
- Station occupancy levels
- Weather conditions
- Traffic data

### Predictions Table
- ML model outputs
- Accuracy metrics
- Actual vs predicted values

## Deployment

### Frontend Deployment (Vercel)

```bash
# Connect your GitHub repo
# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=your-backend-url
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=your-frontend-url

# Push to main branch to auto-deploy
```

### Backend Deployment (Heroku/Railway/Render)

```bash
# Using Railway
railway init
railway add
railway link
railway up

# Using Render
# Connect GitHub repo through Render dashboard
# Set environment variables in Render dashboard
```

### Database Deployment

```bash
# Using Vercel Postgres / Supabase
# Create database instance
# Update DATABASE_URL in backend environment
# Run migrations: alembic upgrade head
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/evon_db
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
API_HOST=0.0.0.0
API_PORT=8000
```

## Testing

### Frontend Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

### Backend Tests
```bash
cd backend
pytest tests/
```

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Connection pooling
- Query optimization with SQLAlchemy

### Frontend
- Code splitting
- Image optimization
- CSS minification
- API caching with SWR

### Backend
- Caching with Redis (optional)
- Model caching
- API rate limiting
- Database query optimization

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Solution: Check DATABASE_URL in .env
Ensure PostgreSQL is running
Verify connection credentials
```

**2. CORS Error**
```
Solution: Update CORS_ORIGINS in backend .env
Ensure frontend URL is whitelisted
```

**3. Model Loading Error**
```
Solution: Check ML model files exist
Verify TensorFlow/PyTorch installation
Check model version compatibility
```

**4. Authentication Failed**
```
Solution: Verify NEXTAUTH_SECRET is set
Check token expiration settings
Ensure JWT_SECRET matches
```

## Security Considerations

1. **Password Security**
   - Use bcrypt for hashing (implemented)
   - Never store plain passwords
   - Enforce strong password policies

2. **API Security**
   - JWT authentication for protected routes
   - Rate limiting on API endpoints
   - HTTPS in production (required)

3. **Database Security**
   - Use parameterized queries (SQLAlchemy handles this)
   - Encrypt sensitive data
   - Regular backups

4. **Frontend Security**
   - Secure session cookies
   - CSRF protection
   - XSS prevention

## Future Enhancements

1. **Advanced ML Features**
   - Real-time traffic integration
   - Weather-based predictions
   - Dynamic pricing integration
   - User behavior learning

2. **Mobile App**
   - React Native version
   - Push notifications
   - Offline mode

3. **Integration**
   - Google Maps integration
   - Payment gateway integration
   - EV manufacturer APIs

4. **Analytics**
   - Advanced reporting
   - Carbon footprint tracking
   - Cost optimization recommendations

## Support & Contribution

For issues, questions, or contributions:
1. Check existing GitHub issues
2. Create detailed issue report
3. Submit pull requests with tests
4. Follow code style guide

## License

MIT License - See LICENSE.md for details

## Authors

- Smart EV Charging System Team

---

**Last Updated:** February 2024
**Version:** 1.0.0
