from fastapi import FastAPI

from backend.api.auth.auth_db import init_db
from backend.api.auth.auth_router import router as auth_router
from backend.api.routers.chat_router import router as chat_router
from backend.api.routers.maps_router import router as maps_router
from backend.api.routers.explore_router import router as explore_router
from backend.api.routers.admin_router import router as admin_router
from backend.api.routers.health_router import router as health_router
from backend.api.stats import get_analytics
from backend.api.routers.voice_router import router as voice_router
from backend.api.reports.reports_db import init_reports_db
from backend.api.routers.reports_router import router as reports_router
from backend.api.favorites.favorites_db import init_favorites_db
from backend.api.routers.favorites_router import router as favorites_router
from backend.api.tips.tips_db import init_tips_db
from backend.api.routers.tips_router import router as tips_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="AI Tourism Recommendation & Itinerary Planner",
    description="API for personalized tourism recommendations and itinerary planning",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
init_reports_db()
init_favorites_db()
init_tips_db()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(maps_router, prefix="/maps", tags=["Maps"])
app.include_router(explore_router, prefix="/explore", tags=["Explore"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(health_router, prefix="/health", tags=["Health"])
app.include_router(voice_router, prefix="/voice", tags=["Voice"])
app.include_router(reports_router, prefix="/reports", tags=["Civic Reports"])
app.include_router(favorites_router, prefix="/favorites", tags=["Favorites"])
app.include_router(tips_router, prefix="/tips", tags=["Local Tips"])


# ==========================================================
# Root / Health
# ==========================================================

# @app.get("/")
# def root():
#     return {"status": "AI Tourism Planner API is running"}


# ==========================================================
# ADMIN / IT TEAM ENDPOINT — dashboard data
# ==========================================================

# @app.get("/admin/stats")
# def admin_stats():
#     return get_analytics()