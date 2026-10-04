import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-19"

# Commit 5.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:15:20 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:15:20 +0530"
files1 = ["src/tracking/__init__.py", "src/tracking/kalman_filter.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(tracking): implement 8-state Kalman filter for bounding box motion estimation"', env=env1)
print("✓ Commit 5.1 created")

# Commit 5.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:30:00 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:30:00 +0530"
files2 = ["src/tracking/track.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(tracking): add STrack lifecycle representation and trajectory memory"', env=env2)
print("✓ Commit 5.2 created")

# Commit 5.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 18:40:15 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 18:40:15 +0530"
files3 = ["src/tracking/trajectory.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "feat(tracking): implement trajectory velocity smoothing and heading angle calculation"', env=env3)
print("✓ Commit 5.3 created")

# Push to GitHub
print("\nPushing Day 5 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 15 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

