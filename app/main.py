from fastapi import FastAPI

app = FastAPI(
    title="Smart Business Performance Analyzer",
    description="SaaS-based application for business insights",
    version="1.0"
)

@app.get("/")
def root():
    return {
        "message": "Smart Business Performance Analyzer backend is running"
    }
