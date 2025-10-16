"""
FastAPI main application
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.exceptions import AIVideoException
from app.api.v1 import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI Video Generation API for AIVideo.DIY",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware - Allow all origins in development
# IMPORTANT: Must be added BEFORE any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://localhost:8000",  # For Swagger UI
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],  # For SSE headers
    max_age=3600,  # Cache preflight requests for 1 hour
)


# Exception handlers
@app.exception_handler(AIVideoException)
async def aivideo_exception_handler(request: Request, exc: AIVideoException):
    """Handle custom AIVideo exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    if settings.DEBUG:
        # In debug mode, return detailed error
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "error": str(exc),
                "type": type(exc).__name__,
            },
        )
    else:
        # In production, return generic error
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "AIVideo.DIY API",
        "version": "1.0.0",
        "docs": "/docs",
        "api": settings.API_V1_PREFIX,
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup"""
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"🚀 {settings.APP_NAME} starting...")
    print(f"📝 Debug mode: {settings.DEBUG}")
    print(f"📚 API docs: http://localhost:8000/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown"""
    print(f"👋 {settings.APP_NAME} shutting down...")
