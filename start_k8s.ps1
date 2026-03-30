# Script to Start Kubernetes Cluster
Write-Host "Clearing MINIKUBE_HOME since drives are merged..." -ForegroundColor Cyan
[Environment]::SetEnvironmentVariable("MINIKUBE_HOME", $null, "User")
$env:MINIKUBE_HOME=""

$minikubeExe = "C:\Program Files\Kubernetes\Minikube\minikube.exe"

# Check if Docker is running
Write-Host "Checking if Docker Desktop is running..." -ForegroundColor Cyan
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "ERROR: DOCKER DESKTOP IS NOT RUNNING!" -ForegroundColor Red
    Write-Host "Please open Windows Start Menu, search for Docker Desktop," -ForegroundColor Yellow
    Write-Host "and open it. Wait a few seconds for it to start, then" -ForegroundColor Yellow
    Write-Host "run this script again." -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Red
    exit
}

Write-Host "Docker is running! Cleaning up broken VirtualBox profiles..." -ForegroundColor Cyan
& $minikubeExe delete

Write-Host "Starting Minikube safely using Docker..." -ForegroundColor Cyan
& $minikubeExe start --driver=docker

# Stop script if Minikube failed to start
if ($LASTEXITCODE -ne 0) {
    Write-Host "Minikube failed to start. Check the errors above." -ForegroundColor Red
    exit
}

Write-Host "Syncing Docker daemon to Minikube..." -ForegroundColor Cyan
& $minikubeExe docker-env | Invoke-Expression

Write-Host "Building Backend Image inside Minikube..." -ForegroundColor Cyan
docker build -t nox-backend:latest ./backend

Write-Host "Building Frontend Image inside Minikube..." -ForegroundColor Cyan
docker build -t nox-frontend:latest ./frontend

Write-Host "Applying Kubernetes manifests in k8s/ directory..." -ForegroundColor Cyan
kubectl apply -f k8s/

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Cluster spun up successfully! Run 'kubectl get pods' to check status." -ForegroundColor Green
Write-Host "Remember to run 'kubectl port-forward svc/backend 5000:5000'" -ForegroundColor Yellow
Write-Host "and 'kubectl port-forward svc/frontend 3000:80' in separate terminals." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
