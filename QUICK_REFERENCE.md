# 🚀 EVon v2.0.0 - Quick Reference Guide

## 📍 Getting Started in 5 Minutes

### Step 1: Clone & Install
```bash
git clone <your-repo-url>
cd evon-ev-charging
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_GOOGLE_MAPS_KEY
# - STRIPE keys
# - DATABASE_URL
```

### Step 3: Setup Database
```bash
npm run prisma:migrate
npm run prisma:seed
```

### Step 4: Run
```bash
# Option A: Docker (Recommended)
docker-compose up -d

# Option B: Local
npm run dev
# In another terminal:
cd backend && uvicorn main:app --reload
```

### Step 5: Access
- Frontend: http://localhost:3000
- API: http://localhost:8000/docs
- Grafana: http://localhost:3001 (admin/admin)

---

## 🗂️ Project Structure

```
evon-ev-charging/
├── app/                          # Next.js app directory
│   ├── api/                      # REST API endpoints
│   │   ├── predictions/          # ML predictions
│   │   ├── pricing/              # Dynamic pricing
│   │   ├── reviews/              # Reviews & ratings
│   │   ├── notifications/        # Notification system
│   │   ├── payments/             # Payment processing
│   │   ├── analytics/            # Real-time analytics
│   │   └── stations/             # Station search
│   ├── stations/                 # Stations page
│   ├── booking/                  # Booking page
│   ├── dashboard/                # User dashboard
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   └── google-maps-stations.tsx  # Maps component
│   └── theme-provider.tsx
├── prisma/
│   ├── schema.prisma             # Database schema (10 models)
│   └── seed.js                   # Initial data
├── backend/
│   ├── main.py                   # FastAPI application
│   ├── ml_models.py              # ML prediction models
│   ├── ml_endpoints.py           # ML API routes
│   ├── train_models.py           # Model training
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile
├── docker-compose.yml            # All services
├── PRODUCTION_GUIDE.md           # Complete setup guide
├── FEATURES_SUMMARY.md           # Feature overview
└── DEPLOYMENT_CHECKLIST.md       # Pre-deployment checklist
```

---

## 🔑 Key Environment Variables

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=pk_...

# Authentication
NEXTAUTH_SECRET=__GENERATOR__ # Use: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/evon_db

# Payments (Stripe)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Backend
BACKEND_URL=http://localhost:8000

# Cache
REDIS_URL=redis://localhost:6379
```

---

## 📡 API Endpoints Quick Reference

### Stations
```bash
GET /api/stations
  ?latitude=40.7128
  &longitude=-74.0060
  &radius=50
  &sortBy=distance
```

### Predictions
```bash
GET /api/predictions/demand
  ?stationId=stn_001
  &hoursAhead=4
```

### Pricing
```bash
GET /api/pricing/dynamic
  ?stationId=stn_001
  &duration=60
```

### Reviews
```bash
GET /api/reviews?stationId=stn_001
POST /api/reviews (submit review)
```

### Notifications
```bash
GET /api/notifications?userId=user_123
POST /api/notifications (create)
PATCH /api/notifications (mark read)
```

### Payments
```bash
POST /api/payments/process
  body: { userId, bookingId, amount, paymentMethod, cardToken }
```

### Analytics
```bash
GET /api/analytics/stations
  ?stationId=stn_001 (optional)
```

---

## 🐳 Docker Commands

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f frontend  # Frontend logs
docker-compose logs -f backend   # Backend logs
docker-compose logs -f postgres  # Database logs
```

### Stop Services
```bash
docker-compose down
```

### Restart Service
```bash
docker-compose restart frontend
```

### View Services Status
```bash
docker-compose ps
```

### Execute Command in Container
```bash
docker-compose exec frontend npm run prisma:migrate
docker-compose exec backend python train_models.py
```

---

## 📊 Monitoring URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | None |
| Backend API | http://localhost:8000 | None |
| Swagger Docs | http://localhost:8000/docs | None |
| Prometheus | http://localhost:9090 | None |
| Grafana | http://localhost:3001 | admin/admin |
| PostgreSQL | localhost:5432 | evon_user/evon_password_dev |
| Redis | localhost:6379 | None |

---

## 💾 Database Quick Tips

### Access Database
```bash
psql -U evon_user -d evon_db -h localhost
```

### Run Migrations
```bash
npm run prisma:migrate
```

### Seed Data
```bash
npm run prisma:seed
```

### Reset Database
```bash
npm run prisma:migrate reset
```

### View Schema
```bash
npm run prisma:generate
```

---

## 🧪 Testing Commands

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage

# Lint check
npm run lint
```

---

## 🚀 Deployment Quick Commands

### Production Build
```bash
npm run build
npm start
```

### Docker Build
```bash
docker build -t evon:2.0.0 .
docker-compose up -d
```

### Check All Services Healthy
```bash
docker-compose ps
# All should show "healthy" status
```

---

## 📈 Performance Tuning

### Enable Caching
```bash
export REDIS_URL=redis://localhost:6379
```

### Database Connection Pooling
```javascript
// In prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pooling
  directUrl = env("DATABASE_DIRECT_URL")
}
```

### Next.js Optimization
```bash
npm run build --profile  # Generate profile
npm start                 # Production mode
```

---

## 🔒 Security Checklist

- [ ] Secrets in `.env.local` (never in git)
- [ ] HTTPS enabled in production
- [ ] Database credentials changed
- [ ] API keys rotated quarterly
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

---

## 🐛 Common Issues & Solutions

### Issue: Google Maps Not Loading
```
Solution: Verify API key in .env.local
         Check API restrictions in Google Cloud Console
         Enable Maps JavaScript API
```

### Issue: Database Connection Error
```
Solution: Check DATABASE_URL format
         Verify PostgreSQL running
         Check credentials in .env.local
```

### Issue: Port Already in Use
```
Solution: Kill process: lsof -ti:3000 | xargs kill
         Or change port in docker-compose.yml
```

### Issue: Memory Issues
```
Solution: Check Redis memory: redis-cli info memory
         Increase Docker memory limit
         Restart Redis
```

---

## 📞 Quick Help

### Frontend Issues
- Check `.env.local` for required variables
- Verify npm dependencies: `npm install`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

### Backend Issues
- Check Python dependencies: `pip install -r requirements.txt`
- Verify database connection string
- Check backend logs: `docker logs evon-backend`
- Train models: `python backend/train_models.py`

### Database Issues
- Connect via psql to verify
- Check migrations: `npm run prisma:migrate`
- Verify seed data: `npm run prisma:seed`
- Check connections: `docker-compose logs postgres`

### Docker Issues
- Verify Docker running: `docker ps`
- Check compose file: `docker-compose config`
- View logs: `docker-compose logs -f`
- Rebuild: `docker-compose build --no-cache`

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md) | Complete production setup (15+ pages) |
| [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md) | Feature details & workflows (12+ pages) |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-deployment verification (100+ items) |
| [README_PRODUCTION.md](README_PRODUCTION.md) | Full project overview |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was built & achieved |

---

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (10 models) |
| `app/stations/enhanced-page.tsx` | Main stations page with maps |
| `components/ui/google-maps-stations.tsx` | Google Maps component |
| `app/api/*/route.ts` | All API endpoints |
| `docker-compose.yml` | All services config |
| `.env.example` | Environment template |

---

## 💡 Pro Tips

1. **Quick Database Reset**
   ```bash
   npm run prisma:migrate reset --force
   ```

2. **Monitor Everything**
   ```bash
   docker-compose logs -f  # All logs
   ```

3. **Quick API Test**
   ```bash
   curl http://localhost:8000/api/stations
   ```

4. **Check ML Model**
   ```bash
   docker-compose exec backend python3 << 'EOF'
   import pickle
   model = pickle.load(open('ml_models/demand_predictor.pkl', 'rb'))
   print("Model loaded successfully!")
   EOF
   ```

5. **Database Backup**
   ```bash
   docker-compose exec postgres pg_dump -U evon_user evon_db > backup.sql
   ```

---

## 📊 Feature Quick Overview

| Feature | Status | Endpoint | Performance |
|---------|--------|----------|-------------|
| Station Search | ✅ | `/api/stations` | <1s |
| Google Maps | ✅ | Component | <3s |
| ML Predictions | ✅ | `/api/predictions/demand` | <1s |
| Dynamic Pricing | ✅ | `/api/pricing/dynamic` | <500ms |
| Reviews | ✅ | `/api/reviews` | <1s |
| Notifications | ✅ | `/api/notifications` | <100ms |
| Payments | ✅ | `/api/payments/process` | <2s |
| Analytics | ✅ | `/api/analytics/stations` | <1s |

---

## 🎓 Learning Resources

- **API Docs**: http://localhost:8000/docs (auto-generated Swagger)
- **Prisma Studio**: `npx prisma studio` (visual DB editor)
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind UI**: http://localhost:3000 (see components)

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Services running: `docker-compose ps`
- [ ] API responding: `curl http://localhost:8000/docs`
- [ ] Frontend loading: http://localhost:3000
- [ ] Google Maps displaying
- [ ] Stripe keys verified
- [ ] Database backed up
- [ ] Monitoring dashboard accessible
- [ ] Email notifications working
- [ ] All tests passing: `npm run test`
- [ ] Build successful: `npm run build`

---

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: February 23, 2026  

**Need Help?** Check the documentation or visit: docs.evon.app
