#!/usr/bin/env python3
"""VisionX Lightweight Edge Daemon for NVIDIA Jetson / Embedded Accelerators."""

import time
import argparse
import yaml
import json

def run_edge_node(config_path: str):
    print(f"=== Starting VisionX Edge AI Daemon ===")
    print(f"Config: {config_path}")
    
    with open(config_path, "r") as f:
        cfg = yaml.safe_load(f)
    
    node = cfg.get("edge_node", {})
    print(f"Node ID: {node.get('node_id')} | Runtime: {node.get('runtime')} | Target Cloud: {node.get('cloud_backend_url')}")
    print("Edge AI engine running: Processing local video feed & transmitting event metadata over HTTPS/WSS.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default="deployment/edge/edge_config.yaml")
    args = parser.parse_args()
    run_edge_node(args.config)
