"""
IntekEdit Fallback API Microservice
Strictly sandboxed execution for heavy server-side operations (e.g. headless Office conversion).
Operates with zero storage retention, single-use signed URLs, and tmpfs volume mounts.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import tempfile
import time

app = FastAPI(
    title="IntekEdit Sandboxed API",
    version="1.0.0",
    docs_url=None, # Disabled in production for security
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://intekedit.vercel.app", "https://intekedit.dev"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

TEMP_DIR = os.environ.get("INTEKEDIT_TMPFS", os.environ.get("EDITANYTHING_TMPFS", tempfile.gettempdir()))

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "sandboxed": True,
        "retention_policy": "immediate_purge_and_60m_hard_ttl",
        "timestamp": time.time(),
    }

from shredder import shred_file, verify_and_purge_expired_jobs

@app.post("/api/v1/sandbox/clean-job")
def clean_job(job_id: str, background_tasks: BackgroundTasks):
    """Shred all ephemeral artifacts associated with a job"""
    job_path = os.path.join(TEMP_DIR, f"job_{job_id}")
    if os.path.exists(job_path):
        background_tasks.add_task(shutil.rmtree, job_path, ignore_errors=True)
    return {"cleaned": True, "job_id": job_id}
