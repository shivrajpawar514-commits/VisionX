#!/usr/bin/env python3
"""Generate sample synthetic video output frame or verify stream rendering."""

import os
import sys
import cv2

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.video.synthetic_stream import SyntheticStreamGenerator

def main():
    print("Generating demo stream frame...")
    gen = SyntheticStreamGenerator("cam-main-gate", width=1280, height=720, fps=25)
    os.makedirs("data/samples", exist_ok=True)

    for i in range(10):
        frame = gen.read_frame()

    out_path = "data/samples/demo_frame.jpg"
    cv2.imwrite(out_path, frame)
    print(f"Sample frame saved to: {out_path} ({frame.shape[1]}x{frame.shape[0]})")

if __name__ == "__main__":
    main()
