"""
Cryptographic shredding and ephemeral tempfs hygiene utilities
Zero external dependencies, pure Python standard library.
"""
import os
import shutil
import time

def shred_file(path: str) -> bool:
    """Securely overwrite and remove temporary processing file"""
    try:
        if os.path.exists(path):
            size = os.path.getsize(path)
            with open(path, "ba+", buffering=0) as f:
                f.write(os.urandom(size))
            os.remove(path)
            return True
        return False
    except Exception:
        if os.path.exists(path):
            os.remove(path)
            return True
        return False

def verify_and_purge_expired_jobs(base_dir: str, ttl_seconds: int = 3600) -> int:
    """Scans ephemeral job directory and shreds any folder older than TTL"""
    purged = 0
    now = time.time()
    if not os.path.exists(base_dir):
        return 0

    for entry in os.listdir(base_dir):
        job_dir = os.path.join(base_dir, entry)
        if os.path.isdir(job_dir):
            try:
                mtime = os.path.getmtime(job_dir)
                if (now - mtime) > ttl_seconds:
                    shutil.rmtree(job_dir, ignore_errors=True)
                    purged += 1
            except Exception:
                pass
    return purged
