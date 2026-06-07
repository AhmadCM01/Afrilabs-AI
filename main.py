import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Add the project root to the python path so we can import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.rag_chain import query_rag_chain

app = FastAPI(
    title="AfriLabs AI API",
    description="Backend API for the AfriLabs AI knowledge assistant",
    version="1.0.0"
)

# Configure CORS so the Next.js frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain (e.g., "http://localhost:3000")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response Pydantic models
class ChatRequest(BaseModel):
    query: str

class SourceModel(BaseModel):
    page_content: str
    source_url: str
    doc_type: str
    title: str
    country: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceModel]

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Endpoint to handle chat queries and return RAG-powered answers with sources.
    """
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Call the existing LangChain RAG pipeline
        result = query_rag_chain(request.query)
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "AfriLabs AI API"}