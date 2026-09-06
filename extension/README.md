# 🛡️ MediProof — Browser Extension (Manifest V3)

> **Real-Time AI Health Fact-Checking & Disinformation Guard (SDG 3)**  
> Cross-examine medical claims, social posts, YouTube health videos, WhatsApp voice memos, and supplement bottles directly on any webpage against WHO, CDC, FDA, and MOH clinical registries.

---

## 🚀 Features

1. **📝 Highlight & Verify Text Claims**:
   - Highlight any sentence or claim on Twitter/X, Reddit, Wikipedia, or Facebook.
   - A floating **`[🛡️ Verify with MediProof]`** pill appears automatically above your selection.
   - Or right-click any highlighted claim & select **`🛡️ Verify claim with MediProof`**.
   - An in-page sliding dock opens with instant clinical synthesis, verdict tag (`TRUE`, `FALSE`, `MISLEADING`), confidence score, and clickable authority source citations.

2. **🎥 1-Click YouTube Video Fact-Checking**:
   - When watching any health or medical video on `youtube.com/watch`, a branded **`🛡️ MediProof Fact-Check`** button is injected directly into YouTube's action bar next to Like / Share.
   - 1-click grabs the video title and URL and launches the verification engine.

3. **📷 Supplement Label & Image Scanner**:
   - Right-click any product photo or supplement bottle on Amazon, Shopee, or Instagram -> **`🔍 Scan supplement / label with MediProof`**.
   - Or upload/drop images into the extension popup to check MOH NPRA registration and deceptive ingredient claims.

4. **🎙️ WhatsApp Web & Voice Memo Fact-Checking**:
   - Open the popup, tap the live microphone to record incoming voice memos or paste audio URLs to analyze spoken health claims.

5. **⚡ Direct n8n Engine Connection**:
   - Communicates directly with your live n8n workflow (`https://rosy-subside-selected.ngrok-free.dev/webhook/6e567f04-b2ce-4b29-a284-2e8b1bbf94e3`).
   - Built-in `ngrok-skip-browser-warning` bypass and async callback listener (`http://localhost:3000/api/n8n-latest`).

---

## 📦 How to Install (Load Unpacked in Chrome / Brave / Edge)

1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
2. Toggle **Developer mode** on (top-right corner).
3. Click the **"Load unpacked"** button (top-left).
4. Select this folder:
   ```
   /Users/virocchan/Mediproof Extension
   ```
5. The **MediProof — AI Health Fact-Checker** extension will appear in your extensions list! Pin it to your toolbar for 1-click access.

---

## 🧪 Testing the Extension

### Test 1: In-Page Text Highlight
1. Open any article or social media page (e.g. Wikipedia or Twitter).
2. Highlight a medical statement (e.g. *"Cashew nuts cause blood clots"*).
3. Click the floating **`[Verify with MediProof]`** button or right-click -> **`🛡️ Verify claim with MediProof`**.
4. Watch the floating dock slide in from the right with the verified verdict and WHO/MOH citations.

### Test 2: In-Page YouTube Fact-Check
1. Open any YouTube video (e.g. `https://www.youtube.com/watch?v=d_k82X19k9a`).
2. Notice the **`🛡️ MediProof Fact-Check`** button in the video controls bar.
3. Click it to immediately analyze the video.

### Test 3: 4-Modality Popup Studio
1. Click the MediProof icon in your browser toolbar.
2. Try the preset buttons under **Text** (Cashews, Colloidal Silver, Dietary Fiber).
3. Click **"Verify Claim with MediProof"**.
4. Click the gear icon (⚙️) to view or test your live n8n webhook connection.

---

## 🗂️ Extension File Architecture

```
Mediproof Extension/
├── manifest.json         # Manifest V3 configuration & permissions
├── background.js         # Service Worker: context menus & n8n API dispatcher
├── content.js            # In-page highlight tooltip & sliding verdict dock
├── content.css           # In-page styling & YouTube button styles
├── popup.html            # 4-modality popup interface (Text, YouTube, Voice, Photo)
├── popup.css             # Extension styling & brand design system
├── popup.js              # Popup controller logic & media handling
├── icons/                # High-res 16, 32, 48, 128px MediProof icons
└── README.md             # Documentation
```
