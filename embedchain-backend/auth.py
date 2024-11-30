from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from os import environ as env

security = HTTPBearer()

async def get_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != env.get("AUTH_TOKEN"):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return credentials.credentials

