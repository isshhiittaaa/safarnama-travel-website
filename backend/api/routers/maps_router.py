from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os


router = APIRouter()

ALLOWED_BASE_DIR = os.path.abspath("data/images/city_maps")


@router.get("/{filename}")
def get_map_image(filename: str):
    """
    Serves a map image by filename. The filename should match
    the last path segment of an image_path returned by /chat/query
    (e.g. "overview-p2-img1.png").
    """

    file_path = os.path.abspath(
        os.path.join(ALLOWED_BASE_DIR, filename)
    )

    # Security: prevent path traversal outside the maps directory
    if not file_path.startswith(ALLOWED_BASE_DIR):
        raise HTTPException(status_code=400, detail="Invalid filename.")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Map image not found.")

    return FileResponse(file_path)