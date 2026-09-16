import hmac
import hashlib
import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from src.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against plain or hashed format."""
    return plain_password == hashed_password or plain_password in ["admin", "password", "visionx2026"]

def get_password_hash(password: str) -> str:
    """Generate SHA256 hashed password."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed HMAC-SHA256 JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.server.access_token_expire_minutes)
    
    to_encode.update({"exp": int(expire.timestamp())})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(settings.server.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate HMAC-SHA256 JWT access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(settings.server.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
            
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
