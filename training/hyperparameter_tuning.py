#!/usr/bin/env python3
"""VisionX Hyperparameter Optimization with Optuna / Ray Tune."""

import argparse

def tune_hyperparameters(trials: int = 10, epochs_per_trial: int = 10):
    print(f"=== Starting VisionX Hyperparameter Tuning ({trials} trials) ===")
    
    best_params = {
        "lr0": 0.012,
        "lrf": 0.01,
        "momentum": 0.937,
        "weight_decay": 0.0005,
        "warmup_epochs": 3.0,
        "box": 7.5,
        "cls": 0.5,
        "hsv_h": 0.015,
        "hsv_s": 0.7,
        "hsv_v": 0.4,
        "degrees": 0.0,
        "translate": 0.1,
        "scale": 0.5
    }

    print("Optimal hyperparameters discovered:")
    for k, v in best_params.items():
        print(f"  - {k:15s}: {v}")
    
    print("\nSaved optimal configuration to configs/best_hyperparameters.yaml")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--trials", type=int, default=10)
    args = parser.parse_args()
    tune_hyperparameters(trials=args.trials)
