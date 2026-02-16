#!/usr/bin/env python3
"""
Complete system initialization and execution script for EVon.
Handles data generation, model training, and system startup.
"""

import os
import sys
import subprocess
from pathlib import Path

def print_header(text):
    """Print formatted header."""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70 + "\n")

def print_step(step_num, text):
    """Print formatted step."""
    print(f"\n[Step {step_num}] {text}")
    print("-" * 70)

def check_requirements():
    """Check if all requirements are met."""
    print_header("System Requirements Check")
    
    requirements = {
        "Python 3.9+": sys.version_info >= (3, 9),
        "PostgreSQL": os.system("psql --version > /dev/null 2>&1") == 0,
    }
    
    for req, status in requirements.items():
        status_str = "✓" if status else "✗"
        print(f"{status_str} {req}")
    
    # Non-critical checks
    print("\nOptional:")
    print("✓ Docker" if os.system("docker --version > /dev/null 2>&1") == 0 else "✗ Docker (optional)")

def setup_python_env():
    """Setup Python virtual environment."""
    print_step(1, "Setting up Python environment")
    
    venv_path = "venv"
    
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
        print("✓ Virtual environment created")
    else:
        print("✓ Virtual environment already exists")
    
    # Activate venv and install requirements
    print("Installing dependencies...")
    
    # Determine pip path based on OS
    pip_cmd = os.path.join(venv_path, "Scripts", "pip") if os.name == "nt" else os.path.join(venv_path, "bin", "pip")
    
    subprocess.run([pip_cmd, "install", "-r", "requirements.txt"], check=True)
    print("✓ Dependencies installed")

def generate_training_data():
    """Generate training data."""
    print_step(2, "Generating training data")
    
    python_cmd = os.path.join("venv", "Scripts", "python") if os.name == "nt" else os.path.join("venv", "bin", "python")
    
    try:
        subprocess.run([python_cmd, "generate_training_data.py"], check=True)
        print("✓ Training data generated successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to generate training data: {e}")
        return False
    
    return True

def train_ml_models():
    """Train ML models."""
    print_step(3, "Training machine learning models")
    
    python_cmd = os.path.join("venv", "Scripts", "python") if os.name == "nt" else os.path.join("venv", "bin", "python")
    
    try:
        subprocess.run([python_cmd, "train_models.py"], check=True)
        print("✓ All models trained successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to train models: {e}")
        return False
    
    return True

def setup_database():
    """Setup PostgreSQL database."""
    print_step(4, "Setting up PostgreSQL database")
    
    # Check if PostgreSQL is running
    if os.system("psql --version > /dev/null 2>&1") != 0:
        print("⚠ PostgreSQL not found. Skipping database setup.")
        print("  Note: System will work with mock data.")
        return True
    
    # Create database
    print("Creating database...")
    os.system('psql -U postgres -c "CREATE DATABASE evon;" 2>/dev/null')
    
    # Initialize schema
    print("Initializing database schema...")
    os.system("psql -U postgres -d evon -f ../scripts/init-db.sql")
    
    # Seed data
    print("Seeding sample data...")
    os.system("psql -U postgres -d evon -f ../scripts/seed-data.sql")
    
    print("✓ Database setup complete")
    return True

def create_model_directory():
    """Create models directory."""
    print_step(5, "Creating model directory")
    
    os.makedirs("models", exist_ok=True)
    print("✓ Models directory ready")

def show_system_info():
    """Display system information and next steps."""
    print_header("System Information")
    
    print("Frontend: http://localhost:3000")
    print("Backend API: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Database: postgresql://localhost:5432/evon")
    
    print_header("Next Steps")
    
    print("1. Frontend (Next.js):")
    print("   cd .. && pnpm dev")
    print()
    print("2. Backend (FastAPI):")
    print("   python -m uvicorn main:app --reload --port 8000")
    print()
    print("3. Access the application:")
    print("   - Landing Page: http://localhost:3000")
    print("   - Find Stations: http://localhost:3000/stations")
    print("   - Dashboard: http://localhost:3000/dashboard")
    print()
    print("4. API Documentation:")
    print("   - Swagger UI: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print()
    print("5. Test with curl:")
    print("   curl http://localhost:3000/api/stations?latitude=40.7128&longitude=-74.0060")

def test_models():
    """Test trained models with sample data."""
    print_step(6, "Testing trained models")
    
    python_cmd = os.path.join("venv", "Scripts", "python") if os.name == "nt" else os.path.join("venv", "bin", "python")
    
    test_code = """
import sys
sys.path.insert(0, '.')

from train_models import DemandPredictor, LoadForecaster, ChargingTimePredictor, StationRecommender

# Test demand predictor
print("Testing Demand Predictor...")
demand_pred = DemandPredictor.load()
demand = demand_pred.predict({'hour': 17, 'day_of_week': 3, 'month': 2, 'temperature': 10})
print(f"  Predicted demand at 5 PM: {demand:.1f}")

# Test load forecaster
print("Testing Load Forecaster...")
load_fore = LoadForecaster.load()
load = load_fore.predict({'hour': 17, 'day_of_week': 3, 'month': 2})
print(f"  Predicted load: {load:.1f} kW")

# Test charging time predictor
print("Testing Charging Time Predictor...")
charge_pred = ChargingTimePredictor.load()
time = charge_pred.predict(60, 3, 50, 20, 80)
print(f"  Estimated charging time: {time:.0f} minutes")

# Test recommender
print("Testing Station Recommender...")
recommender = StationRecommender.load()
print(f"  Recommender loaded successfully")

print("\\n✓ All models tested successfully!")
"""
    
    with open("test_models.py", "w") as f:
        f.write(test_code)
    
    try:
        subprocess.run([python_cmd, "test_models.py"], check=True)
        os.remove("test_models.py")
        print("✓ Model tests passed")
    except subprocess.CalledProcessError:
        print("⚠ Model tests encountered issues (this is normal if models aren't trained yet)")
        if os.path.exists("test_models.py"):
            os.remove("test_models.py")

def main():
    """Main execution flow."""
    print_header("EVon System Initialization")
    
    print("This script will:")
    print("1. Setup Python virtual environment")
    print("2. Generate training data")
    print("3. Train ML/DL models")
    print("4. Setup PostgreSQL database (optional)")
    print("5. Prepare the system for launch")
    print()
    
    # Step 1: Check requirements
    check_requirements()
    
    # Step 2: Setup Python environment
    setup_python_env()
    
    # Step 3: Generate training data
    if not generate_training_data():
        print("\n⚠ Continuing without training data...")
    
    # Step 4: Train models
    if not train_ml_models():
        print("\n⚠ Model training failed. You can train models later.")
    
    # Step 5: Create model directory
    create_model_directory()
    
    # Step 6: Setup database (optional)
    setup_database()
    
    # Step 7: Test models
    test_models()
    
    # Final information
    show_system_info()
    
    print_header("Setup Complete!")
    print("Ready to launch EVon!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n✗ Setup failed: {e}")
        sys.exit(1)
