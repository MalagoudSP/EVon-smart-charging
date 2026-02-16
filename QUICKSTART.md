# EVon Quick Start Guide

## 5-Minute Setup

### 1. Clone and Install

```bash
# Install dependencies
pnpm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Start with Mock Data (No Backend Required)

```bash
# Run frontend only
pnpm dev

# Visit http://localhost:3000
# You can browse stations, make predictions, and create bookings!
```

### 3. (Optional) Start Full Stack

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 3: (Optional) Database with Docker
docker run --name evon-db -e POSTGRES_PASSWORD=password -p 5432:5432 postgres
```

## Features You Can Try

### Landing Page
- Visit http://localhost:3000
- See the hero section with features overview
- Click "Get Started" to register

### Browse Stations
- Click "Find Stations" (or Sign In first)
- Uses mock data with real charging stations
- Filter by distance, price, availability
- Sort by different criteria

### Make Predictions
- On station details, see demand predictions
- View estimated charging time
- Get cost estimates

### Create Bookings
- Book a charging session
- Choose charger type and duration
- View estimated cost

### User Dashboard
- Track booking history
- View charging statistics
- See cost analysis

## Environment Setup

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/evon
SECRET_KEY=dev-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

## Default Credentials

The system uses test accounts. Sign up with any email to get started.

Example:
- Email: test@example.com
- Password: Test123!

## File Structure

```
evon/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── login/               # Auth pages
│   ├── stations/            # Station finder
│   ├── booking/             # Booking pages
│   ├── dashboard/           # User dashboard
│   ├── api/                 # API routes
│   │   ├── stations/
│   │   ├── predictions/
│   │   └── bookings/
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
├── lib/                     # Utilities and hooks
├── backend/                 # FastAPI server
│   ├── main.py             # FastAPI app
│   ├── ml_models.py        # ML model classes
│   ├── train_models.py     # Model training
│   └── requirements.txt
├── scripts/                # Database scripts
├── public/                 # Static assets
└── EVon_README.md         # Full documentation
```

## Common Issues

### Port Already in Use
```bash
# Change frontend port
pnpm dev -- -p 3001

# Change backend port
python -m uvicorn main:app --port 8001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Python
rm -rf backend/venv
python -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Or use mock data (default, no DB required)
```

## Next Steps

1. **Explore the Code**: Check out the components and API routes
2. **Train Models**: Run `python backend/train_models.py`
3. **Add Real Data**: Connect to PostgreSQL and seed data
4. **Deploy**: Follow deployment guide in EVon_README.md
5. **Customize**: Modify colors, text, and features

## API Documentation

When backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Debugging

### Enable Debug Logging
```typescript
// In components
console.log('[v0] Debug info:', variable)

// Check browser console
// Check terminal output
```

### Test API Endpoints
```bash
# Get stations
curl http://localhost:3000/api/stations?latitude=40.7128&longitude=-74.0060

# Make prediction
curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{"type":"demand","hour":17,"day_of_week":3}'

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"station_id":"STN_00001","charger_type":3,"duration_minutes":30}'
```

## Performance Tips

1. Use Chrome DevTools to monitor performance
2. Check Network tab for API response times
3. Use React DevTools for component rendering
4. Profile with Lighthouse for best practices

## Getting Help

- Check EVon_README.md for detailed docs
- Review SETUP.md for installation details
- Check error logs in browser console and terminal
- Test with curl/Postman before using UI

---

**Happy charging! 🚗⚡**
