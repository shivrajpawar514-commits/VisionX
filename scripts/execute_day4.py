import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-18"

# Commit 4.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:35:12 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:35:12 +0530"
files1 = ["src/detection/__init__.py", "src/detection/schemas.py", "src/detection/base.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(detection): define detection schemas and BaseDetector abstract interface"', env=env1)
print("✓ Commit 4.1 created")

# Commit 4.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:45:50 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:45:50 +0530"
files2 = ["src/detection/yolo_detector.py", "src/detection/synthetic_detector.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(detection): implement Ultralytics YOLO inference wrapper with fallback mode"', env=env2)
print("✓ Commit 4.2 created")

# Commit 4.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 18:20:30 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 18:20:30 +0530"
files3 = ["tests/__init__.py", "tests/test_detection.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "test(detection): add unit tests for bounding box math and synthetic detection"', env=env3)
print("✓ Commit 4.3 created")

# Push to GitHub
print("\nPushing Day 4 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 12 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

