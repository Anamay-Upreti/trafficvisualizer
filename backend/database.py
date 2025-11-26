from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

summary_col = db["summary"]
packets_col = db["packets"]


# pagination (optimization)
try:

    summary_col.create_index([("filename", ASCENDING)], unique=True)
    packets_col.create_index([("filename", ASCENDING)])
    packets_col.create_index([("filename", ASCENDING), ("number", ASCENDING)])
    
    print("Database indexes configured.")
except Exception as e:
    print(f"Warning creating indexes: {e}")

def save_summary(summary: dict):
    summary_col.update_one(
        {"filename": summary["filename"]}, 
        {"$set": summary}, 
        upsert=True
    )

def get_summary(filename: str):
    return summary_col.find_one({"filename": filename}, {"_id": 0})