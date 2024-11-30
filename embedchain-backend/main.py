import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from os import environ as env
from dotenv import load_dotenv

from api.routes import admin, api

load_dotenv()

app = FastAPI(title="Embedchain API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api.router)
app.include_router(admin.router)

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

@app.middleware("http")
async def token_check_middleware(request: Request, call_next):
    token = request.headers.get("Authorization")
    expected_token = env.get("AUTH_TOKEN")

    if request.url.path.startswith("/api/v1"):
        if not token:
            raise HTTPException(status_code=401, detail="No token provided")
        elif token != f"Bearer {expected_token}":
            raise HTTPException(status_code=401, detail="Invalid token")
    
    response = await call_next(request)
    return response

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True,
        timeout_keep_alive=600,
    )
