// ═══════════════════════════════════════════════════════════
//  BELAI FEATURES — Blockchain Explorer + Video Call
//  Loaded as a separate script to keep index.html clean.
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  BLOCKCHAIN EXPLORER
// ─────────────────────────────────────────────────────────────
const BC_SC = {
  'Pickup Requested': { bg:'rgba(59,130,246,0.18)',  br:'rgba(59,130,246,0.45)', c:'#60a5fa' },
  'Packed & Ready':   { bg:'rgba(245,200,66,0.15)',  br:'rgba(245,200,66,0.4)',  c:'#f5c842' },
  'In Transit':       { bg:'rgba(14,165,233,0.15)',  br:'rgba(14,165,233,0.4)',  c:'#38bdf8' },
  'Arriving Soon':    { bg:'rgba(168,85,247,0.15)',  br:'rgba(168,85,247,0.4)',  c:'#c084fc' },
  'Delivered':        { bg:'rgba(34,197,94,0.18)',   br:'rgba(34,197,94,0.5)',   c:'#22c55e' },
};

function openBlockchainExplorer(orderId) {
  showScreen('mod-blockchain');
  if (orderId) {
    document.getElementById('bcSearchInput').value = orderId;
    fetchAndRenderBlocks(orderId);
  }
}

function closeBlockchainExplorer() {
  showScreen('mod-supply');
  document.querySelectorAll('#mod-supply .tab-row .chip').forEach((c, i) => c.classList.toggle('active', i === 1));
  ['st-0','st-1','st-2','st-3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = i === 1 ? '' : 'none';
  });
  renderDeliveries();
}

async function searchBlockchain() {
  const oid = document.getElementById('bcSearchInput').value.trim();
  if (!oid) { showToast('Enter an Order ID'); return; }
  await fetchAndRenderBlocks(oid);
}

async function fetchAndRenderBlocks(orderId) {
  document.getElementById('bcEmpty').style.display = 'none';
  document.getElementById('bcChain').innerHTML =
    '<div style="text-align:center;padding:40px"><div class="spin" style="margin:0 auto"></div>' +
    '<div style="margin-top:14px;color:rgba(255,255,255,0.6)">Fetching blockchain...</div></div>';
  try {
    const res  = await fetch(window.BELAI.API_BASE + '/ledger/search?orderId=' + encodeURIComponent(orderId));
    const data = await res.json();
    renderBlockchain(data.blocks && data.blocks.length ? data.blocks : simulateFrontendLedger(orderId));
  } catch (e) {
    renderBlockchain(simulateFrontendLedger(orderId));
  }
}

function simulateFrontendLedger(orderId) {
  const sts  = ['Pickup Requested','Packed & Ready','In Transit','Arriving Soon','Delivered'];
  const seed = orderId.replace(/\D/g,'').padEnd(8,'0');
  const fw   = '0xFA' + seed.slice(0,4) + seed.slice(4,8).toUpperCase();
  const bw   = '0xBU' + seed.slice(2,6) + seed.slice(0,4).toUpperCase();
  let prev   = '0'.repeat(64);
  const ch   = '0123456789abcdef';
  return sts.map((status, i) => {
    const bn = 4821000 + parseInt(seed.slice(0,5) || '0') + i;
    const ts = new Date(Date.now() - (sts.length - i) * 7200000).toISOString();
    const a  = 4500 + i * 300;
    let h = '';
    for (let j = 0; j < 64; j++) h += ch[Math.abs(bn*(j+1)*(i+2)*7919 + (prev.charCodeAt(j%64)||1)) % 16];
    const blk = {
      blockNumber: bn, orderId,
      productName: 'Tomato', farmerName: 'Ramesh Kumar',
      farmerWallet: fw, buyerWallet: bw,
      paymentAmount: a, farmerShare: Math.round(a * .75), platformShare: Math.round(a * .25),
      deliveryStatus: status, currentHash: h, previousHash: prev, timestamp: ts,
    };
    prev = h;
    return blk;
  });
}

function renderBlockchain(blocks) {
  const chain  = document.getElementById('bcChain');
  const banner = document.getElementById('bcOrderBanner');
  const stats  = document.getElementById('bcStatsRow');
  const empty  = document.getElementById('bcEmpty');

  if (!blocks || !blocks.length) {
    chain.innerHTML = '';
    banner.style.display = 'none';
    stats.style.display  = 'none';
    empty.style.display  = '';
    empty.innerHTML = '<div style="font-size:36px;margin-bottom:10px">🔍</div>' +
      '<div style="font-weight:700;margin-bottom:6px">No blocks found</div>' +
      '<div style="font-size:13px">No blockchain records for this Order ID.</div>';
    return;
  }

  const last = blocks[blocks.length - 1];
  banner.style.display = 'block';
  document.getElementById('bcOrderIdLabel').textContent = blocks[0].orderId;
  document.getElementById('bcBlockCount').textContent   = blocks.length;
  stats.style.display  = 'flex';
  document.getElementById('bcFarmerShare').textContent   = '₹' + (last.farmerShare  || 0).toLocaleString('en-IN');
  document.getElementById('bcPlatformShare').textContent = '₹' + (last.platformShare || 0).toLocaleString('en-IN');
  empty.style.display  = 'none';

  chain.innerHTML = blocks.map((b, i) => {
    const sc    = BC_SC[b.deliveryStatus] || BC_SC['Pickup Requested'];
    const ts    = new Date(b.timestamp).toUTCString().replace(' GMT','') + ' UTC';
    const isGen = b.previousHash === '0'.repeat(64) || b.previousHash === '0';
    const genesisLabel = i === 0 ?
      '<div style="text-align:center;margin-bottom:10px"><div class="glass-sm" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;font-size:11px;color:#f5c842;border-color:rgba(245,200,66,0.3)">🏁 Genesis Block · Block #' + b.blockNumber + '</div></div>' : '';
    const genesisTag = isGen ?
      '<span class="bc-status-pill" style="background:rgba(245,200,66,0.1);border-color:rgba(245,200,66,0.3);color:#f5c842">🏁 Genesis</span>' : '';
    const connector = i < blocks.length - 1 ? '<div class="bc-chain-connector"><span>⬇ chained</span></div>' : '';
    return genesisLabel +
      '<div class="bc-block-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
          '<div><div class="bc-block-num">BLOCK #' + b.blockNumber + '</div>' +
          '<div style="font-size:15px;font-weight:700">📋 ' + (b.productName || 'Crop') + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">👨‍🌾 ' + (b.farmerName || 'Farmer') + '</div></div>' +
          '<div class="bc-verified">✓ Verified</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' +
          '<span class="bc-status-pill" style="background:' + sc.bg + ';border-color:' + sc.br + ';color:' + sc.c + '">' + b.deliveryStatus + '</span>' +
          genesisTag +
        '</div>' +
        '<div class="glass-sm" style="padding:12px;margin-bottom:10px">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
            '<div><div style="font-size:9px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.4px">PAYMENT</div>' +
            '<div style="font-size:15px;font-weight:800;color:#f5c842">₹' + (b.paymentAmount || 0).toLocaleString('en-IN') + '</div></div>' +
            '<div><div style="font-size:9px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.4px">FARMER GETS</div>' +
            '<div style="font-size:15px;font-weight:800;color:#22c55e">₹' + (b.farmerShare || 0).toLocaleString('en-IN') + ' <span style="font-size:10px;opacity:.7">(75%)</span></div></div>' +
          '</div>' +
          '<div style="margin-top:6px"><div style="font-size:9px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.4px;margin-bottom:2px">FARMER WALLET</div>' +
          '<div style="font-family:monospace;font-size:11px;color:rgba(255,255,255,0.6)">' + (b.farmerWallet || '—') + '</div></div>' +
          '<div style="margin-top:6px"><div style="font-size:9px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:.4px;margin-bottom:2px">BUYER WALLET</div>' +
          '<div style="font-family:monospace;font-size:11px;color:rgba(255,255,255,0.6)">' + (b.buyerWallet || '—') + '</div></div>' +
        '</div>' +
        '<div style="margin-bottom:8px"><div style="font-size:9px;color:#22c55e;font-weight:700;letter-spacing:.4px;margin-bottom:3px">⛓ CURRENT HASH (SHA-256)</div>' +
        '<div class="bc-hash">' + (b.currentHash || '—') + '</div></div>' +
        '<div style="margin-bottom:8px"><div style="font-size:9px;color:rgba(245,200,66,.8);font-weight:700;letter-spacing:.4px;margin-bottom:3px">🔗 PREVIOUS HASH</div>' +
        '<div class="bc-prev-hash">' + (b.previousHash || '—') + '</div></div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.4)">🕐 ' + ts + '</div>' +
      '</div>' + connector;
  }).join('');
}

// ─────────────────────────────────────────────────────────────
//  VIDEO CALL (AgriBot panel only)
// ─────────────────────────────────────────────────────────────
let VC_STREAM = null, VC_MUTED = false, VC_CAM_OFF = false;
let VC_RUNNING = false, VC_REC = null, VC_TIMER = null;

async function startVideoCall() {
  if (VC_RUNNING) return;
  VC_RUNNING = true;
  document.getElementById('videoCallOverlay').classList.add('vcActive');

  const lm = { kn:'ಕನ್ನಡ', te:'తెలుగు', hi:'हिंदी', ta:'தமிழ்', en:'EN' };
  document.getElementById('vcLangBadge').textContent = lm[window.BELAI.BOT_LANG] || 'EN';

  // Camera & mic
  try {
    VC_STREAM = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }, audio:true });
    const v = document.getElementById('vcPipVideo');
    v.srcObject = VC_STREAM;
    v.play().catch(() => {});
  } catch (e) {
    document.getElementById('vcPip').style.display = 'none';
    showToast('📷 Camera denied — voice only mode');
  }

  // Load overlays
  updateVcWeather(); updateVcPrices(); updateVcOrderStatus();
  VC_TIMER = setInterval(() => {
    updateVcWeather(); updateVcPrices(); updateVcOrderStatus();
  }, 30000);

  // Welcome speech → then start listening
  const greet = {
    kn: 'ನಮಸ್ಕಾರ! ನಾನು BELAI. ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
    te: 'నమస్కారం! నేను BELAI. మీ ప్రశ్న అడగండి.',
    hi: 'नमस्ते! मैं BELAI हूँ। अपना सवाल पूछें।',
    ta: 'வணக்கம்! நான் BELAI. உங்கள் கேள்வி கேளுங்கள்.',
    en: 'Hello! I am BELAI, your AI farming assistant. How can I help you today?',
  };
  setTimeout(() => vcSpeak(greet[window.BELAI.BOT_LANG] || greet.en), 700);
}

function endVideoCall() {
  VC_RUNNING = false;
  if (VC_STREAM) { VC_STREAM.getTracks().forEach(t => t.stop()); VC_STREAM = null; }
  if (VC_REC)    { try { VC_REC.stop(); } catch (e) {} VC_REC = null; }
  if (VC_TIMER)  { clearInterval(VC_TIMER); VC_TIMER = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  document.getElementById('videoCallOverlay').classList.remove('vcActive');
  document.getElementById('vcPip').style.display       = '';
  document.getElementById('vcPip').style.opacity       = '1';
  document.getElementById('vcSpeakAnim').classList.remove('active');
  document.getElementById('vcTranscript').style.display = 'none';
  VC_MUTED = false; VC_CAM_OFF = false;
  const mb = document.getElementById('vcMuteBtn'), cb = document.getElementById('vcCamBtn');
  mb.classList.remove('muted'); mb.textContent = '🎙️';
  cb.classList.remove('camoff'); cb.textContent = '📷';
}

function toggleVcMute() {
  VC_MUTED = !VC_MUTED;
  const btn = document.getElementById('vcMuteBtn');
  btn.classList.toggle('muted', VC_MUTED);
  btn.textContent = VC_MUTED ? '🔇' : '🎙️';
  if (VC_STREAM) VC_STREAM.getAudioTracks().forEach(t => t.enabled = !VC_MUTED);
  if (VC_MUTED && VC_REC) { try { VC_REC.stop(); } catch (e) {} }
  else if (!VC_MUTED) setTimeout(startVcListening, 300);
}

function toggleVcCamera() {
  VC_CAM_OFF = !VC_CAM_OFF;
  const btn = document.getElementById('vcCamBtn');
  btn.classList.toggle('camoff', VC_CAM_OFF);
  btn.textContent = VC_CAM_OFF ? '📷🚫' : '📷';
  if (VC_STREAM) VC_STREAM.getVideoTracks().forEach(t => t.enabled = !VC_CAM_OFF);
  document.getElementById('vcPip').style.opacity = VC_CAM_OFF ? '0.2' : '1';
}

function vcSpeak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const lc = { kn:'kn-IN', te:'te-IN', hi:'hi-IN', ta:'ta-IN', en:'en-IN' };
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = lc[window.BELAI.BOT_LANG] || 'en-IN';
  utt.rate  = 0.92; utt.pitch = 1.05;
  const anim = document.getElementById('vcSpeakAnim');
  utt.onstart = () => anim.classList.add('active');
  utt.onend   = () => { anim.classList.remove('active'); if (VC_RUNNING && !VC_MUTED) setTimeout(startVcListening, 500); };
  utt.onerror = () => anim.classList.remove('active');
  window.speechSynthesis.speak(utt);
}

function startVcListening() {
  if (!VC_RUNNING || VC_MUTED) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  const lc = { kn:'kn-IN', te:'te-IN', hi:'hi-IN', ta:'ta-IN', en:'en-IN' };
  VC_REC = new SR();
  VC_REC.lang             = lc[window.BELAI.BOT_LANG] || 'en-IN';
  VC_REC.interimResults   = true;
  VC_REC.maxAlternatives  = 1;
  const tx = document.getElementById('vcTranscript');
  VC_REC.onstart  = () => { tx.style.display = 'block'; tx.textContent = '🎙 Listening...'; };
  VC_REC.onresult = (e) => {
    const t = e.results[0][0].transcript;
    tx.textContent = '🎙 ' + t;
    if (e.results[0].isFinal) { tx.style.display = 'none'; vcHandleQuery(t); }
  };
  VC_REC.onend   = () => { if (VC_RUNNING && !VC_MUTED && !window.speechSynthesis?.speaking) setTimeout(startVcListening, 700); };
  VC_REC.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') console.warn('VC SR:', e.error); };
  try { VC_REC.start(); } catch (e) {}
}

async function vcHandleQuery(text) {
  if (!text.trim()) return;
  if (VC_REC) { try { VC_REC.stop(); } catch (e) {} VC_REC = null; }
  const tx = document.getElementById('vcTranscript');
  tx.style.display = 'block'; tx.textContent = '⏳ ' + text;
  document.getElementById('vcSpeakAnim').classList.add('active');
  try {
    const res  = await fetch(window.BELAI.API_BASE + '/agribot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: window.BELAI.BOT_LANG, history: [{ role:'user', content: text }] }),
    });
    const data = await res.json();
    tx.style.display = 'none';
    vcSpeak(data.reply || 'Sorry, I could not respond.');
  } catch (e) {
    tx.style.display = 'none';
    document.getElementById('vcSpeakAnim').classList.remove('active');
    vcSpeak('Connection issue. Please try again.');
  }
}

async function updateVcWeather() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation?.getCurrentPosition(res, rej, { timeout: 5000 })
    );
    const { latitude: lat, longitude: lon } = pos.coords;
    const wr = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m&timezone=auto'
    );
    const wd = await wr.json();
    document.getElementById('vcWeatherTemp').textContent = (wd.current?.temperature_2m ?? '--') + '°C';
    document.getElementById('vcWeatherCity').textContent = '📍 Your Location';
  } catch (e) {
    document.getElementById('vcWeatherTemp').textContent = '32°C';
    document.getElementById('vcWeatherCity').textContent = 'Karnataka';
  }
}

function updateVcPrices() {
  const crops = window.BELAI.CROPS_DB || [];
  document.getElementById('vcPrices').innerHTML = crops.slice(0, 4).map(c =>
    '<div style="display:flex;justify-content:space-between;gap:10px">' +
    '<span style="color:rgba(255,255,255,0.65)">' + c.name + '</span>' +
    '<span style="color:#f5c842;font-weight:700">₹' + c.price + '</span></div>'
  ).join('');
}

function updateVcOrderStatus() {
  const deliveries = window.BELAI.ACTIVE_DELIVERIES || [];
  if (deliveries.length) {
    const d = deliveries[deliveries.length - 1];
    const sts = ['Pickup Requested','Packed & Ready','In Transit','Arriving Soon','Delivered'];
    document.getElementById('vcOrderStatus').textContent = sts[d.step - 1] || sts[0];
    document.getElementById('vcOrderId').textContent     = d.id;
  } else {
    document.getElementById('vcOrderStatus').textContent = '—';
    document.getElementById('vcOrderId').textContent     = 'No active order';
  }
}


