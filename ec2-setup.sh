#!/bin/bash
# ==============================================================================
# AWS EC2 One-Click Setup Script
# Cloud-Based Real Estate Analysis — AI Property Intelligence Platform
# ==============================================================================
set -e

echo "========================================================"
echo "🚀 Starting EC2 Environment Setup for Real Estate AI..."
echo "========================================================"

# 1. Update system packages
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# 2. Setup 3GB Swap Memory (prevents out-of-memory during ML Docker build on t2.micro/t3.small)
if [ ! -f /swapfile ]; then
    echo "⚙️ Creating 3GB Swapfile for memory safety..."
    sudo fallocate -l 3G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap memory enabled successfully."
fi

# 3. Install official Docker Engine & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine & Compose..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
fi

# 4. Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

echo "========================================================"
echo "🎉 EC2 Environment Ready!"
echo "To build & launch the application, run:"
echo "   sudo docker compose up -d --build"
echo "========================================================"
