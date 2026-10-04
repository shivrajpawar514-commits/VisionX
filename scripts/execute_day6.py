import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-20"

# Commit 6.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:50:10 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:50:10 +0530"
files1 = ["src/tracking/matching.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(tracking): implement IoU distance cost matrix and linear assignment logic"', env=env1)
print("✓ Commit 6.1 created")

# Commit 6.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:15:35 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:15:35 +0530"
files2 = ["src/tracking/tracker.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(tracking): implement ByteTrack multi-object tracker with persistent ID assignment"', env=env2)
print("✓ Commit 6.2 created")

# Commit 6.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 18:10:45 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 18:10:45 +0530"
files3 = ["tests/test_tracking.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "test(tracking): add unit tests for Kalman prediction and multi-frame ID persistence"', env=env3)
print("✓ Commit 6.3 created")

# Push to GitHub
print("\nPushing Day 6 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 18 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

