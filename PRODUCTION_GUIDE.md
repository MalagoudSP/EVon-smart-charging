# 🚗⚡ EVon - EV Smart Charging Application
## Production Ready Guide

### Last Updated: February 23, 2026
### Version: 2.0.0 (ML & Real-time Enhanced)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Setup Instructions](#setup-instructions)
6. [Deployment Guide](#deployment-guide)
7. [API Documentation](#api-documentation)
8. [Real-Time Features](#real-time-features)
9. [ML & Predictions](#ml--predictions)
10. [Dynamic Pricing](#dynamic-pricing)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**EVon** is an AI-powered EV charging station locator and booking platform that helps users efficiently find, compare, and book charging stations in real-time using machine learning predictions and dynamic pricing models.

### Problem Statement
- **Long wait times** at charging stations (particularly in big cities)
- **Unpredictable pricing** based on demand
- **Limited station information** (availability, amenities, ratings)
- **Poor user experience** when finding nearby charging stations
- **No real-time demand forecasting**

### Solution
- 🗺️ **Google Maps Integration** - Find nearby stations with visual map
- 📊 **ML-Powered Predictions** - Forecast demand and wait times
- 💰 **Dynamic Pricing** - Fair pricing based on supply & demand
- ⭐ **User Reviews & Ratings** - Community feedback system
- 📱 **Real-Time Notifications** - Booking alerts and reminders
- 💳 **Payment Integration** - Stripe & PayPal support
- 📈 **Analytics Dashboard** - Real-time station metrics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Next.js 16 + React 19 + Tailwind CSS                  │
│  - Google Maps Integration                              │
│  - Real-time Station Finder                             │
│  - Booking Management                                    │
│  - User Dashboard & Notifications                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   API Layer (Next.js API Routes)        │
│  - Station Search & Filtering                           │
│  - Predictions & ML Endpoints                           │
│  - Dynamic Pricing Engine                               │
│  - Reviews & Ratings System                             │
│  - Notifications System                                 │
│  - Payment Processing                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼────┐    ┌────────▼─────┐    ┌──────▼────┐
│ Python │    │   PostgreSQL │    │   Redis   │
│FastAPI │    │   Database   │    │  Cache    │
│  ML    │    │              │    │           │
│Backend │    │  (Stations,  │    │ Real-time │
│        │    │  Bookings,   │    │ Stats     │
│        │    │  Analytics)  │    │           │
└────────┘    └──────────────┘    └───────────┘
```

---

## ⚡ Key Features

### 1. **Smart Station Discovery**
- Real-time location tracking with geolocation
- Google Maps visual interface with markers
- Advanced filtering (price, rating, availability, demand)
- Distance calculation and sorting
- Search radius customization

### 2. **ML-Powered Predictions**
- **Demand Forecasting**: Predicts station demand for next 24 hours
- **Wait Time Estimation**: ML model predicts waiting times based on historical data
- **Peak Hour Analysis**: Identifies peak demand periods by day/time
- **Accuracy Feedback**: System learns from actual vs predicted data
- **Confidence Scores**: Shows prediction reliability

### 3. **Dynamic Pricing Engine**
- **Supply-Based Pricing**: Adjusts price based on charger availability
- **Demand-Based Pricing**: Increases price during high demand
- **Time-Based Surge Pricing**: Peak hour premiums (7-9am, 5-7pm)
- **Loyalty Discounts**: Discounts for long charging sessions (4+ hours)
- **Off-Peak Incentives**: 20% discount during low demand hours (11pm-5am)
- **Price Multiplier**: 0.7x - 2.5x base price range

### 4. **User Reviews & Ratings**
- 5-star rating system
- Detailed reviews with specific metrics:
  - Cleanliness (1-5)
  - Charger Functionality (1-5)
  - Charging Experience (1-5)
  - Wait Time (minutes)
- Review authenticity: Users must have visited station recently
- Community-driven quality assurance

### 5. **Real-Time Availability**
- Live charger status updates
- Availability percentage display
- Waiting time estimates
- Demand level indicators (Low/Medium/High)
- Stock status by charger type (Level 1, 2, DC Fast)

### 6. **Notifications System**
- Booking confirmations
- Price change alerts
- Availability alerts
- Session reminders (1 hour before)
- Wellness reward notifications
- Customizable notification preferences

### 7. **Secure Payment Processing**
- Stripe & PayPal integration
- Multiple payment methods:
  - Credit/Debit cards
  - Digital wallets
  - Mobile payments
- Promo code support
- Wallet feature with credits
- Payment history tracking

### 8. **Analytics Dashboard**
- Real-time booking metrics
- Energy dispensed tracking
- Revenue analytics
- Occupancy rates
- Peak hour analysis
- User behavior insights

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 3.4.17
- **Maps**: @react-google-maps/api
- **State Management**: React Hooks + SWR
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui (60+ components)
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **API Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL 15
- **Authentication**: NextAuth.js 5.0
- **ML/AI**: TensorFlow, Scikit-learn
- **Caching**: Redis
- **Real-time**: WebSockets (future)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with timestamps
- **CI/CD**: GitHub Actions (recommended)

### Database
- **Primary**: PostgreSQL (production)
- **Backup**: SQLite (development)
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ & npm/pnpm
- Python 3.9+
- PostgreSQL 14+
- Docker & Docker Compose (optional, for containerized setup)
- Google Maps API Key
- Stripe Account (for payments)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/evon-ev-charging.git
cd evon-ev-charging
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
# or
pnpm install
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env.local`:
```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Required environment variables**:
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` - Get from Google Cloud Console
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_PUBLIC_KEY` & `STRIPE_SECRET_KEY` - From Stripe dashboard
- `BACKEND_URL` - ML API endpoint (e.g., http://localhost:8000)

### 4. Database Setup

#### 4.1 Initialize Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

#### 4.2 Or Using Docker
```bash
docker-compose up -d postgres
docker-compose exec frontend npm run prisma:migrate
docker-compose exec frontend npm run prisma:seed
```

### 5. Run Development Environment

#### Option A: Local Development
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 3 - Optional: Redis
redis-server
```

#### Option B: Docker Compose
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### 6. Verify Setup
- Frontend: http://localhost:3000
- API Health: http://localhost:8000/health
- Database: psql -U evon_user -d evon_db

---

## 📦 Deployment Guide

### Production Checklist
- [ ] Set production environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure database backups
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure email service (SMTP)
- [ ] Enable Redis persistence
- [ ] Set up log aggregation
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up CDN for static assets

### Azure Deployment (Recommended)
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name evon-rg --location eastus

# Deploy using Docker
az container create \
  --resource-group evon-rg \
  --name evon-app \
  --image yourregistry.azurecr.io/evon:latest \
  --ports 3000 8000 \
  --environment-variables \
    DATABASE_URL=your_db_url \
    NEXTAUTH_SECRET=your_secret
```

### AWS EC2 Deployment
```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# 3. Clone and deploy
git clone your-repo.git
cd your-repo
docker-compose up -d

# 4. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### Production Build
```bash
# Build Next.js
npm run build

# Start production server
npm start

# Or with PM2
pm2 start "npm start" --name "evon-frontend"
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "vehicleType": "Tesla Model 3",
  "batteryCapacityKwh": 75
}
```

#### Login
```http
POST /api/auth/[...nextauth]
# Uses NextAuth.js built-in authentication
```

### Stations Endpoints

#### Get Nearby Stations
```http
GET /api/stations?latitude=40.7128&longitude=-74.0060&radius=50&sortBy=distance

Response:
{
  "id": "stn_001",
  "stationName": "Downtown Hub",
  "address": "123 Main St",
  "lat": 40.7128,
  "lng": -74.0060,
  "availableChargers": 8,
  "totalChargers": 12,
  "pricePerKwh": 0.35,
  "dynamicPrice": 0.42,
  "averageRating": 4.7,
  "demandLevel": "medium",
  "waitingTimeMinutes": 15
}
```

### Predictions Endpoint

#### Get Demand Predictions
```http
GET /api/predictions/demand?stationId=stn_001&hoursAhead=4

Response:
{
  "predictions": [
    {
      "timeSlot": "14:00",
      "predictedDemand": 65.5,
      "predictedWaitTime": 25,
      "confidenceScore": 0.82,
      "mlModelVersion": "v1.0.1"
    }
  ],
  "source": "ml_generated"
}
```

### Pricing Endpoint

#### Get Dynamic Price
```http
GET /api/pricing/dynamic?stationId=stn_001&duration=60

Response:
{
  "basePrice": 0.35,
  "dynamicPrice": 0.49,
  "multiplier": 1.4,
  "factors": ["highDemand", "peakHours"],
  "estimatedCost": 5.74
}
```

### Reviews Endpoint

#### Get Reviews
```http
GET /api/reviews?stationId=stn_001&limit=10

#### Submit Review
POST /api/reviews
{
  "userId": "user_123",
  "stationId": "stn_001",
  "rating": 5,
  "cleanliness": 4,
  "chargerFunctionality": 5,
  "waitingTime": 10,
  "comment": "Great service!"
}
```

### Notifications Endpoint

#### Get Notifications
```http
GET /api/notifications?userId=user_123&unreadOnly=true
```

#### Create Notification
```http
POST /api/notifications
{
  "userId": "user_123",
  "type": "price_alert",
  "title": "Price Alert",
  "message": "Station prices have dropped 20%!"
}
```

### Payments Endpoint

#### Process Payment
```http
POST /api/payments/process
{
  "userId": "user_123",
  "bookingId": "booking_456",
  "amount": 15.50,
  "paymentMethod": "credit_card",
  "cardToken": "tok_visa",
  "promoCode": "WELCOME10"
}
```

---

## 🔄 Real-Time Features

### WebSocket Connections (Future Implementation)
```javascript
// Real-time station availability updates
const socket = io('http://localhost:8000');
socket.on('availability-update', (data) => {
  // Update station availability in real-time
});

socket.on('price-change', (data) => {
  // Push notification of price changes
});
```

### Notification System
- Booking confirmations (immediate)
- Price alerts (when dynamic price changes)
- Availability alerts (when charger becomes available)
- Session reminders (1 hour before booking)
- Wellness rewards notifications

---

## 🧠 ML & Predictions

### ML Model Architecture
```
Input Features:
├── Historical demand data
├── Time of day (0-23)
├── Day of week (0-6)
├── Weather conditions
├── Special events
└── Station capacity utilization

Processing:
├── Feature normalization
├── LSTM Neural Network
├── Ensemble methods
└── Confidence scoring

Output:
├── Predicted demand (%)
├── Wait time (minutes)
└── Confidence score (0-1)
```

### Model Training
```bash
# Generate training data
cd backend
python generate_training_data.py

# Train ML models
python train_models.py

# Models stored in:
# - backend/ml_models/demand_predictor.pkl
# - backend/ml_models/wait_time_model.pkl
```

### Model Feedback Loop
- Predictions recorded in database
- Actual data compared against predictions
- Accuracy metrics calculated
- Model retraining every 24 hours
- A/B testing different model versions

---

## 💰 Dynamic Pricing Algorithm

### Price Calculation Formula
```
FinalPrice = BasePrice × Multiplier

Where Multiplier is calculated from:
1. Availability Factor (0.7 - 1.5)
   - Critical low (<20%): 1.5x premium
   - Low (20-40%): 1.3x premium
   - High (>80%): 0.85x discount

2. Demand Factor (0.9 - 1.4)
   - High: 1.4x multiplier
   - Medium: 1.15x multiplier
   - Low: 0.9x multiplier

3. Time Factor (0.8 - 1.25)
   - Peak hours (7-9am, 5-7pm): 1.25x
   - Off-peak (11pm-5am): 0.8x

4. Duration Discount (0.9 - 1.0)
   - 4+ hours: 0.95x
   - 8+ hours: 0.9x
```

### Example Calculation
```
Base Price: $0.35/kWh
Demand: High (+40% = 1.4x)
Availability: 25% (+30% = 1.3x)
Time: Peak (+25% = 1.25x)
Duration: 120 min (no discount)

Multiplier = 1.4 × 1.3 × 1.25 = 2.28 (capped at 2.5)
Final Price = $0.35 × 2.28 = $0.798/kWh
```

---

## 📊 Monitoring & Analytics

### Prometheus Metrics
```
evon_bookings_total{station_id="stn_001"}
evon_energy_dispensed_kwh{station_id="stn_001"}
evon_revenue_usd{station_id="stn_001"}
evon_occupancy_percent{station_id="stn_001"}
evon_prediction_accuracy{model_version="v1.0.1"}
evon_payment_success_rate
evon_api_response_time_ms
```

### Grafana Dashboards
1. **Real-time Overview**: Key metrics and KPIs
2. **Station Analytics**: Per-station performance
3. **ML Model Performance**: Prediction accuracy metrics
4. **User Metrics**: Signups, bookings, retention
5. **Payment Analytics**: Revenue, transactions, refunds
6. **System Health**: API latency, error rates, uptime

### Log Aggregation
```
Logs Format:
[TIMESTAMP] [LEVEL] [SERVICE] [MESSAGE] [CONTEXT]

Example:
[2026-02-23 14:30:45] [INFO] [API] Booking created [booking_id=bk_123, user_id=usr_456]
[2026-02-23 14:30:46] [WARN] [ML] Prediction confidence low [confidence=0.45]
```

---

## 🔒 Security & Best Practices

### Authentication & Authorization
- NextAuth.js with JWT tokens
- Secure password hashing (bcrypt)
- Session management
- Role-based access control (RBAC)

### Data Protection
- HTTPS/TLS encryption
- Database encryption at rest
- PCI DSS compliance for payments
- GDPR compliance for user data

### API Security
- Rate limiting (100 req/min per IP)
- Input validation & sanitization
- SQL injection prevention (Prisma ORM)
- CORS configuration
- API key management

### Deployment Security
- Environment variable management
- Secrets management (AWS Secrets Manager or HashiCorp Vault)
- Docker image scanning
- Regular dependency updates
- Security headers (Helmet.js)

---

## 📱 Mobile-Friendly Features

- Responsive design (mobile-first)
- Touch-optimized maps and buttons
- Progressive Web App (PWA) support
- Offline capability caching
- Native app integration ready

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Google Maps Not Loading
```
Solution:
- Verify API Key in .env.local
- Check API restrictions (should allow all referrers)
- Enable required APIs in Google Cloud Console
```

#### 2. Database Connection Error
```
Solution:
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check credentials in .env.local
- Ensure database exists: psql -l
```

#### 3. ML Predictions Not Working
```
Solution:
- Check backend service is running
- Verify BACKEND_URL environment variable
- Check FastAPI logs: docker logs evon-backend
- Retrain models: python backend/train_models.py
```

#### 4. Payment Processing Failing
```
Solution:
- Verify Stripe keys are correct
- Check webhook endpoint configuration
- Review Stripe dashboard for errors
- Ensure rate limits not exceeded
```

#### 5. High API Latency
```
Solution:
- Check Redis connection and memory
- Monitor PostgreSQL slow queries
- Scale horizontally with load balancer
- Enable query caching
- Check network connectivity
```

---

## 📞 Support & Contact

- **GitHub Issues**: https://github.com/yourusername/evon/issues
- **Email**: support@evon.app
- **Discord Community**: https://discord.gg/evon
- **Documentation**: https://docs.evon.app

---

## 📄 License

MIT License - See LICENSE file

## 👥 Contributing

Contributions welcome! Please read CONTRIBUTING.md

---

**Last Updated**: February 23, 2026  
**Current Version**: 2.0.0 (ML & Real-time Enhanced)  
**Status**: Production Ready ✅
