from pathlib import Path
import os

from dotenv import load_dotenv

# ==========================================================
# Environment Variables
# ==========================================================

load_dotenv()

# ==========================================================
# Project Information
# ==========================================================

APP_NAME = "AI Tourism Recommendation System"
APP_VERSION = "1.0.0"

# ==========================================================
# Project Root
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ==========================================================
# API Keys
# ==========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY not found in .env file."
    )


SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

# ==========================================================
# Dataset Directories
# ==========================================================

RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

# ==========================================================
# ChromaDB
# ==========================================================

CHROMA_DB_DIR = PROJECT_ROOT / "chroma_db"
CHROMA_DB_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

COLLECTION_NAME = "tourism_knowledge"

# ==========================================================
# Embedding Model
# ==========================================================

EMBEDDING_MODEL = "BAAI/bge-m3"
EMBEDDING_DEVICE = "cpu"
EMBEDDING_BATCH_SIZE = 64

# ==========================================================
# Text Chunking
# ==========================================================

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# ==========================================================
# Retrieval Configuration
# ==========================================================

RETRIEVAL_TOP_K = 20
FINAL_TOP_K = 10
TOP_K_RESULTS = 20

# ==========================================================
# Recommendation
# ==========================================================

MAX_ATTRACTIONS_PER_DAY = 4
MAX_RESTAURANTS_PER_DAY = 2
MAX_DOCUMENTS_FOR_PROMPT = 12

MIN_RECOMMENDATION_SCORE = 5

# ==========================================================
# Default Values
# ==========================================================

DEFAULT_CITY = "varanasi"
DEFAULT_LANGUAGE = "English"

# ==========================================================
# LLM Configuration
# ==========================================================

LLM_MODEL = "llama-3.3-70b-versatile"
LLM_TEMPERATURE = 0.3
LLM_MAX_TOKENS = 2048

# ==========================================================
# Supported Languages
# ==========================================================

SUPPORTED_LANGUAGES = [
    "English",
    "Hindi",
    "Hinglish",
]

# ==========================================================
# Debug
# ==========================================================

DEBUG = os.getenv("DEBUG", "False").lower() == "true"