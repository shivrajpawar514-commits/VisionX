.PHONY: help install-python install-frontend install dev-backend dev-frontend run-backend run-frontend docker-up docker-down test benchmark train export-onnx lint clean

help:
	@echo "VisionX - Real-Time Video Analytics Platform"
	@echo "Commands:"
	@echo "  make install         Install backend and frontend dependencies"
	@echo "  make run-backend     Start FastAPI backend server"
	@echo "  make run-frontend    Start React Vite dashboard"
	@echo "  make dev             Start full development environment"
	@echo "  make docker-up       Start all services using Docker Compose"
	@echo "  make docker-down     Stop all Docker Compose services"
	@echo "  make test            Run backend test suite"
	@echo "  make benchmark       Run model optimization benchmarks"
	@echo "  make train           Run YOLO model training pipeline"
	@echo "  make export-onnx     Export PyTorch YOLO models to ONNX"
	@echo "  make seed            Seed database with mock cameras and events"

install-python:
	pip install -r requirements.txt

install-frontend:
	npm install

install: install-python install-frontend

run-backend:
	uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	npm run dev

seed:
	python scripts/seed_database.py

test:
	pytest tests/ -v

benchmark:
	python scripts/run_benchmarks.py

train:
	python training/train.py --config configs/config.yaml

export-onnx:
	python training/export.py --format onnx --weights yolov8n.pt

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down

lint:
	npm run lint
	python -m flake8 src/ tests/ training/ || true

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf dist build *.egg-info .pytest_cache
