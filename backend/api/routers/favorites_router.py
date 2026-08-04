from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.api.favorites.favorites_db import (
    add_favorite,
    get_user_favorites,
    remove_favorite,
)
from backend.api.auth.auth_router import get_current_user


router = APIRouter()


class FavoriteRequest(BaseModel):
    place_name: str
    category: str = "attractions"


@router.post("/")
def create_favorite(
    request: FavoriteRequest,
    current_user: dict = Depends(get_current_user),
):
    favorite_id = add_favorite(
        user_id=current_user["user_id"],
        place_name=request.place_name,
        category=request.category,
    )

    if favorite_id is None:
        raise HTTPException(status_code=409, detail="Already in favorites.")

    return {"status": "added", "favorite_id": favorite_id}


@router.get("/")
def list_favorites(current_user: dict = Depends(get_current_user)):
    return {"favorites": get_user_favorites(current_user["user_id"])}


@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: int,
    current_user: dict = Depends(get_current_user),
):
    deleted = remove_favorite(favorite_id, current_user["user_id"])

    if not deleted:
        raise HTTPException(status_code=404, detail="Favorite not found.")

    return {"status": "removed", "favorite_id": favorite_id}