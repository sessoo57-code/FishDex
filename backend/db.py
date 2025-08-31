import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()  # carica le variabili dal .env

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

print("✅ MongoDB connesso!")
