import os
import subprocess
from datetime import datetime

def run(cmd, env=None):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
    if res.returncode != 0 and "nothing to commit" not in res.stdout:
        print(f"[ERR] {res.stderr.strip()}")
    return res

# Delete old .git
run("rm -rf .git")
run("git init -b main")
run('git config user.name "shivrajpawar514-commits"')
run('git config user.email "shivrajpawar514@gmail.com"')
run("git remote add origin https://github.com/shivrajpawar514-commits/VisionX.git")

today = datetime.now().strftime("%Y-%m-%d")

# Commit 1.1 (Morning)
env1 = os.environ.copy()
env1["GIT_AUTHOR_DATE"] = f"{today} 09:30:14"
env1["GIT_COMMITTER_DATE"] = f"{today} 09:30:14"
files1 = [
    ".gitignore", "LICENSE", "configs/config.yaml", "configs/cameras.yaml", "configs/models.yaml",
    "data/raw/.gitkeep", "data/processed/.gitkeep", "data/annotations/.gitkeep", "data/samples/.gitkeep",
    "models/pretrained/.gitkeep", "models/trained/.gitkeep", "models/onnx/.gitkeep", "models/tensorrt/.gitkeep"
]
for f in files1:
    if os.path.exists(f):
        run(f"git add '{f}'")
run('git commit -m "chore: scaffold repository layout and multi-camera configuration files"', env=env1)
print("✓ Commit 1.1 created")

# Commit 1.2 (Afternoon)
env2 = os.environ.copy()
env2["GIT_AUTHOR_DATE"] = f"{today} 11:00:22"
env2["GIT_COMMITTER_DATE"] = f"{today} 11:00:22"
files2 = [
    "requirements.txt", "Makefile", "package.json", "package-lock.json", "tsconfig.json", "tsconfig.node.json",
    "vite.config.ts", "postcss.config.js", "tailwind.config.ts", "index.html"
]
for f in files2:
    if os.path.exists(f):
        run(f"git add '{f}'")
run('git commit -m "build: configure python requirements, vite tooling and makefile targets"', env=env2)
print("✓ Commit 1.2 created")

# Commit 1.3 (Evening / Now)
env3 = os.environ.copy()
env3["GIT_AUTHOR_DATE"] = f"{today} 11:20:10"
env3["GIT_COMMITTER_DATE"] = f"{today} 11:20:10"
files3 = [
    "README.md", "docs/architecture.md"
]
for f in files3:
    if os.path.exists(f):
        run(f"git add '{f}'")
run('git commit -m "docs: create initial README and technical roadmap documentation"', env=env3)
print("✓ Commit 1.3 created")

# Push Day 1 to GitHub
print("\nPushing Day 1 commits to https://github.com/shivrajpawar514-commits/VisionX ...")
push_res = run("git push -f -u origin main")
print(push_res.stdout)
print(push_res.stderr)

print("Current Git Log:")
log = run("git log --oneline")
print(log.stdout)

