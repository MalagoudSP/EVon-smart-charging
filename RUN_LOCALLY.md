# 🚀 How to Run EVon Locally - Complete Guide

**Goal**: Get the entire project running on your computer in ~15 minutes

---

## ⚡ Quick Start (Choose ONE method)

### Method 1: Docker (Easiest - Recommended) ⭐

This starts everything with one command:

```bash
# Navigate to project folder
cd c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app

# Start all services
docker-compose up -d

# That's it! Everything is running
```

**Then access:**
- 🌐 **Frontend**: http://localhost:3000
- 📊 **Grafana**: http://localhost:3001 (admin/admin)
- 🔌 **API Docs**: http://localhost:8000/docs
- 📈 **Prometheus**: http://localhost:9090

---

### Method 2: Manual Setup (3 terminals)

If Docker isn't installed, run separately:

**Terminal 1 - Frontend:**
```bash
cd c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app
npm install
npm run dev
# Visit http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app\backend
pip install -r requirements.txt
python main.py
# API at http://localhost:8000
```

**Terminal 3 - Database:**
```bash
# Make sure PostgreSQL is running
# Or use SQLite (no setup needed)
```

---

## 📋 Prerequisites

### Check You Have These Installed:

**Option A: Using Docker (Easiest)**
```bash
# Check Docker
docker --version
# Should show: Docker version 20.10+

# Check Docker Compose
docker-compose --version
# Should show: Docker Compose version 1.29+
```

**Option B: Without Docker**
```bash
# Check Node.js
node --version
# Should show: v18+

# Check npm/pnpm
npm --version
# Should show: 9.0+

# Check Python
python --version
# Should show: 3.9+
```

### Install If Needed:
- **Docker**: https://www.docker.com/products/docker-desktop/
- **Node.js**: https://nodejs.org/
- **Python**: https://www.python.org/

---

## 🔧 Detailed Step-by-Step (Docker Method)

### Step 1: Navigate to Project
```bash
# Open PowerShell and go to project folder
cd "c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app"
```

### Step 2: Check Configuration
```bash
# Make sure .env.local exists with these values:
# NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key (can be empty for testing)
# STRIPE_PUBLIC_KEY=test_key (can be empty for testing)
# DATABASE_URL=postgresql://... (auto-configured in Docker)

# Or just copy the template:
cp .env.example .env.local
```

### Step 3: Start Everything
```bash
# This pulls images and starts all services
docker-compose up -d

# Check status
docker-compose ps
# All services should show "Up"
```

### Step 4: Wait for Startup (2-3 minutes)
```bash
# Monitor logs
docker-compose logs -f

# Or watch individual service:
docker-compose logs -f frontend
# Wait until you see "started server on 0.0.0.0:3000"
```

### Step 5: Access the Application
```
Frontend:     http://localhost:3000
API Docs:     http://localhost:8000/docs
Grafana:      http://localhost:3001 (admin/admin)
Prometheus:   http://localhost:9090
```

---

## 📱 What You'll See

### Frontend at localhost:3000

**Landing Page (First Visit)**
- Hero section with app description
- Features showcase
- Statistics
- Call-to-action buttons

**Key Pages:**
1. **Login/Register** - User authentication
2. **Stations Page** - Shows all EV stations with:
   - Map view with Google Maps
   - List view with filters
   - Search radius visualization
   - Color-coded demand indicators (Green=Low, Yellow=Medium, Red=High)

3. **Booking Page** - Reserve a charging slot with:
   - Real-time pricing calculation
   - Duration selection
   - Cost estimation
   - Confirmation

4. **Dashboard** - Personal analytics with:
   - Booking history
   - Spending analysis
   - Charging statistics

---

## 🔌 Let's Test the APIs

### 1. Open Swagger Docs
Visit: **http://localhost:8000/docs**

You'll see all available endpoints. Click "Try it out" on any to test.

### 2. Test Key Endpoints

**GET Nearby Stations:**
```bash
curl http://localhost:3000/api/stations
```
Response: List of all stations with prices, availability, ratings

**GET ML Predictions (Demand Forecast):**
```bash
curl "http://localhost:3000/api/predictions/demand?stationId=stn_001&hoursAhead=4"
```
Response: 24-hour demand forecast with wait time predictions

**GET Dynamic Pricing:**
```bash
curl "http://localhost:3000/api/pricing/dynamic?stationId=stn_001&duration=60"
```
Response: Real-time calculated price (75% off-peak to 240% peak)

**GET Station Reviews:**
```bash
curl "http://localhost:3000/api/reviews?stationId=stn_001"
```
Response: 5-star ratings, cleanliness scores, experiences

**GET User Notifications:**
```bash
curl "http://localhost:3000/api/notifications?userId=user_001"
```
Response: Booking confirmations, price alerts, reminders

**POST Create a Review:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_001",
    "stationId": "stn_001",
    "rating": 5,
    "comment": "Great station!",
    "cleanliness": 5,
    "functionality": 5,
    "experience": 5
  }'
```

---

## 🗄️ Database Management

### View Data with Prisma Studio

```bash
# Opens a web interface to see and edit all data
npx prisma studio
# Visit http://localhost:5555
```

### Check PostgreSQL (Optional)

```bash
# Connect to database
docker exec -it postgres psql -U postgres -d evon

# View tables
\dt

# View stations
SELECT id, name, city, available_chargers, demand_level, dynamic_price FROM "public"."Station" LIMIT 5;

# Exit
\q
```

---

## 🎨 See Changes Live

### Edit Frontend Code
1. Open any file in `app/stations/enhanced-page.tsx`
2. Make a change (e.g., change a color)
3. **Save the file**
4. **Refresh browser** (F5)
5. ✅ Change appears instantly!

Example:
```typescript
// Change this line in enhanced-page.tsx:
<h1 className="text-4xl font-bold">Station Finder</h1>

// To:
<h1 className="text-4xl font-bold text-blue-600">🗺️ Find Your Station</h1>

// Save → Refresh browser → See the change!
```

### Edit Backend Code
1. Edit any Python file in `backend/`
2. Save the file
3. Backend auto-reloads (FastAPI reload enabled)
4. ✅ Change takes effect in ~1 second

Example:
```python
# In backend/main.py, find the @app.get("/") route
# Change the response message and save
# Visit http://localhost:8000/docs and test again
```

### Edit Database Schema
1. Edit `prisma/schema.prisma`
2. Run migration:
```bash
npm run prisma:migrate
```
3. ✅ Database updated!

---

## 📊 Monitoring & Dashboards

### Grafana Dashboard (localhost:3001)

**Login:**
- Username: `admin`
- Password: `admin`

**View:**
- Real-time metrics
- System health
- API performance
- Database load

### Prometheus (localhost:9090)

Query metrics like:
- `http_requests_total` - Total API requests
- `http_request_duration_seconds` - Response time
- `pg_connections_max` - Database connections

---

## 🧪 Test All Features Together

### Complete User Journey:

1. **Open Frontend** → http://localhost:3000
2. **Register/Login** → Create an account
3. **Go to Stations** → See map with real stations
4. **Choose a Station** → Click any marker
5. **View Details** → See:
   - ⭐ Reviews and ratings
   - 💵 Dynamic pricing (changes by time of day)
   - ⏱️ Wait time forecast (ML prediction)
   - 📍 Distance and availability
6. **Book a Session** → Reserve a time slot
7. **See Dynamic Price** → Check calculated cost
8. **Get Notification** → See booking confirmation
9. **View Dashboard** → See booking history

### Test All APIs:
- ✅ Station discovery → Works
- ✅ ML predictions → Forecast shown
- ✅ Dynamic pricing → Calculates correctly
- ✅ Reviews → Display ratings
- ✅ Notifications → Show alerts
- ✅ Bookings → Confirmed

---

## 🐛 Troubleshooting

### Problem: "Port 3000 already in use"
```bash
# Stop existing process or use different port
docker-compose down
docker-compose up -d

# Or manually:
# Windows: netstat -ano | findstr :3000
# Kill the process using that port
```

### Problem: "Cannot connect to database"
```bash
# Check if PostgreSQL container is running
docker-compose ps

# If not running, restart:
docker-compose restart postgres

# Check logs:
docker-compose logs postgres
```

### Problem: "Modules not found / pip install error"
```bash
# Frontend
rm -r node_modules
npm install

# Backend
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Problem: "Changes not showing up"
```bash
# Frontend: Hard refresh
# Press: Ctrl + Shift + R (or Cmd + Shift + R on Mac)

# Backend: Should auto-reload, if not:
docker-compose restart backend

# Clear browser cache:
# Dev Tools → Settings → Network → "Disable cache"
```

### Problem: "API returns 404"
```bash
# Check API is running:
curl http://localhost:8000/docs

# Check endpoint exists:
curl http://localhost:3000/api/stations

# View logs:
docker-compose logs backend
docker-compose logs frontend
```

---

## 📈 Verify Everything Works

### Checklist:

- [ ] Docker running: `docker-compose ps` shows all "Up"
- [ ] Frontend loads: http://localhost:3000
- [ ] API docs open: http://localhost:8000/docs
- [ ] Can call `/api/stations` endpoint
- [ ] Can call `/api/predictions/demand` - see forecast
- [ ] Can call `/api/pricing/dynamic` - see price calculation
- [ ] Can call `/api/reviews` - see ratings
- [ ] Can view `/api/notifications` - see alerts
- [ ] Grafana shows metrics: http://localhost:3001
- [ ] Stations appear on map with real data

---

## 🎬 Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart a service
docker-compose restart frontend

# Open database UI
npx prisma studio

# Run database migration
npm run prisma:migrate

# Seed with test data
npm run prisma:seed

# Check which ports are running
netstat -ano | findstr LISTENING
```

---

## 🎯 Next Steps

### Once Everything Is Running:

1. **Explore the Frontend**
   - Visit each page
   - Test the map with filters
   - Try making a booking
   - Check your dashboard

2. **Test the APIs**
   - Use Swagger at http://localhost:8000/docs
   - Try different endpoints
   - See responses in real-time

3. **Make Changes**
   - Edit a React component
   - See changes instantly
   - Test API response changes

4. **Monitor Performance**
   - Check Grafana dashboards
   - View response times
   - See database metrics

5. **When Ready to Deploy**
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Read [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

---

## 📞 Key Endpoints Reference

| Feature | Endpoint | Method | What It Does |
|---------|----------|--------|--------------|
| **Stations** | `/api/stations` | GET | List all stations |
| **Predictions** | `/api/predictions/demand` | GET/POST | ML forecast & feedback |
| **Pricing** | `/api/pricing/dynamic` | GET | Real-time price calc |
| **Reviews** | `/api/reviews` | GET/POST | Ratings & feedback |
| **Notifications** | `/api/notifications` | GET/PATCH/DELETE | User alerts |
| **Bookings** | `/api/bookings` | GET/POST | Reserve slot |
| **Payments** | `/api/payments/process` | POST | Process payment |
| **Analytics** | `/api/analytics/stations` | GET | Dashboard metrics |

---

## ✨ You're All Set!

Everything is now running locally:
- ✅ Frontend with Google Maps
- ✅ Backend with ML predictions
- ✅ Database with real data
- ✅ Monitoring dashboards
- ✅ All APIs functional

**Visit http://localhost:3000 and start exploring!** 🚀

---

<div align="center">

### Ready? Run this command:

```bash
docker-compose up -d
```

### Then visit:
**http://localhost:3000**

</div>
