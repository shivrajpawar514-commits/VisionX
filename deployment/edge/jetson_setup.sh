#!/usr/bin/env bash
# VisionX NVIDIA Jetson & Edge AI Setup Script
set -e

echo "=== Setting up VisionX on NVIDIA Jetson Edge Device ==="

# Set Jetson Power Mode to MAX performance
if command -v nvpmodel &> /dev/null; then
    echo "Configuring Jetson MAXN Performance Mode..."
    sudo nvpmodel -m 0
    sudo jetson_clocks
fi

# Install dependencies
sudo apt-get update
sudo apt-get install -y python3-pip python3-opencv libopenblas-base libopenmpi-dev

# Install PyTorch & TensorRT bindings for JetPack
pip3 install --upgrade pip
pip3 install -r requirements.txt

echo "=== VisionX Edge Environment Ready ==="
echo "Run: python3 deployment/edge/edge_daemon.py --config deployment/edge/edge_config.yaml"
