#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# BarberLink VPS Deployment Script
# Run this on a fresh Ubuntu 22.04 VPS as root
# Usage: chmod +x deploy.sh && ./deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

REPO_URL="https://github.com/Laminedz25/Barberlinkshop.git"
APP_DIR="/opt/barberlinkshop"
DOMAIN="barberlink.cloud"
MAIL_DOMAIN="mail.barberlink.cloud"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║      BarberLink VPS Deployment Script        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: System Update ──────────────────────────────────
echo "📦 Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ── Step 2: Install Docker ────────────────────────────────
echo "🐳 Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# ── Step 3: Install Docker Compose ───────────────────────
echo "⚙️  Installing Docker Compose..."
if ! command -v docker-compose &>/dev/null; then
    apt-get install -y docker-compose-plugin
fi

# ── Step 4: Clone Repository ──────────────────────────────
echo "📥 Cloning BarberLink repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" && git pull
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ── Step 5: Build & Launch App ───────────────────────────
echo "🚀 Building and launching BarberLink..."
cd "$APP_DIR"
docker compose up -d --build

echo ""
echo "✅ BarberLink is running!"
echo "   Frontend: https://${DOMAIN}"
echo ""

# ── Step 6: Install BillionMail ──────────────────────────
echo "📧 Installing BillionMail on port 8080..."
if [ ! -d "/opt/BillionMail" ]; then
    cd /opt && git clone https://github.com/Billionmail/BillionMail && cd BillionMail && bash install.sh
else
    echo "   BillionMail already installed at /opt/BillionMail"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              Deployment Complete! 🎉                 ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  BarberLink App: https://${DOMAIN}          ║"
echo "║  BillionMail:    http://YOUR_VPS_IP:8080            ║"
echo "║                                                      ║"
echo "║  Next Steps:                                         ║"
echo "║  1. Point ${DOMAIN} DNS → this VPS IP      ║"
echo "║  2. Point ${MAIL_DOMAIN} DNS → this VPS IP    ║"
echo "║  3. Configure BillionMail with your domain           ║"
echo "║  4. Add BillionMail API key in BarberLink Admin      ║"
echo "║     → Admin Dashboard → API Keys → BillionMail      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
