import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from backend.api.tips.tips_db import (
    create_tip,
    get_tips_for_place,
    get_user_tips,
    delete_tip,
)
from backend.api.auth.auth_router import get_current_user


router = APIRouter()

UPLOAD_DIR = "data/tips_photos"


@router.post("/")
def submit_tip(
    place_name: str = Form(...),
    rating: int = Form(...),
    tip_text: str = Form(...),
    photo: UploadFile = File(default=None),
    current_user: dict = Depends(get_current_user),
):
    if not (1 <= rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")

    photo_path = None

    if photo is not None:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        saved_filename = f"{uuid.uuid4()}{ext}"
        photo_path = os.path.join(UPLOAD_DIR, saved_filename)

        with open(photo_path, "wb") as f:
            f.write(photo.file.read())

    tip_id = create_tip(
        user_id=current_user["user_id"],
        username=current_user["username"],
        place_name=place_name,
        rating=rating,
        tip_text=tip_text,
        photo_path=photo_path,
    )

    return {"status": "submitted", "tip_id": tip_id}


# Public — no login required, so any visitor can browse tips before signing up
@router.get("/place/{place_name}")
def tips_for_place(place_name: str):
    return {"place_name": place_name, "tips": get_tips_for_place(place_name)}


@router.get("/my")
def my_tips(current_user: dict = Depends(get_current_user)):
    return {"tips": get_user_tips(current_user["user_id"])}


@router.delete("/{tip_id}")
def remove_tip(
    tip_id: int,
    current_user: dict = Depends(get_current_user),
):
    deleted = delete_tip(tip_id, current_user["user_id"])

    if not deleted:
        raise HTTPException(status_code=404, detail="Tip not found or not yours.")

    return {"status": "removed", "tip_id": tip_id}