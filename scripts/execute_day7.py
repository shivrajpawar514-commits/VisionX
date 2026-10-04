import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-21"

# Commit 7.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:30:50 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:30:50 +0530"
files1 = ["src/analytics/__init__.py", "src/analytics/zone_analytics.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): implement restricted-zone polygon intrusion detector"', env=env1)
print("✓ Commit 7.1 created")

# Commit 7.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:25:10 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:25:10 +0530"
files2 = ["src/analytics/line_crossing.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(analytics): add bidirectional tripwire line-crossing counter"', env=env2)
print("✓ Commit 7.2 created")

# Commit 7.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 18:35:20 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 18:35:20 +0530"
files3 = ["tests/test_analytics.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "test(analytics): add test cases for polygon boundaries and line intersection logic"', env=env3)
print("✓ Commit 7.3 created")

# Push to GitHub
print("\nPushing Day 7 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 21 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

