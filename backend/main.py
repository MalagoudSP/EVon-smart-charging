from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Boolean, UUID, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import os
import uuid
import bcrypt
import jwt
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/evon_db"
)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI app
app = FastAPI(title="EVon API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Database Models ============

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    vehicle_type = Column(String(50))
    battery_capacity_kwh = Column(Numeric(5, 2))
    preferred_charging_speed = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class EVStation(Base):
    __tablename__ = "ev_stations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    location_address = Column(String(500))
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    total_chargers = Column(Integer, default=0)
    available_chargers = Column(Integer, default=0)
    charger_types = Column(String(500))
    power_rating_kw = Column(Numeric(6, 2))
    pricing_per_kwh = Column(Numeric(5, 3))
    access_type = Column(String(50))
    availability_status = Column(String(50))
    opening_hours = Column(String(100))
    amenities = Column(String(500))
    provider_name = Column(String(255))
    rating = Column(Numeric(3, 2))
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    station_id = Column(UUID(as_uuid=True), nullable=False)
    booking_date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)
    charger_type = Column(String(50))
    energy_kwh = Column(Numeric(6, 2))
    estimated_cost = Column(Numeric(8, 2))
    actual_cost = Column(Numeric(8, 2))
    payment_status = Column(String(50))
    booking_status = Column(String(50))
    cancellation_reason = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HistoricalData(Base):
    __tablename__ = "historical_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id = Column(UUID(as_uuid=True), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    chargers_available = Column(Integer)
    chargers_in_use = Column(Integer)
    demand_level = Column(String(50))
    average_wait_time_minutes = Column(Integer)
    weather_condition = Column(String(50))
    temperature_celsius = Column(Numeric(4, 2))
    traffic_congestion_level = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id = Column(UUID(as_uuid=True), nullable=False)
    prediction_type = Column(String(100), nullable=False)
    prediction_timestamp = Column(DateTime, nullable=False)
    predicted_value = Column(Numeric(10, 4))
    confidence_score = Column(Numeric(3, 2))
    actual_value = Column(Numeric(10, 4))
    error_rate = Column(Numeric(5, 2))
    model_version = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

# ============ Pydantic Models ============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    vehicle_type: Optional[str] = None
    battery_capacity_kwh: Optional[float] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    vehicle_type: Optional[str]
    battery_capacity_kwh: Optional[float]
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class EVStationResponse(BaseModel):
    id: str
    name: str
    location_address: Optional[str]
    latitude: float
    longitude: float
    total_chargers: int
    available_chargers: int
    charger_types: Optional[str]
    power_rating_kw: Optional[float]
    pricing_per_kwh: Optional[float]
    availability_status: str
    rating: Optional[float]
    distance_km: Optional[float] = None
    
    class Config:
        from_attributes = True

class BookingRequest(BaseModel):
    station_id: str
    start_time: datetime
    end_time: datetime
    charger_type: str

class BookingResponse(BaseModel):
    id: str
    station_id: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    estimated_cost: float
    booking_status: str
    
    class Config:
        from_attributes = True

# ============ Helper Functions ============

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), hash.encode())

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ============ Authentication Endpoints ============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        vehicle_type=user_data.vehicle_type,
        battery_capacity_kwh=user_data.battery_capacity_kwh,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

# ============ Station Endpoints ============

@app.get("/api/stations", response_model=List[EVStationResponse])
async def get_stations(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 50,
    db: Session = Depends(get_db)
):
    """Get nearby EV stations with optional geolocation filtering"""
    query = db.query(EVStation)
    
    # Basic filtering - for production, use PostGIS
    if latitude and longitude:
        # Simple bounding box filter
        lat_delta = radius_km / 111  # Approximate km to degrees
        lon_delta = radius_km / (111 * abs(np.cos(np.radians(latitude))))
        
        query = query.filter(
            EVStation.latitude.between(latitude - lat_delta, latitude + lat_delta),
            EVStation.longitude.between(longitude - lon_delta, longitude + lon_delta)
        )
    
    stations = query.all()
    return [EVStationResponse.from_orm(station) for station in stations]

@app.get("/api/stations/{station_id}", response_model=EVStationResponse)
async def get_station(station_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific station"""
    station = db.query(EVStation).filter(EVStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return EVStationResponse.from_orm(station)

# ============ Booking Endpoints ============

@app.post("/api/bookings", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingRequest,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Create a new charging booking"""
    station = db.query(EVStation).filter(EVStation.id == booking_data.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    duration_minutes = int((booking_data.end_time - booking_data.start_time).total_seconds() / 60)
    estimated_energy = duration_minutes / 60 * float(station.power_rating_kw or 7)
    estimated_cost = estimated_energy * float(station.pricing_per_kwh or 0.3)
    
    booking = Booking(
        user_id=user_id,
        station_id=booking_data.station_id,
        booking_date=datetime.utcnow(),
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        duration_minutes=duration_minutes,
        charger_type=booking_data.charger_type,
        energy_kwh=estimated_energy,
        estimated_cost=estimated_cost,
        booking_status="confirmed",
        payment_status="pending"
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.from_orm(booking)

@app.get("/api/bookings/{user_id}")
async def get_user_bookings(user_id: str, db: Session = Depends(get_db)):
    """Get all bookings for a user"""
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    return [BookingResponse.from_orm(booking) for booking in bookings]

# ============ Prediction Endpoints ============

@app.get("/api/predictions/{station_id}")
async def get_predictions(
    station_id: str,
    prediction_type: str = "demand",
    hours_ahead: int = 24,
    db: Session = Depends(get_db)
):
    """Get ML predictions for a station"""
    future_time = datetime.utcnow() + timedelta(hours=hours_ahead)
    
    predictions = db.query(Prediction).filter(
        Prediction.station_id == station_id,
        Prediction.prediction_type == prediction_type,
        Prediction.prediction_timestamp <= future_time
    ).order_by(Prediction.prediction_timestamp).all()
    
    return [
        {
            "timestamp": p.prediction_timestamp,
            "predicted_value": float(p.predicted_value or 0),
            "confidence_score": float(p.confidence_score or 0)
        }
        for p in predictions
    ]

# ============ Health Check ============

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "EVon API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
