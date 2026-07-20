#!/bin/bash
# MemeForge-AI Deployment Script
# Target IP: 217.154.145.215

echo "Starting Deployment for MemeForge-AI..."

# 1. Pull latest code (Requires git setup on server)
# git pull origin main

# 2. Build and restart containers
docker-compose up -d --build

# 3. Apply database migrations
docker-compose exec backend npx prisma db push

echo "Deployment finished! 🚀"
