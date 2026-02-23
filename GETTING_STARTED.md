# 📸 Complete Visual Guide - Run EVon Locally

**Copy-paste exact commands below to get everything running**

---

## ✅ Prerequisites Checklist

Before starting, you need ONE of these:

### Option A: Docker Installed (Easiest - Recommended ⭐)
```bash
# Check if you have Docker
docker --version
# Should show: Docker version 20.10+

docker-compose --version
# Should show: Docker Compose version 1.29+
```

**If not installed:**
→ Download: https://www.docker.com/products/docker-desktop/

### Option B: Without Docker (Needs Node.js + Python)
```bash
# Check Node
node --version
# Should show: v18+

# Check Python
python --version
# Should show: 3.9+
```

---

## 🚀 EASIEST METHOD - Docker (Recommended)

### Copy-Paste These Commands

**Step 1 - Open PowerShell**
- Right-click desktop → "Open PowerShell here"
- Or: Press `Win + R` → Type `powershell` → Enter

**Step 2 - Go to Project Folder**
```powershell
cd "c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app"
```

**Step 3 - Start Everything (ONE Command)**
```powershell
docker-compose up -d
```

**Step 4 - Wait 2-3 Minutes ⏳**
- Docker downloads images (first time only)
- Docker starts all 7 services
- You'll see output like:
```
Creating evon-postgres ... done
Creating evon-redis ... done
Creating evon-backend ... done
Creating evon-frontend ... done
```

**Step 5 - Check Everything is Running**
```powershell
docker-compose ps
```

You should see all services with status "Up":
```
CONTAINER ID   STATUS                 PORTS
postgres       Up 2 minutes           0.0.0.0:5432->5432/tcp
redis          Up 2 minutes           0.0.0.0:6379->6379/tcp
backend        Up 1 minute            0.0.0.0:8000->8000/tcp
frontend       Up 1 minute            0.0.0.0:3000->3000/tcp
postgres       Up 2 minutes           0.0.0.0:9090->9090/tcp
postgres       Up 2 minutes           0.0.0.0:3001->3001/tcp
```

### ✨ Done! Now Visit These URLs

Open your browser and visit:

1. **http://localhost:3000** 
   - Your complete EV charging app
   - Fully functional with maps and bookings

2. **http://localhost:8000/docs**
   - Interactive API documentation
   - Test all endpoints here

3. **http://localhost:3001**
   - Grafana dashboards
   - Login: admin / admin

---

## 🎬 What to Do Next

### Explore the Frontend

**Visit: http://localhost:3000**

**You'll see:**

1. **Landing Page** - Main page with features
   - Scroll down to see features
   - Click buttons to navigate

2. **Stations Page** - EV station finder
   - Map view with stations (click `/stations`)
   - Filter by:
     - Distance (1-100 km)
     - Rating (1-5 stars)
     - Price (per kWh)
     - Demand level
     - Availability
   - Sort by:
     - Distance
     - Price
     - Rating
     - Availability
     - Wait time

3. **Station Details** - Click any station to see:
   - ⭐ Reviews and ratings (5-star system)
   - 💰 Dynamic pricing (changes by time)
   - ⏱️ Wait time forecast (ML prediction)
   - 📍 Address and distance
   - 🔌 Available chargers
   - 🏆 Station amenities

4. **Booking Page** - Reserve a charging slot
   - Select date and time
   - Choose duration
   - See real-time price calculation
   - Confirm booking

### Test the APIs

**Visit: http://localhost:8000/docs**

You'll see a Swagger interface. For each endpoint:
1. Click on the endpoint name
2. Click "Try it out" button
3. Click "Execute" button
4. See the response (with real data!)

**Key endpoints to test:**

```
GET /api/stations
→ Returns: All EV stations

GET /api/predictions/demand
→ Returns: 24-hour demand forecast

GET /api/pricing/dynamic
→ Returns: Real-time price calculation

GET /api/reviews
→ Returns: Station 5-star ratings

GET /api/notifications
→ Returns: User alerts and messages

POST /api/reviews
→ Creates: New review/rating

POST /api/payments/process
→ Processes: Payment with promo codes

GET /api/analytics/stations
→ Returns: Real-time metrics
```

### View the Database

**Option 1: Prisma Studio (Visual)**
```powershell
npx prisma studio
```
→ Opens http://localhost:5555 where you can:
- Browse all data in tables
- Add new records
- Edit existing data
- View relationships

**Option 2: Direct Database Access**
```powershell
docker exec -it postgres psql -U postgres -d evon_db

# Then you can query:
SELECT * FROM "Station" LIMIT 5;
SELECT * FROM "Review" LIMIT 5;
\dt  (list all tables)
\q   (quit)
```

---

## 🔄 See Changes Live

### Edit Frontend Code

**Example: Change the stations page title**

1. Open file: `app/stations/enhanced-page.tsx`
2. Find the `<h1>` tag (around line 50)
3. Current: `<h1>Station Finder</h1>`
4. Change to: `<h1>🗺️ Find Your Charging Station</h1>`
5. **Save file** (Ctrl+S)
6. **Refresh browser** (F5 or Cmd+Shift+R)
7. ✨ Change appears instantly!

### Edit Backend Code

**Example: Change API response**

1. Open file: `backend/main.py`
2. Change any endpoint response
3. **Save file**
4. ✅ Auto-reloads in ~1 second
5. Test in Swagger: http://localhost:8000/docs

### Track Changes in Real-Time

Open VS Code Terminal:
```powershell
# See all logs from all services
docker-compose logs -f

# Or just one service
docker-compose logs -f frontend
docker-compose logs -f backend
```

Every time you make a request, you'll see the logs!

---

## 📊 Understanding the Architecture

```
┌─────────────────────────────────────────────┐
│         YOUR BROWSER                         │
│    http://localhost:3000                    │
└────────────────────┬──────────────────────┘
                     │ (HTTP Requests)
                     ▼
┌─────────────────────────────────────────────┐
│         FRONTEND (Next.js)                   │
│    - React components                        │
│    - Google Maps integration                 │
│    - Real-time updates                      │
│    PORT: 3000                                │
└────────────────────┬──────────────────────┘
                     │ (REST API calls)
                     ▼
┌─────────────────────────────────────────────┐
│         BACKEND (FastAPI)                    │
│    - ML predictions                          │
│    - Dynamic pricing                         │
│    - Reviews & ratings                       │
│    - Notifications                           │
│    - Payments & analytics                    │
│    PORT: 8000                                │
└────────────────────┬──────────────────────┘
                     │ (SQL queries)
                     ▼
┌─────────────────────────────────────────────┐
│    DATABASE & CACHE                          │
│    - PostgreSQL (data)                       │
│    - Redis (cache)                           │
│    PORTS: 5432, 6379                         │
└─────────────────────────────────────────────┘
```

---

## 🔧 Useful Commands

| What | Command |
|-----|---------|
| **Start all services** | `docker-compose up -d` |
| **Stop all services** | `docker-compose down` |
| **View all logs** | `docker-compose logs -f` |
| **View specific logs** | `docker-compose logs -f frontend` |
| **Check status** | `docker-compose ps` |
| **View database UI** | `npx prisma studio` |
| **Restart a service** | `docker-compose restart frontend` |
| **Rebuild services** | `docker-compose up -d --build` |
| **Remove everything** | `docker-compose down -v` |
| **Check specific port** | `netstat -ano \| findstr :3000` |

---

## 🧪 Complete Test Workflow

### 1. Frontend is Loading
```
✅ Visit http://localhost:3000
✅ See landing page
✅ Navigation menu works
```

### 2. Map & Stations Page
```
✅ Click on "Stations"
✅ See map with markers
✅ Markers are color-coded (green/yellow/red)
✅ Can drag, zoom, and click markers
✅ Station details appear in sidebar
```

### 3. Test Predictions API
```
✅ Visit http://localhost:8000/docs
✅ Find GET /api/predictions/demand
✅ Click "Try it out"
✅ Click "Execute"
✅ See response with forecast data
```

### 4. Test Pricing API
```
✅ Find GET /api/pricing/dynamic
✅ Click "Try it out"
✅ Add: stationId: "stn_001"
✅ Add: duration: 60
✅ Click "Execute"
✅ See price calculation breakdown
```

### 5. Test Reviews API
```
✅ Find GET /api/reviews
✅ Add: stationId: "stn_001"
✅ Click "Execute"
✅ See all ratings for that station
```

### 6. Create a Review
```
✅ Find POST /api/reviews
✅ Click "Try it out"
✅ Enter JSON body:
{
  "userId": "user_123",
  "stationId": "stn_001",
  "rating": 5,
  "comment": "Great!",
  "cleanliness": 5,
  "functionality": 5,
  "experience": 4
}
✅ Click "Execute"
✅ See new review created
```

### 7. View Monitoring
```
✅ Visit http://localhost:3001
✅ Login: admin / admin
✅ See Grafana dashboards
✅ View metrics in real-time
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **Docker command not found** | Install Docker Desktop from https://docker.com |
| **Port 3000 already in use** | Run: `docker-compose down` first |
| **App won't load** | Wait full 3 minutes, check: `docker-compose logs` |
| **API returns 404** | API still loading, wait 1 minute and try again |
| **Browser stuck loading** | Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac) |
| **Can't see changes** | Hard refresh AND clear cache (see above) |
| **Database error** | Stop and restart: `docker-compose restart` |
| **Out of memory** | Give Docker more resources in Docker Desktop settings |

---

## 📝 Summary

**What you just did:**
✅ Started frontend (React + Next.js)
✅ Started backend (FastAPI + ML/DP learning)
✅ Started database (PostgreSQL)
✅ Started caching layer (Redis)
✅ Started monitoring (Prometheus + Grafana)
✅ All 7 services interconnected and working

**What's running now:**
| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Your app |
| API | http://localhost:8000/docs | Test endpoints |
| Grafana | http://localhost:3001 | Dashboards (+admin/admin) |
| Prometheus | http://localhost:9090 | Metrics |

**What you can do:**
✅ Browse the app
✅ Test all APIs
✅ View the database
✅ Change code and see live updates
✅ Monitor performance
✅ Review real-time metrics

---

<div align="center">

## 🎉 You're All Set!

### Everything is Running ✅

**Total time:** 5-10 minutes  
**Effort:** Copy-paste 2 commands  
**Result:** Full-stack app running locally

---

### Next: Dive In!

1. **Frontend**: http://localhost:3000 🌐
2. **APIs**: http://localhost:8000/docs 📚
3. **Dashboards**: http://localhost:3001 📊

### Need Help?
- Detailed guide: [RUN_LOCALLY.md](./RUN_LOCALLY.md)
- Complete guide: [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)
- All docs: [INDEX.md](./INDEX.md)

---

## 🚀 Ready to Start?

### Copy this command:
```
docker-compose up -d
```

### Run it in PowerShell:
```
cd "c:\Users\MALAGOUD PATIL\OneDrive\ドキュメント\GitHub\v0-ev-on-smart-charging-app"
docker-compose up -d
```

### Then visit:
http://localhost:3000

**That's everything!** 🎊

</div>
