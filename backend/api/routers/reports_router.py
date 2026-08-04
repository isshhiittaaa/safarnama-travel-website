import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException

from backend.api.reports.reports_db import (
    create_report,
    get_user_reports,
    get_all_reports,
    update_report_status,
)
from backend.api.auth.auth_router import get_current_user, get_current_admin


router = APIRouter()

UPLOAD_DIR = "data/reports_photos"

VALID_CATEGORIES = [
    "garbage", "road", "water", "electricity",
    "safety", "sanitation", "other",
]


# ==========================================================
# POST /reports — user submits an issue with a photo
# ==========================================================

@router.post("/")
def submit_report(
    category: str = Form(...),
    description: str = Form(""),
    location_hint: str = Form(""),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):

    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(photo.filename)[1] or ".jpg"
    saved_filename = f"{uuid.uuid4()}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(saved_path, "wb") as f:
        f.write(photo.file.read())

    report_id = create_report(
        user_id=current_user["user_id"],
        category=category,
        description=description,
        photo_path=saved_path,
        location_hint=location_hint,
    )

    return {
        "status": "submitted",
        "report_id": report_id,
        "message": "Thank you — your report has been submitted for review.",
    }


# ==========================================================
# GET /reports/my — user's own submitted reports
# ==========================================================

@router.get("/my")
def my_reports(current_user: dict = Depends(get_current_user)):

    return {"reports": get_user_reports(current_user["user_id"])}


# ==========================================================
# GET /reports/all — admin sees every report
# ==========================================================

@router.get("/all")
def all_reports(current_admin: dict = Depends(get_current_admin)):

    return {"reports": get_all_reports()}


# ==========================================================
# PATCH /reports/{report_id}/status — admin updates status
# ==========================================================

@router.patch("/{report_id}/status")
def change_status(
    report_id: int,
    status: str = Form(...),
    current_admin: dict = Depends(get_current_admin),
):

    if status not in ("pending", "reviewed", "resolved"):
        raise HTTPException(
            status_code=400,
            detail="Status must be pending, reviewed, or resolved.",
        )

    updated = update_report_status(report_id, status)

    if not updated:
        raise HTTPException(status_code=404, detail="Report not found.")

    return {"status": "updated", "report_id": report_id, "new_status": status}