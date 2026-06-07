from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    purchases,
    sales,
    buyers,
    expenses,
    product_types,
    analytics,
)

app = FastAPI(
    title="Kastbhanjan Playwood Management System",
    description="API for wooden scrap trading business management",
    version="1.0.0",
)

# CORS
# In production the API is served same-origin under /api on Vercel, so CORS is
# not strictly required there. It is kept for local development (Vite dev server
# on :5173 calling the API on :8000). Auth is a Bearer token in the
# Authorization header (not cookies), so we use a wildcard origin WITHOUT
# credentials, which is a valid CORS combination (wildcard + credentials is not).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(purchases.router)
app.include_router(sales.router)
app.include_router(buyers.router)
app.include_router(expenses.router)
app.include_router(product_types.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {
        "message": "Kastbhanjan Playwood Management System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
