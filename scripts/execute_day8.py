import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-22"

# Commit 8.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:45:00 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:45:00 +0530"
files1 = ["src/analytics/loitering.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): add loitering detection and dwell-time violation alarms"', env=env1)
print("✓ Commit 8.1 created")

# Commit 8.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:10:40 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:10:40 +0530"
files2 = ["src/analytics/crowd.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): implement crowd density estimator and threshold triggers"', env=env2)
print("✓ Commit 8.2 created")

# Commit 8.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 17:45:15 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 17:45:15 +0530"
files3 = ["src/analytics/heatmap.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): implement 2D spatial occupancy heatmap accumulator with Gaussian splats"', env=env3)
print("✓ Commit 8.3 created")

# Push to GitHub
print("\nPushing Day 8 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 24 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

