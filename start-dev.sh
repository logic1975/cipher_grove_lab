#!/bin/bash

# Cipher Grove Lab - Development Startup Script
# This script ensures reliable startup of all development services

echo "🎵 Starting Cipher Grove Lab Development Environment..."

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use by PID $pid. Killing it...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if eval $check_command >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo -e "\n${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Step 1: Check prerequisites
echo -e "\n${BLUE}1️⃣  Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Step 2: Clean up any existing processes
echo -e "\n${BLUE}2️⃣  Cleaning up existing processes...${NC}"

# Kill processes on known ports
kill_port 3000  # Backend
kill_port 5173  # Frontend
kill_port 5432  # PostgreSQL (if running outside Docker)

# Step 3: Start PostgreSQL database
echo -e "\n${BLUE}3️⃣  Starting PostgreSQL database...${NC}"

cd backend || exit 1

# Stop any existing containers
docker compose down >/dev/null 2>&1 || true

# Start fresh
docker compose up -d postgres

# Wait for database to be ready
wait_for_service "PostgreSQL" "docker exec music_label_postgres pg_isready -U postgres"

# Step 4: Setup backend environment
echo -e "\n${BLUE}4️⃣  Setting up backend environment...${NC}"

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please update it with your settings if needed.${NC}"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Run database migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"
npm run db:generate >/dev/null 2>&1 || true
npm run db:migrate

# Seed database (only if no data exists)
echo -e "${BLUE}🌱 Checking database seed...${NC}"
npm run db:seed 2>/dev/null || echo -e "${YELLOW}ℹ️  Database already has data${NC}"

# Step 5: Start backend server
echo -e "\n${BLUE}5️⃣  Starting backend server...${NC}"

# Start backend in background
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
wait_for_service "Backend API" "curl -s http://localhost:3000/health"

# Step 6: Setup and start frontend
echo -e "\n${BLUE}6️⃣  Starting frontend server...${NC}"

cd ../frontend || exit 1

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
wait_for_service "Frontend" "curl -s http://localhost:5173"

# Step 7: Success!
echo -e "\n${GREEN}🎉 All services are running!${NC}"
echo -e "\n${BLUE}📍 Access points:${NC}"
echo -e "   Frontend:  ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:   ${GREEN}http://localhost:3000${NC}"
echo -e "   Database:  ${GREEN}postgresql://localhost:5432/music_label_dev${NC}"
echo -e "\n${BLUE}📝 Logs:${NC}"
echo -e "   Backend:   tail -f backend.log"
echo -e "   Frontend:  tail -f frontend.log"
echo -e "   Database:  npm run db:logs (in backend/)"
echo -e "\n${YELLOW}💡 To stop all services, press Ctrl+C${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"
    
    # Kill backend and frontend processes
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Stop database
    cd backend 2>/dev/null && docker compose down
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup INT TERM

# Keep script running and show logs
echo -e "\n${BLUE}📊 Showing combined logs (Ctrl+C to stop all services):${NC}\n"

# Tail both log files
tail -f backend.log frontend.log 2>/dev/null