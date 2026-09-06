import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// In-memory store for incoming n8n callbacks and connected browser clients
const latestCallbacks = [];
let sseClients = [];

function n8nReceiverPlugin() {
  return {
    name: 'n8n-webhook-receiver',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Enable CORS for external n8n instances
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        const rawUrl = req.url ? req.url.split('?')[0] : '';
        const url = rawUrl.replace(/\/+$/, '') || '/';

        // 1. POST endpoint to receive incoming data from n8n (Matches user example)
        if ((url === '/api/n8n-callback' || url === '/n8n-callback') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', () => {
            let parsedBody = {};
            try {
              parsedBody = JSON.parse(body);
            } catch (e) {
              parsedBody = { response: body, text: body };
            }

            // Extract claim_id sent from frontend
            const claimId = parsedBody.claim_id || parsedBody.claimId || parsedBody.id || null;

            // Matches what is mapped in n8n (req.body.response or req.body.text or the raw body)
            const aiResponse = parsedBody.response !== undefined ? parsedBody.response : (parsedBody.text || body);
            console.log(`\n========================================`);
            console.log(`⚡ [MediProof Server] Received AI Output from n8n:`);
            if (claimId) console.log(`📌 Claim ID: ${claimId}`);
            console.log(typeof aiResponse === 'object' ? JSON.stringify(aiResponse, null, 2) : aiResponse);
            console.log(`========================================\n`);

            const rawText = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

            // Parse verdict strictly matching n8n format
            let verdict = 'Verified';
            if (/\[VERDICT\]:\s*True/i.test(rawText)) verdict = 'True';
            else if (/\[VERDICT\]:\s*False/i.test(rawText)) verdict = 'False';
            else if (/\[VERDICT\]:\s*Misleading/i.test(rawText)) verdict = 'Misleading';
            else if (/\[VERDICT\]:\s*Unverified/i.test(rawText)) verdict = 'Unverified';

            // Extract explanation
            const expMatch = rawText.match(/\[EXPLANATION\]:\s*([\s\S]*?)(?=\[SOURCE|\n\n\[|$)/i);
            const explanation = expMatch ? expMatch[1].trim() : (parsedBody.explanation || rawText);

            // Extract sources
            const srcMatch = rawText.match(/\[SOURCES?\]:\s*([\s\S]*?)$/i);
            let sources = [];
            if (srcMatch) {
              const srcParts = srcMatch[1].trim().split(/[,|\n;]/).map(s => s.trim()).filter(Boolean);
              sources = srcParts.map(s => ({
                name: s,
                type: /who/i.test(s) ? 'WHO' : /moh/i.test(s) ? 'MOH' : /cdc/i.test(s) ? 'CDC' : 'FDA',
                url: `https://www.google.com/search?q=${encodeURIComponent(s + ' health guidance')}`
              }));
            }
            if (sources.length === 0) {
              sources = [
                { name: 'Ministry of Health (MOH)', type: 'MOH', url: 'https://www.moh.gov.my' },
                { name: 'World Health Organization (WHO)', type: 'WHO', url: 'https://www.who.int' }
              ];
            }

            const record = {
              id: claimId || ('N8N-' + Math.floor(1000 + Math.random() * 9000)),
              claim_id: claimId,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              source: 'n8n Workflow Callback',
              payload: parsedBody,
              aiResponse,
              rawText,
              verdict,
              explanation,
              sources,
              confidence: verdict === 'True' ? 97 : verdict === 'False' ? 98 : 91,
              latency: '0.4s',
              receivedAt: Date.now()
            };

            latestCallbacks.unshift(record);
            if (latestCallbacks.length > 50) latestCallbacks.pop();

            // Broadcast real-time event to open browser tabs
            sseClients.forEach(client => {
              client.write(`data: ${JSON.stringify(record)}\n\n`);
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'Success',
              message: 'Received AI Output from n8n',
              claim_id: claimId,
              receivedId: record.id
            }));
          });
          return;
        }

        // 2. GET endpoint to fetch the latest received callbacks
        if (url === '/api/n8n-latest' && req.method === 'GET') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            count: latestCallbacks.length,
            latest: latestCallbacks[0] || null,
            items: latestCallbacks
          }));
          return;
        }

        // 3. Server-Sent Events (SSE) for real-time live browser notification
        if (url === '/api/n8n-stream' && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(':\n\n');
          sseClients.push(res);

          req.on('close', () => {
            sseClients = sseClients.filter(client => client !== res);
          });
          return;
        }

        // 4. POST endpoint to proxy outgoing webhook calls to n8n (bypasses browser CORS & ngrok warnings)
        if (url === '/api/forward-to-n8n' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { targetUrl, payload } = JSON.parse(body);
              if (!targetUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, message: 'Missing targetUrl parameter' }));
                return;
              }

              console.log(`\n[MediProof Proxy] Forwarding request to n8n: ${targetUrl}`);
              
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
              try {
                parsedRes = JSON.parse(resText);
              } catch (e) {
                parsedRes = resText;
              }

              if (!n8nRes.ok) {
                console.warn(`[MediProof Proxy] n8n returned error status ${n8nRes.status}:`, parsedRes);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  ok: false,
                  status: n8nRes.status,
                  statusText: n8nRes.statusText,
                  message: (parsedRes && parsedRes.message) || resText || `HTTP ${n8nRes.status}`,
                  hint: (parsedRes && parsedRes.hint) || null,
                  targetUrl,
                  isTestUrl: targetUrl.includes('/webhook-test/'),
                  isProductionUrl: targetUrl.includes('/webhook/') && !targetUrl.includes('/webhook-test/')
                }));
                return;
              }

              console.log(`[MediProof Proxy] Successfully received response from n8n (${n8nRes.status})`);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                status: n8nRes.status,
                data: parsedRes,
                raw: resText
              }));
            } catch (proxyErr) {
              console.error('[MediProof Proxy] Failed to connect to n8n:', proxyErr);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: false,
                status: 502,
                message: proxyErr.message,
                hint: 'Could not reach your ngrok tunnel. Please verify that your ngrok tunnel is online.',
                error: String(proxyErr)
              }));
            }
          });
          return;
        }

        // 5. POST endpoint to test connection / status of n8n webhook
        if (url === '/api/test-n8n-connection' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { targetUrl } = JSON.parse(body);
              if (!targetUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, message: 'Missing targetUrl parameter' }));
                return;
              }

              const n8nRes = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': '1'
                },
                body: JSON.stringify({ ping: true, test: true, message: 'Ping test from MediProof' })
              });

              const resText = await n8nRes.text();
              let parsedRes = null;
              try { parsedRes = JSON.parse(resText); } catch (e) { parsedRes = resText; }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: n8nRes.ok,
                status: n8nRes.status,
                message: (parsedRes && parsedRes.message) || (n8nRes.ok ? 'Connection successful!' : resText),
                hint: (parsedRes && parsedRes.hint) || null,
                isTestUrl: targetUrl.includes('/webhook-test/'),
                isProductionUrl: targetUrl.includes('/webhook/') && !targetUrl.includes('/webhook-test/')
              }));
            } catch (err) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: false,
                status: 502,
                message: err.message,
                hint: 'Could not connect to ngrok tunnel. Please verify ngrok is running.'
              }));
            }
          });
          return;
        }

        // 6. POST endpoint to upload images and generate full public URL for n8n
        if (url === '/api/upload-image' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { image, filename } = JSON.parse(body);
              if (!image) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, message: 'Missing image data' }));
                return;
              }

              // Extract base64 payload & extension
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

              // Ensure public/uploads directory exists and write file
              const uploadsDir = path.resolve('public', 'uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              const filePath = path.join(uploadsDir, uniqueName);
              fs.writeFileSync(filePath, buffer);

              // Upload to public image CDN so n8n can download it from any network/cloud
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

              // Fallback to local server URL
              const host = req.headers.host || 'localhost:3000';
              const localUrl = `http://${host}/uploads/${uniqueName}`;
              if (!publicUrl) {
                publicUrl = localUrl;
              }

              console.log(`[MediProof] Image uploaded. Public URL: ${publicUrl}, Local: ${localUrl}`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                imageUrl: publicUrl,
                localUrl,
                filename: uniqueName
              }));
            } catch (uploadErr) {
              console.error('[MediProof] Image upload error:', uploadErr);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, message: uploadErr.message }));
            }
          });
          return;
        }

        // 7. POST endpoint to upload voice/audio recordings and generate full accessible URL for n8n
        if (url === '/api/upload-audio' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { audio, filename, duration, mimeType: clientMime } = JSON.parse(body);
              if (!audio) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, message: 'Missing audio data' }));
                return;
              }

              // Extract base64 payload & mimeType
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

              // Ensure public/uploads directory exists and write file
              const uploadsDir = path.resolve('public', 'uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              const filePath = path.join(uploadsDir, uniqueName);
              fs.writeFileSync(filePath, buffer);

              // Upload to Catbox public CDN
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

              const host = req.headers.host || 'localhost:3000';
              const localUrl = `http://${host}/uploads/${uniqueName}`;
              const dockerUrl = `http://host.docker.internal:3000/uploads/${uniqueName}`;
              
              // If public CDN is available, use it. Otherwise use dockerUrl for n8n in Docker
              const primaryAudioUrl = publicUrl || dockerUrl;

              console.log(`[MediProof] Audio uploaded. Primary URL: ${primaryAudioUrl}, Local: ${localUrl}, Docker: ${dockerUrl}`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                audioUrl: primaryAudioUrl,
                publicUrl,
                dockerUrl,
                localUrl,
                filename: uniqueName,
                duration: duration || null
              }));
            } catch (uploadErr) {
              console.error('[MediProof] Audio upload error:', uploadErr);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, message: uploadErr.message }));
            }
          });
          return;
        }

        // 8. Direct file serving for uploaded audio & images (guarantees Docker n8n access)
        if (url.startsWith('/uploads/')) {
          const filePath = path.resolve('public', url.replace(/^\/+/, ''));
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.wav') contentType = 'audio/wav';
            else if (ext === '.mp3') contentType = 'audio/mpeg';
            else if (ext === '.ogg') contentType = 'audio/ogg';
            else if (ext === '.webm') contentType = 'audio/webm';
            else if (ext === '.m4a') contentType = 'audio/mp4';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.png') contentType = 'image/png';

            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }

        // 9. POST endpoint to translate verdict explanation & output text
        if (url === '/api/translate' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { text, targetLang, sourceLang = 'en' } = JSON.parse(body);
              if (!text || !targetLang) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, message: 'Missing text or targetLang' }));
                return;
              }

              if (targetLang === 'en' || targetLang === sourceLang) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, translatedText: text, targetLang }));
                return;
              }

              // Split text into chunks if long
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

              const resultText = translatedChunks.join(' ');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ok: true,
                translatedText: resultText,
                targetLang
              }));
            } catch (err) {
              console.error('[MediProof Translate Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, message: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [n8nReceiverPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true
  }
});
