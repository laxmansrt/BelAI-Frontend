# 🌾 BelAI – AI-Powered Farming Assistant

> **Empowering Indian farmers with AI — even on JioPhones.**

BelAI is an intelligent agricultural advisory platform built for **Bharat**. It brings real-time crop disease detection, AI-powered farming advice, voice assistance, and WhatsApp integration — all accessible even on low-end feature phones.

---

## 🚀 Features

- 🤖 **AI Crop Doctor** – Upload a photo of your crop and get instant disease diagnosis with organic remedies
- 🎙️ **Voice Assistant** – Talk to BelAI in your local language
- 📱 **Lite Mode** – Works on JioPhones and KaiOS feature phones
- 💬 **WhatsApp Bot** – Get farming advice directly on WhatsApp
- 🗺️ **Live Truck Tracking** – Real-time map for order delivery
- 🔐 **Google OAuth** – Secure login
- 📦 **PWA Ready** – Install on mobile like a native app
- 🌐 **Full Responsive** – Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| AI/ML | Google Gemini API |
| Maps | Leaflet.js |
| Auth | Google OAuth 2.0 |
| Voice | Web Speech API + Twilio |
| WhatsApp | Twilio WhatsApp API |
| Hosting | Vercel + Nginx |
| PWA | Service Workers + Web App Manifest |

---

## 📁 Project Structure

```
BelAI/
├── index.html          # Main application (full-featured)
├── lite.html           # Lite mode for JioPhone/KaiOS
├── style.css           # Global styles
├── belai-features.js   # Core feature modules
├── service-worker.js   # PWA offline support
├── manifest.json       # PWA manifest
├── manifest.webapp     # KaiOS manifest
├── nginx.conf          # Nginx config for deployment
├── Dockerfile          # Docker container setup
└── icons/              # App icons (all sizes)
```

---

## 🏃 Running Locally

```bash
# Clone the repo
git clone https://github.com/laxmansrt/sjcit-hack.git
cd sjcit-hack

# Serve locally (Python)
python3 -m http.server 3000

# Open in browser
# http://localhost:3000
```

---

## 🌍 Live Demo

🔗 **[bel-ai.vercel.app](https://bel-ai.vercel.app)**

---

## 👨‍🌾 Target Users

- Small & marginal farmers across India
- Users with JioPhones / feature phones
- Rural communities with low-bandwidth connectivity

---

## 🏆 Hackathon Submission

**Event:** SJCIT Hackathon 2026  
**Team:** BelAI Team  
**Category:** AgriTech / AI for Social Good

---

## 📄 License

MIT License © 2026 BelAI Team

