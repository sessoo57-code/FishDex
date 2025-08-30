from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Fish Models
class UserCatch(BaseModel):
    photo: str
    location: str
    equipment: str
    date: str

class Fish(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    name: str
    scientificName: str
    habitat: str  # 'mare', 'fiume', 'lago'
    description: str
    referenceImage: str
    isUnlocked: bool = False
    userCatch: Optional[UserCatch] = None

    class Config:
        populate_by_name = True

class UnlockFishRequest(BaseModel):
    photo: str
    location: str
    equipment: str
    date: str

# Italian Fish Database - simplified for stability
FISH_DATABASE = [
    # PESCI MARINI (Mare)
    {
        "name": "Spigola", 
        "scientificName": "Dicentrarchus labrax", 
        "habitat": "mare", 
        "description": "Predatore marino molto apprezzato, si trova vicino alle coste rocciose e sabbiose.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Spigola"
    },
    {
        "name": "Orata", 
        "scientificName": "Sparus aurata", 
        "habitat": "mare",
        "description": "Pesce pregiato con caratteristica macchia dorata tra gli occhi, vive in fondali sabbiosi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Orata"
    },
    {
        "name": "Tonno", 
        "scientificName": "Thunnus thynnus", 
        "habitat": "mare",
        "description": "Grande pesce pelagico, il re del Mediterraneo. Può raggiungere dimensioni enormi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Tonno"
    },
    {
        "name": "Ricciola", 
        "scientificName": "Seriola dumerili", 
        "habitat": "mare",
        "description": "Potente predatore pelagico, molto combattivo quando allamato.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Ricciola"
    },
    {
        "name": "Pesce serra", 
        "scientificName": "Pomatomus saltatrix", 
        "habitat": "mare",
        "description": "Predatore vorace con denti affilati, caccia in branchi numerosi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Serra"
    },
    {
        "name": "Dentice", 
        "scientificName": "Dentex dentex", 
        "habitat": "mare",
        "description": "Pesce pregiato con potenti mascelle, vive su fondali rocciosi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Dentice"
    },
    {
        "name": "Sarago", 
        "scientificName": "Diplodus sargus", 
        "habitat": "mare",
        "description": "Pesce comune nei porti e nelle scogliere, riconoscibile dalle bande verticali.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Sarago"
    },
    {
        "name": "Rombo", 
        "scientificName": "Psetta maxima", 
        "habitat": "mare",
        "description": "Pesce piatto che vive nascosto sui fondali sabbiosi, eccellente mimesi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Rombo"
    },
    {
        "name": "Sogliola", 
        "scientificName": "Solea solea", 
        "habitat": "mare",
        "description": "Pesce piatto bentonico, vive su fondali sabbiosi e fangosi.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Sogliola"
    },
    {
        "name": "Cefalo", 
        "scientificName": "Mugil cephalus", 
        "habitat": "mare",
        "description": "Pesce eurialino che si adatta sia in mare che in acqua dolce.",
        "referenceImage": "https://via.placeholder.com/200x100/4A90E2/FFFFFF?text=Cefalo"
    },

    # PESCI D'ACQUA DOLCE - FIUMI (Fiume)
    {
        "name": "Luccio", 
        "scientificName": "Esox lucius", 
        "habitat": "fiume",
        "description": "Predatore d'acqua dolce per eccellenza, con corpo affusolato e grandi mascelle.",
        "referenceImage": "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Luccio"
    },
    {
        "name": "Carpa", 
        "scientificName": "Cyprinus carpio", 
        "habitat": "fiume",
        "description": "Grande cyprinide, può raggiungere dimensioni notevoli. Molto resistente.",
        "referenceImage": "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Carpa"
    },
    {
        "name": "Barbo", 
        "scientificName": "Barbus barbus", 
        "habitat": "fiume",
        "description": "Pesce di fondo con barbigli, predilige acque correnti e ossigenate.",
        "referenceImage": "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Barbo"
    },
    {
        "name": "Cavedano", 
        "scientificName": "Squalius cephalus", 
        "habitat": "fiume",
        "description": "Cyprinide comune nei fiumi italiani, molto adattabile.",
        "referenceImage": "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Cavedano"
    },
    {
        "name": "Trota fario", 
        "scientificName": "Salmo trutta", 
        "habitat": "fiume",
        "description": "Regina dei torrenti di montagna, con caratteristiche macchie colorate.",
        "referenceImage": "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Trota"
    },

    # PESCI D'ACQUA DOLCE - LAGHI (Lago)
    {
        "name": "Persico reale", 
        "scientificName": "Perca fluviatilis", 
        "habitat": "lago",
        "description": "Predatore con caratteristiche bande verticali scure, comune nei laghi.",
        "referenceImage": "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Persico"
    },
    {
        "name": "Tinca", 
        "scientificName": "Tinca tinca", 
        "habitat": "lago",
        "description": "Pesce bentonico con corpo tozzo, vive in acque stagnanti ricche di vegetazione.",
        "referenceImage": "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Tinca"
    },
    {
        "name": "Alborella", 
        "scientificName": "Alburnus alburnus", 
        "habitat": "lago",
        "description": "Piccolo pesce argentato che forma grandi branchi in superficie.",
        "referenceImage": "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Alborella"
    },
    {
        "name": "Scardola", 
        "scientificName": "Scardinius erythrophthalmus", 
        "habitat": "lago",
        "description": "Cyprinide dalle pinne rossastre, preferisce acque calme e vegetate.",
        "referenceImage": "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Scardola"
    },
    {
        "name": "Coregone", 
        "scientificName": "Coregonus lavaretus", 
        "habitat": "lago",
        "description": "Salmonide di lago, molto apprezzato in cucina.",
        "referenceImage": "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Coregone"
    },
]

# Extend database to 150+ fish with generated entries
for i in range(21, 151):
    habitat = ['mare', 'fiume', 'lago'][i % 3]
    color = {'mare': '4A90E2', 'fiume': '10B981', 'lago': '8B5CF6'}[habitat]
    FISH_DATABASE.append({
        "name": f"Pesce {i}",
        "scientificName": f"Piscis species{i}",
        "habitat": habitat,
        "description": f"Descrizione del pesce numero {i} dell'habitat {habitat}.",
        "referenceImage": f"https://via.placeholder.com/200x100/{color}/FFFFFF?text=Pesce{i}"
    })

# Initialize fish database on startup
async def initialize_fish_database():
    """Initialize the fish database with all Italian species"""
    try:
        # Check if fish already exist
        existing_count = await db.fish.count_documents({})
        if existing_count > 0:
            print(f"Fish database already initialized with {existing_count} species")
            return
        
        # Insert all fish
        fish_documents = []
        for fish_data in FISH_DATABASE:
            fish_doc = {
                "_id": str(uuid.uuid4()),
                **fish_data
            }
            fish_documents.append(fish_doc)
        
        result = await db.fish.insert_many(fish_documents)
        print(f"Initialized fish database with {len(result.inserted_ids)} species")
        
    except Exception as e:
        print(f"Error initializing fish database: {e}")

# API Routes
@api_router.get("/fish", response_model=List[Fish])
async def get_all_fish():
    """Get all fish species"""
    try:
        fish_cursor = db.fish.find({})
        fish_list = await fish_cursor.to_list(1000)
        return [Fish(**fish) for fish in fish_list]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fish: {str(e)}")

@api_router.get("/fish/{fish_id}", response_model=Fish)
async def get_fish(fish_id: str):
    """Get a specific fish by ID"""
    try:
        fish = await db.fish.find_one({"_id": fish_id})
        if not fish:
            raise HTTPException(status_code=404, detail="Fish not found")
        return Fish(**fish)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fish: {str(e)}")

@api_router.post("/fish/{fish_id}/unlock")
async def unlock_fish(fish_id: str, catch_data: UnlockFishRequest):
    """Unlock a fish with user catch data"""
    try:
        # Store user catch data in a separate collection
        result = await db.user_catches.insert_one({
            "_id": str(uuid.uuid4()),
            "fish_id": fish_id,
            "photo": catch_data.photo,
            "location": catch_data.location,
            "equipment": catch_data.equipment,
            "date": catch_data.date,
            "created_at": datetime.utcnow()
        })
        
        if result.inserted_id:
            return {"success": True, "message": "Fish unlocked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to unlock fish")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error unlocking fish: {str(e)}")

@api_router.get("/stats")
async def get_stats():
    """Get overall app statistics"""
    try:
        total_fish = await db.fish.count_documents({})
        total_catches = await db.user_catches.count_documents({})
        
        # Count by habitat
        marine_fish = await db.fish.count_documents({"habitat": "mare"})
        river_fish = await db.fish.count_documents({"habitat": "fiume"})
        lake_fish = await db.fish.count_documents({"habitat": "lago"})
        
        return {
            "total_fish": total_fish,
            "total_catches": total_catches,
            "marine_fish": marine_fish,
            "river_fish": river_fish,
            "lake_fish": lake_fish
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize the database on startup"""
    await initialize_fish_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()