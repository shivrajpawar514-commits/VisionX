# VisionX Production Deployment Guide

## 1. Docker Compose Deployment (Recommended for Local / Server)

Run the full stack (FastAPI Backend, React Console, PostgreSQL, Redis, Prometheus, Grafana) with a single command:

```bash
docker-compose up --build -d
```

### Port Mapping:
- **VisionX Dashboard**: `http://localhost:3000` (or `http://localhost:5173` in local dev)
- **FastAPI Backend**: `http://localhost:8000`
- **Swagger API Docs**: `http://localhost:8000/docs`
- **Prometheus Metrics**: `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3001` (login: `admin` / `admin`)

---

## 2. Kubernetes Deployment

Apply the manifests located in `deployment/k8s/`:

```bash
kubectl apply -f deployment/k8s/configmap.yaml
kubectl apply -f deployment/k8s/deployment.yaml
kubectl apply -f deployment/k8s/service.yaml
kubectl apply -f deployment/k8s/ingress.yaml
```

---

## 3. NVIDIA Jetson & Edge AI Deployment

For running at the edge (Jetson Orin / Xavier):

1. Execute the edge setup script:
```bash
bash deployment/edge/jetson_setup.sh
```
2. Convert your YOLO model to TensorRT INT8:
```bash
python3 training/export.py --format engine --weights yolov8s.pt --int8
```
3. Start the lightweight edge daemon:
```bash
python3 deployment/edge/edge_daemon.py --config deployment/edge/edge_config.yaml
```
