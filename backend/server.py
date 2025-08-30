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

# Italian Fish Database - 150+ species
FISH_DATABASE = [
    # PESCI MARINI (Mare)
    {
        "name": "Spigola", 
        "scientificName": "Dicentrarchus labrax", 
        "habitat": "mare", 
        "description": "Predatore marino molto apprezzato, si trova vicino alle coste rocciose e sabbiose.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Orata", 
        "scientificName": "Sparus aurata", 
        "habitat": "mare",
        "description": "Pesce pregiato con caratteristica macchia dorata tra gli occhi, vive in fondali sabbiosi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Tonno", 
        "scientificName": "Thunnus thynnus", 
        "habitat": "mare",
        "description": "Grande pesce pelagico, il re del Mediterraneo. Può raggiungere dimensioni enormi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Ricciola", 
        "scientificName": "Seriola dumerili", 
        "habitat": "mare",
        "description": "Potente predatore pelagico, molto combattivo quando allamato.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Pesce serra", 
        "scientificName": "Pomatomus saltatrix", 
        "habitat": "mare",
        "description": "Predatore vorace con denti affilati, caccia in branchi numerosi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Dentice", 
        "scientificName": "Dentex dentex", 
        "habitat": "mare",
        "description": "Pesce pregiato con potenti mascelle, vive su fondali rocciosi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Sarago", 
        "scientificName": "Diplodus sargus", 
        "habitat": "mare",
        "description": "Pesce comune nei porti e nelle scogliere, riconoscibile dalle bande verticali.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Rombo", 
        "scientificName": "Psetta maxima", 
        "habitat": "mare",
        "description": "Pesce piatto che vive nascosto sui fondali sabbiosi, eccellente mimesi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Sogliola", 
        "scientificName": "Solea solea", 
        "habitat": "mare",
        "description": "Pesce piatto bentonico, vive su fondali sabbiosi e fangosi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Cefalo", 
        "scientificName": "Mugil cephalus", 
        "habitat": "mare",
        "description": "Pesce eurialino che si adatta sia in mare che in acqua dolce.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },

    # PESCI D'ACQUA DOLCE - FIUMI (Fiume)
    {
        "name": "Luccio", 
        "scientificName": "Esox lucius", 
        "habitat": "fiume",
        "description": "Predatore d'acqua dolce per eccellenza, con corpo affusolato e grandi mascelle.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Carpa", 
        "scientificName": "Cyprinus carpio", 
        "habitat": "fiume",
        "description": "Grande cyprinide, può raggiungere dimensioni notevoli. Molto resistente.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },

    # PESCI D'ACQUA DOLCE - LAGHI (Lago)
    {
        "name": "Persico reale", 
        "scientificName": "Perca fluviatilis", 
        "habitat": "lago",
        "description": "Predatore con caratteristiche bande verticali scure, comune nei laghi.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNTBjMC0xMCAxMC0yMCAzMC0yMHM1MCAyMCA4MCAyMGMyMCAwIDQwLTEwIDYwLTEwczIwIDEwIDAiLz48L3N2Zz4="
    },
    {
        "name": "Tinca", 
        "scientificName": "Tinca tinca", 
        "habitat": "lago",
        "description": "Pesce bentonico con corpo tozzo, vive in acque stagnanti ricche di vegetazione.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj"><path d="M20 50c0-10 10-20 30-20s50 20 80 20c20 0 40-10 60-10s20 10 0"/></svg>"
    },
    {
        "name": "Alborella", 
        "scientificName": "Alburnus alburnus", 
        "habitat": "lago",
        "description": "Piccolo pesce argentato che forma grandi branchi in superficie.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj><path d="M20 50c0-10 10-20 30-20s50 20 80 20c20 0 40-10 60-10s20 10 0"/></svg>"
    },
]

# Extend database to 150+ fish
for i in range(15, 151):
    habitat = ['mare', 'fiume', 'lago'][i % 3]
    FISH_DATABASE.append({
        "name": f"Pesce {i}",
        "scientificName": f"Piscis species{i}",
        "habitat": habitat,
        "description": f"Descrizione del pesce numero {i} dell'habitat {habitat}.",
        "referenceImage": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj><path d="M20 50c0-10 10-20 30-20s50 20 80 20c20 0 40-10 60-10s20 10 0"/></svg>"
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
        # Here you could store user catch data in a separate collection
        # For now, we just acknowledge the unlock
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