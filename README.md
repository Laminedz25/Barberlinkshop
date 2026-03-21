# BarberLink 💈
BarberLink is a premium, AI-powered platform designed to connect barbers and customers across Algeria and globally.

## 🚀 Key Features
- **Intelligent Booking**: Support for multi-service selection and specific barber assignment.
- **Geo-Contextual UI**: Automatic currency and language adaptation (DZD/AR for Algeria, USD/EN for international).
- **AI Automation**: Integrated support agents, financial reports, and content creation tools.
- **Modern 3D Interface**: Powered by `framer-motion` for a world-class user experience.

## 🛡️ Security & Zero-Leak Policy
We follow strict **Zero-Hardcode** principles:
- **GitHub Secrets**: All API tokens (Hostinger, BillionMail, Firebase) and SSH keys are encrypted in GitHub Actions.
- **Authentication**: Google-powered auth with secure Firestore rules.
- **Service Accounts**: Firebase admin keys are injected during CI/CD from encrypted secrets.

## 📦 Automated Deployment
Deployment is fully automated via GitHub Actions on every push to `main`:
1. **GitHub PAT Authentication**: Fixes server-side pull freezes.
2. **Containerization**: Docker Compose builds the latest version on your Hostinger VPS.
3. **Traefik SSL**: Automated HTTPS via Let's Encrypt.

## 🛠️ Local Development
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Fill in your local development keys.
4. Run `npm install` and `npm run dev`.

---
*Powered by Antigravity AI Deployment Suite*
