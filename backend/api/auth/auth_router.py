from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from backend.api.auth.auth_db import (
    get_user_by_email,
    get_user_by_username,
    create_user,
)
from backend.api.auth.auth_service import (
    verify_password,
    create_access_token,
    decode_access_token,
)


router = APIRouter()

security_scheme = HTTPBearer()


# ==========================================================
# Request / Response Schemas
# ==========================================================

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    is_admin: bool


# ==========================================================
# Register
# ==========================================================

@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest):

    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=400,
            detail="This username is already taken.",
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long.",
        )

    create_user(
        username=request.username,
        email=request.email,
        password=request.password,
    )

    user = get_user_by_email(request.email)

    token = create_access_token({
        "user_id": user["id"],
        "username": user["username"],
        "is_admin": bool(user["is_admin"]),
    })

    return TokenResponse(
        access_token=token,
        username=user["username"],
        is_admin=bool(user["is_admin"]),
    )


# ==========================================================
# Login
# ==========================================================

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):

    user = get_user_by_email(request.email)

    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    token = create_access_token({
        "user_id": user["id"],
        "username": user["username"],
        "is_admin": bool(user["is_admin"]),
    })

    return TokenResponse(
        access_token=token,
        username=user["username"],
        is_admin=bool(user["is_admin"]),
    )


# ==========================================================
# Dependency — used by other routers to protect endpoints
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    Validates the JWT from the Authorization header.
    Use as a FastAPI dependency on any endpoint that requires login:

        @router.post("/query")
        def query(request: QueryRequest, user: dict = Depends(get_current_user)):
            ...
    """

    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token. Please log in again.",
        )

    return payload


def get_current_admin(
    user: dict = Depends(get_current_user),
) -> dict:
    """
    Same as get_current_user, but also requires is_admin=True.
    Use on admin-only endpoints.
    """

    if not user.get("is_admin"):
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )

    return user


