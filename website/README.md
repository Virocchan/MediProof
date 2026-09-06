# MediProof — Web Application

> **Real-time AI Health Misinformation Fact-Checking Platform**  
> Multimodal verification powered by n8n RAG workflows, Google Gemini 2.5 Flash, and authoritative clinical knowledge bases (WHO, CDC, PubMed, NIH).

---

## 🌟 Key Features

- **Multimodal Claim Input**:
  - 📝 **Text Claims**: Instant factual verification of viral health claims.
  - 🎙️ **Voice Notes & Audio**: Live mic recording or audio file upload (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.aac`) with built-in audio player and automatic link dispatch.
  - 🖼️ **Medical Image & Infographic Scan**: Upload health posters and infographics with interactive claim region bounding boxes.
- **RAG & Agentic Fact-Checking**:
  - Live webhook integration with n8n workflow engine.
  - Clinical cross-referencing with WHO, CDC, FDA, Cochrane Library, and PubMed.
- **Verdict & Evidence Synthesis**:
  - Color-coded veracity verdict (`Verified True`, `False / Disproven`, `Misleading`, `Unverified`).
  - Evidence breakdown, confidence scoring, and clickable clinical citations.
- **Multilingual Translation**:
  - Instant one-click translation of verified verdicts into 9 languages (Malay, Chinese, Tamil, Indonesian, Spanish, Arabic, Hindi, French, English).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Development
From the repository root or inside `website/`:

```bash
# Run local development server
npm run dev

# Open in browser
http://localhost:3000/
```

### Build for Production
```bash
npm run build
npm run preview
```

### Standalone Server
```bash
npm run server
```
