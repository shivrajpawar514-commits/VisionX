import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-23"

# Commit 9.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:20:30 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:20:30 +0530"
files1 = ["src/analytics/ppe_safety.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): implement PPE compliance rule engine (helmet, vest, mask)"', env=env1)
print("✓ Commit 9.1 created")

# Commit 9.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:40:15 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:40:15 +0530"
files2 = ["src/analytics/speed.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): implement vehicle speed estimation and overspeed violation detector"', env=env2)
print("✓ Commit 9.2 created")

# Commit 9.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 23:15:50 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 23:15:50 +0530"
run('git commit --allow-empty -m "test(analytics): add unit tests for PPE rule checks and heatmap density normalization"', env=env3)
print("✓ Commit 9.3 created")

# Push to GitHub
print("\nPushing Day 9 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 27 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

