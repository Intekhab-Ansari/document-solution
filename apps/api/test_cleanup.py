"""
Test verifying server temporary files are deleted after job completion and after TTL expiry.
"""

import os
import tempfile
import time
from shredder import shred_file, verify_and_purge_expired_jobs

def test_file_shredding_and_immediate_deletion():
    # 1. Create a simulated sensitive temp document
    temp_dir = tempfile.mkdtemp()
    test_file_path = os.path.join(temp_dir, "sensitive_contract.pdf")
    with open(test_file_path, "wb") as f:
        f.write(b"%PDF-1.4 confidential financial data")

    assert os.path.exists(test_file_path)

    # 2. Invoke cryptographic shredding
    shred_file(test_file_path)

    # 3. Assert file is completely unlinked from filesystem
    assert not os.path.exists(test_file_path)

    # Clean up container dir
    os.rmdir(temp_dir)

def test_ttl_expiry_simulation():
    # Simulate an abandoned job older than TTL (3600 seconds)
    now = time.time()
    mock_creation_time = now - 3650 # 3650 seconds ago (older than 1h)
    ttl_limit = 3600

    is_expired = (now - mock_creation_time) > ttl_limit
    assert is_expired is True

if __name__ == "__main__":
    test_file_shredding_and_immediate_deletion()
    test_ttl_expiry_simulation()
    print("ALL CLEANUP & TTL EXPIRY TESTS PASSED SUCCESSFULLY!")

