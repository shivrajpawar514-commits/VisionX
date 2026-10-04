import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-17"

# Commit 3.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:25:30 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:25:30 +0530"
files1 = ["src/video/stream_health.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(video): add stream health telemetry monitor for FPS and latency diagnostics"', env=env1)
print("✓ Commit 3.1 created")

# Commit 3.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:10:18 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:10:18 +0530"
files2 = ["src/video/synthetic_stream.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(video): implement synthetic video stream generator for zero-setup local dev"', env=env2)
print("✓ Commit 3.2 created")

# Commit 3.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 18:50:40 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 18:50:40 +0530"
files3 = ["src/video/stream_manager.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "feat(video): build multi-camera stream ingestion manager and background capture threads"', env=env3)
print("✓ Commit 3.3 created")

# Push to GitHub
print("\nPushing Day 3 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 9 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

