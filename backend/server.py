from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routes.ai_insights import router as ai_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Smart Day Assistant Backend")

# CORS Configuration - Allow frontend domains
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "https://smartdayapp.vercel.app"),
]

# Add support for all Vercel preview URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "LangChain AI Backend is running"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Smart Day Assistant API",
        "version": "2.0.0",
        "framework": "FastAPI + LangChain Python"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    print(f"🚀 LangChain AI Backend running on http://localhost:{port}")
    print(f"📊 Health check: http://localhost:{port}/health")
    uvicorn.run(app, host="0.0.0.0", port=port)
