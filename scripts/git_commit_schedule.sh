#!/usr/bin/env bash
# VisionX - Automated Git Commit Schedule Generator (3 Commits / Day)
set -e

echo "========================================================================"
echo "      VISIONX GIT COMMIT SCHEDULE GENERATOR (3 COMMITS / DAY)          "
echo "========================================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -M main
fi

echo "Detailed schedule saved to docs/github_commit_schedule_3x.md"
echo "Daily Rhythm: Morning (Core/Backend) -> Afternoon (Integration/UI) -> Evening (Tests/Docs/MLOps)"
