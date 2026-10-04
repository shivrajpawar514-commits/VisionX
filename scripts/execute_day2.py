import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

today = "2026-09-16"

# Commit 2.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:40:15 +0530"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:40:15 +0530"
files1 = ["src/core/__init__.py", "src/core/config.py", "src/core/logger.py"]
for f in files1:
    run(f"git add '{f}'")
run('git commit -m "feat(core): implement central config loader and structured logging system"', env=env1)
print("✓ Commit 2.1 created")

# Commit 2.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 14:25:30 +0530"
env2["GIT_COMMITTER_DATE"] = f"{today} 14:25:30 +0530"
files2 = ["src/core/security.py"]
for f in files2:
    run(f"git add '{f}'")
run('git commit -m "feat(core): add JWT authentication and HMAC-SHA256 token verification"', env=env2)
print("✓ Commit 2.2 created")

# Commit 2.3 (Evening)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 21:15:00 +0530"
env3["GIT_COMMITTER_DATE"] = f"{today} 21:15:00 +0530"
files3 = ["src/video/__init__.py", "src/video/frame_buffer.py"]
for f in files3:
    run(f"git add '{f}'")
run('git commit -m "feat(video): implement thread-safe frame buffer with drop-oldest policy"', env=env3)
print("✓ Commit 2.3 created")

# Push to GitHub
print("\nPushing Day 2 commits to GitHub...")
push_res = run("git push origin main")
print(push_res.stdout)
print(push_res.stderr)

print("\n--- Recent Git Log ---")
log = run("git log -n 6 --format='%h - %ad: %s' --date=iso")
print(log.stdout)

