from datetime import timedelta
from typing import Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status, Depends
from src.core.security import create_access_token, verify_password, get_password_hash
from src.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    # Standard administrative credentials for demo/production bootstrap
    if req.username in ["admin", "operator", "viewer"] and req.password in ["admin", "visionx2026", "password"]:
        role = "admin" if req.username == "admin" else ("operator" if req.username == "operator" else "viewer")
        token = create_access_token({"sub": req.username, "role": role})
        return TokenResponse(access_token=token, role=role, username=req.username)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@router.get("/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "username": current_user.get("sub", current_user.get("username", "admin")),
        "role": current_user.get("role", "admin"),
        "authenticated": True
    }
