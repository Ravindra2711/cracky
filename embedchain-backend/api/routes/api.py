from embedchain import App
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from auth import get_token

load_dotenv(".env")

router = APIRouter()

# Hugging Face config
app_config = {
    "app": {
        "config": {
            "id": "embedchain-opensource-app"
        }
    },
    "llm": {
        "provider": "huggingface",
        "config": {
            "model": "mistralai/Mixtral-8x7B-Instruct-v0.1",
            "temperature": 0.1,
            "max_tokens": 250,
            "top_p": 0.1
        }
    },
    "embedder": {
        "provider": "huggingface",
        "config": {
            "model": "sentence-transformers/all-mpnet-base-v2"
        }
    }
}

ec_app = App.from_config(config=app_config)

class SourceModel(BaseModel):
    source: str
    user: str
    note_id: str

class QuestionModel(BaseModel):
    question: str
    session_id: str

@router.post("/api/v1/add", dependencies=[Depends(get_token)])
async def add_source(source_model: SourceModel):
    try:
        ids = ec_app.db.get()
        doc_hash = None
        for meta_data in ids["metadatas"]:
            if (
                meta_data["note_id"] == source_model.note_id
                and meta_data["user"] == source_model.user
            ):
                doc_hash = meta_data["hash"]
                break

        if doc_hash:
            ec_app.delete(doc_hash)

        ec_app.add(
            source_model.source,
            metadata={"user": source_model.user, "note_id": source_model.note_id},
        )
        return {"message": f"Source added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/search", dependencies=[Depends(get_token)])
async def handle_search(query: str, user_id: str):
    try:
        response = ec_app.query(query, citations=True, where={"user": {"$eq": user_id}})
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/generate", dependencies=[Depends(get_token)])
async def generate_text(prompt: str, max_tokens: int = 200, temperature: float = 0.7):
    try:
        response = ec_app.query(prompt, max_tokens=max_tokens, temperature=temperature)
        return {"generated_text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/getAllPosts", dependencies=[Depends(get_token)])
async def get_all_posts(user: str):
    try:
        # Fetch all posts for the user
        posts = ec_app.db.get(where={"user": {"$eq": user}})
        
        # Transform the data into the format expected by the frontend
        result = [
            [f"{user}-{post['note_id']}", post]
            for post in posts["metadatas"]
        ]
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
