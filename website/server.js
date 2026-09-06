// Standalone Node.js / Express Server Example for MediProof
// Provides the POST /api/n8n-callback endpoint requested for n8n automation

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory store for received n8n fact-check responses
const receivedFactChecks = [];

/**
 * POST /api/n8n-callback
 * Receives incoming verified health claim output from n8n HTTP Request node
 */
app.post(['/api/n8n-callback', '/n8n-callback'], (req, res) => {
  const claimId = req.body.claim_id || req.body.claimId || req.body.id || null;
  const aiResponse = req.body.response !== undefined ? req.body.response : (req.body.text || req.body);

  console.log('\n========================================');
  console.log('⚡ [MediProof Server] Received AI Output from n8n:');
  if (claimId) console.log(`📌 Claim ID: ${claimId}`);
  console.log(typeof aiResponse === 'object' ? JSON.stringify(aiResponse, null, 2) : aiResponse);
  console.log('========================================\n');

  // Parse strict n8n format: [VERDICT], [EXPLANATION], [SOURCES]
  const rawText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

  let verdict = 'Verified';
  if (/\[VERDICT\]:\s*True/i.test(rawText)) verdict = 'True';
  else if (/\[VERDICT\]:\s*False/i.test(rawText)) verdict = 'False';
  else if (/\[VERDICT\]:\s*Misleading/i.test(rawText)) verdict = 'Misleading';
  else if (/\[VERDICT\]:\s*Unverified/i.test(rawText)) verdict = 'Unverified';

  const expMatch = rawText.match(/\[EXPLANATION\]:\s*([\s\S]*?)(?=\[SOURCE|\n\n\[|$)/i);
  const explanation = expMatch ? expMatch[1].trim() : rawText;

  const record = {
    id: claimId || ('N8N-' + Math.floor(1000 + Math.random() * 9000)),
    claim_id: claimId,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    verdict,
    explanation,
    rawText,
    payload: req.body,
    receivedAt: Date.now()
  };

  receivedFactChecks.unshift(record);
  if (receivedFactChecks.length > 50) receivedFactChecks.pop();

  // Send success response back to n8n
  res.status(200).json({
    status: 'Success',
    message: 'Received AI Output from n8n',
    claim_id: claimId,
    receivedId: record.id,
    verdict: record.verdict
  });
});

/**
 * GET /api/n8n-latest
 * Query the latest received n8n fact-check results
 */
app.get('/api/n8n-latest', (req, res) => {
  res.json({
    count: receivedFactChecks.length,
    latest: receivedFactChecks[0] || null,
    items: receivedFactChecks
  });
});

/**
 * POST /api/forward-to-n8n
 * Server-side proxy for n8n webhooks to bypass browser CORS & ngrok warnings
 */
app.post('/api/forward-to-n8n', async (req, res) => {
  try {
    const { targetUrl, payload } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, message: 'Missing targetUrl parameter' });
    }

    const n8nRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(payload)
    });

    const resText = await n8nRes.text();
    let parsedRes = null;
    try { parsedRes = JSON.parse(resText); } catch (e) { parsedRes = resText; }

    if (!n8nRes.ok) {
      return res.status(200).json({
        ok: false,
        status: n8nRes.status,
        statusText: n8nRes.statusText,
        message: (parsedRes && parsedRes.message) || resText || `HTTP ${n8nRes.status}`,
        hint: (parsedRes && parsedRes.hint) || null,
        targetUrl,
        isTestUrl: targetUrl.includes('/webhook-test/'),
        isProductionUrl: targetUrl.includes('/webhook/') && !targetUrl.includes('/webhook-test/')
      });
    }

    res.status(200).json({
      ok: true,
      status: n8nRes.status,
      data: parsedRes,
      raw: resText
    });
  } catch (proxyErr) {
    res.status(200).json({
      ok: false,
      status: 502,
      message: proxyErr.message,
      hint: 'Could not reach your ngrok tunnel. Please verify that your ngrok tunnel is online.'
    });
  }
});

/**
 * POST /api/test-n8n-connection
 * Quick health check on n8n Webhook URL
 */
app.post('/api/test-n8n-connection', async (req, res) => {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, message: 'Missing targetUrl parameter' });
    }

    const n8nRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify({ ping: true, test: true })
    });

    const resText = await n8nRes.text();
    let parsedRes = null;
    try { parsedRes = JSON.parse(resText); } catch (e) { parsedRes = resText; }

    res.status(200).json({
      ok: n8nRes.ok,
      status: n8nRes.status,
      message: (parsedRes && parsedRes.message) || (n8nRes.ok ? 'Connection successful!' : resText),
      hint: (parsedRes && parsedRes.hint) || null,
      isTestUrl: targetUrl.includes('/webhook-test/'),
      isProductionUrl: targetUrl.includes('/webhook/') && !targetUrl.includes('/webhook-test/')
    });
  } catch (err) {
    res.status(200).json({
      ok: false,
      status: 502,
      message: err.message,
      hint: 'Could not connect to ngrok tunnel.'
    });
  }
});

/**
 * POST /api/upload-image
 * Uploads image, saves locally, and generates full public CDN URL for n8n
 */
app.post('/api/upload-image', async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ ok: false, message: 'Missing image data' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/png';
    const rawBase64 = matches ? matches[2] : image;
    const buffer = Buffer.from(rawBase64, 'base64');

    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('png')) ext = 'png';

    const cleanName = (filename || 'scan').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${cleanName}_${Date.now()}.${ext}`;

    const uploadsDir = path.resolve('public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    let publicUrl = null;
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', new Blob([buffer], { type: mimeType }), uniqueName);

      const cdnRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      if (cdnRes.ok) {
        const cdnText = await cdnRes.text();
        if (cdnText && cdnText.startsWith('http')) {
          publicUrl = cdnText.trim();
        }
      }
    } catch (cdnErr) {
      console.warn('[MediProof] Public CDN upload error, using local URL:', cdnErr.message);
    }

    const host = req.headers.host || `localhost:${PORT}`;
    const localUrl = `http://${host}/uploads/${uniqueName}`;
    if (!publicUrl) {
      publicUrl = localUrl;
    }

    res.status(200).json({
      ok: true,
      imageUrl: publicUrl,
      localUrl,
      filename: uniqueName
    });
  } catch (uploadErr) {
    res.status(500).json({ ok: false, message: uploadErr.message });
  }
});

/**
 * POST /api/upload-audio
 * Uploads voice notes / audio files, saves locally, and generates full accessible URL for n8n
 */
app.post('/api/upload-audio', async (req, res) => {
  try {
    const { audio, filename, duration, mimeType: clientMime } = req.body;
    if (!audio) {
      return res.status(400).json({ ok: false, message: 'Missing audio data' });
    }

    const matches = audio.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : (clientMime || 'audio/wav');
    const rawBase64 = matches ? matches[2] : audio;
    const buffer = Buffer.from(rawBase64, 'base64');

    let ext = 'wav';
    if (mimeType.includes('mpeg') || mimeType.includes('mp3')) ext = 'mp3';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('webm')) ext = 'webm';
    else if (mimeType.includes('mp4') || mimeType.includes('m4a') || mimeType.includes('aac')) ext = 'm4a';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('flac')) ext = 'flac';
    else if (filename && filename.includes('.')) {
      ext = filename.split('.').pop().toLowerCase();
    }

    const cleanName = (filename || 'voice_recording').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${cleanName}_${Date.now()}.${ext}`;

    const uploadsDir = path.resolve('public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    let publicUrl = null;
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', new Blob([buffer], { type: mimeType }), uniqueName);

      const cdnRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      if (cdnRes.ok) {
        const cdnText = await cdnRes.text();
        if (cdnText && cdnText.startsWith('http')) {
          publicUrl = cdnText.trim();
        }
      }
    } catch (cdnErr) {
      console.warn('[MediProof] Audio CDN upload error, using local/docker URL:', cdnErr.message);
    }

    const host = req.headers.host || `localhost:${PORT}`;
    const localUrl = `http://${host}/uploads/${uniqueName}`;
    const dockerUrl = `http://host.docker.internal:${PORT}/uploads/${uniqueName}`;
    const primaryAudioUrl = publicUrl || dockerUrl;

    res.status(200).json({
      ok: true,
      audioUrl: primaryAudioUrl,
      publicUrl,
      dockerUrl,
      localUrl,
      filename: uniqueName,
      duration: duration || null
    });
  } catch (uploadErr) {
    res.status(500).json({ ok: false, message: uploadErr.message });
  }
});

/**
 * POST /api/translate
 * Translates health fact-check verdicts & explanations into user-selected language
 */
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'en' } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ ok: false, message: 'Missing text or targetLang' });
    }

    if (targetLang === 'en' || targetLang === sourceLang) {
      return res.status(200).json({ ok: true, translatedText: text, targetLang });
    }

    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
    let chunks = [];
    let currentChunk = '';
    for (const s of sentences) {
      if ((currentChunk + s).length > 450) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = s;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + s;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
      try {
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}`;
        const tRes = await fetch(apiUrl);
        const data = await tRes.json();
        return (data && data.responseData && data.responseData.translatedText) || chunk;
      } catch (e) {
        return chunk;
      }
    }));

    res.status(200).json({
      ok: true,
      translatedText: translatedChunks.join(' '),
      targetLang
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

if (process.env.NODE_ENV !== 'test' && !process.env.VITE) {
  app.listen(PORT, () => {
    console.log(`MediProof API Server running at http://localhost:${PORT}`);
    console.log(`Endpoint ready: POST http://localhost:${PORT}/api/n8n-callback`);
  });
}

export default app;
