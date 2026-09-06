# MediProof

<div align="center">
  <h3>AI-Powered Multimodal Health Misinformation Fact-Checking Ecosystem</h3>
  <p>Verifying health claims across text, audio, and images using Retrieval-Augmented Generation (RAG) and authoritative medical research.</p>
</div>

---

## 📁 Repository Structure

This repository is organized into distinct, modular components so each product within the MediProof ecosystem remains independent and cleanly separated:

```text
Mediproof/
├── website/          # 🌐 Full-featured Web Application (Vite, Vanilla JS/CSS, n8n RAG, Translation)
├── extension/        # 🧩 Chrome Browser Extension (Manifest V3 for in-context web fact-checking)
├── chatbot/          # 🤖 MediProof Conversational Assistant (Chatbot & messaging integration)
├── package.json      # Workspace orchestration scripts
└── README.md         # Master repository documentation
```

---

## 🌐 Components Overview

### 1. [Website (`website/`)](./website)
The flagship MediProof web platform providing:
- **Multimodal Verification**: Submit text, record/upload voice notes (`.mp3`, `.wav`, `.m4a`), or scan health infographics.
- **RAG Fact-Checking Pipeline**: Live webhook connectivity to n8n + Google Gemini 2.5 Flash.
- **Clinical Sources**: Authoritative citations from WHO, CDC, PubMed, NIH, and Cochrane Library.
- **Multilingual Support**: Instant output translation into Malay, Chinese, Tamil, Indonesian, Spanish, Arabic, Hindi, French, and English.

**Quick Start:**
```bash
npm run dev
# Server starts at http://localhost:3000
```

### 2. [Browser Extension (`extension/`)](./extension)
Chrome Extension (Manifest V3) bringing MediProof's verification directly into any webpage:
- Highlight text on medical blogs, social media (TikTok, X, Facebook) or WhatsApp Web to fact-check in 1 click.
- Floating quick-action badge and side panel results.

### 3. [Chatbot (`chatbot/`)](./chatbot)
Conversational AI agent for checking health claims over messaging platforms and direct chat interfaces.

---

## 🛠️ Development & Orchestration

From the project root:

```bash
# Start website in development mode
npm run dev

# Build website bundle
npm run build

# Run standalone backend callback server
npm run server
```

---

## 🔒 License
Private / Proprietary — MediProof Project
