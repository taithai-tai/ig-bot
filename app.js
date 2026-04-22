const E = {
  callThem: document.getElementById('callThem'),
  callSelf: document.getElementById('callSelf'),
  tone: document.getElementById('tone'),
  length: document.getElementById('length'),
  ending: document.getElementById('ending'),
  emoji: document.getElementById('emoji'),
  specialRule: document.getElementById('specialRule'),
  output: document.getElementById('output'),
  genBtn: document.getElementById('genBtn'),
  igUserId: document.getElementById('igUserId'),
  recipientId: document.getElementById('recipientId'),
  appId: document.getElementById('appId'),
  accessToken: document.getElementById('accessToken'),
  replyIndex: document.getElementById('replyIndex'),
  sendBtn: document.getElementById('sendBtn'),
  sendStatus: document.getElementById('sendStatus'),
  connectBtn: document.getElementById('connectBtn'),
  connectStatus: document.getElementById('connectStatus'),
  fetchBtn: document.getElementById('fetchBtn'),
  fetchStatus: document.getElementById('fetchStatus'),
  historyBox: document.getElementById('historyBox')
};

let lastOutput = null;
let latestMessages = [];

function detectMood(text) {
  const t = text.toLowerCase();
  if (!t.trim()) return 'neutral';
  if (['เศร้า', 'เหนื่อย', 'แย่', 'ร้องไห้', 'เสียใจ', 'ท้อ'].some((w) => t.includes(w))) return 'sad';
  if (['คิดถึง', 'งอน', 'อ้อน', 'รัก', 'หวง'].some((w) => t.includes(w))) return 'cute';
  if (['ไหม', 'มั้ย', '?', 'อะไร', 'ทำไม', 'ยังไง', 'ได้ปะ', 'ได้ไหม'].some((w) => t.includes(w))) return 'question';
  return 'playful';
}

const endingText = (ending) => (ending === 'ไม่มี' ? '' : ending === 'นุ่ม ๆ' ? 'น้า' : ending);
const emojiPack = (mode, variant) => (mode === 'ไม่ใช้' ? '' : mode === 'นิดหน่อย' ? (variant === 0 ? ' 🙂' : '') : [' 🫶', ' 😊', ' ✨'][variant] || ' 😊');
const fitLength = (text, length) => (length === 'สั้น' ? text : length === 'กลาง' ? `${text} เดี๋ยวค่อยคุยต่อได้` : `${text} เดี๋ยวเราอยู่ตรงนี้นะ ถ้าอยากเล่าเพิ่มก็บอกได้เลย`);

function makeInsight(mood) {
  if (!latestMessages.length) return 'ยังไม่มีแชทจาก IG ให้ดึงแชทก่อน แล้วค่อยสร้างคำตอบ';
  if (mood === 'sad') return 'จากแชทล่าสุด อีกฝ่ายดูอารมณ์ตก ควรตอบแบบนุ่มและรับฟัง';
  if (mood === 'question') return 'จากแชทล่าสุด อีกฝ่ายถามตรง ๆ ควรตอบให้ชัด';
  if (mood === 'cute') return 'จากแชทล่าสุด อีกฝ่ายมาโหมดอ้อน ตอบน่ารักเบา ๆ ได้';
  return 'จากแชทล่าสุด บทสนทนาเป็นกันเอง ควรตอบแบบธรรมชาติ';
}

function buildReplies({ callThem, callSelf, length, ending, emoji, mood }) {
  const end = endingText(ending);
  const self = callSelf || 'เรา';
  const them = callThem || 'เธอ';
  const base = {
    sad: [`${them}โอเคนะ ${self}ฟังอยู่`, `${self}อยู่ตรงนี้นะ ไม่ต้องฝืนเลย`, `กอด ๆ ก่อน เดี๋ยวค่อยเล่าให้${self}ฟังก็ได้`],
    question: [`${self}ตอบได้เลย ถามมา`, `ได้สิ ${self}ช่วยคิดให้`, `โอเค เดี๋ยว${self}ตอบให้ตรง ๆ เลย`],
    cute: [`งั้นมาใกล้ ๆ ${self}หน่อย`, `${self}ก็คิดถึง${them}เหมือนกัน`, `ถ้าอ้อนแบบนี้ ${self}แพ้เลย`],
    playful: [`ฮ่า ๆ มาแนวนี้เลยนะ`, `เอาดี ๆ ${them}กำลังแกล้ง${self}ใช่ไหม`, `โอเค งั้นคุยกันยาว ๆ`],
    neutral: [`ว่าไง ${them}`, `${self}อยู่ ๆ`, `ทักมาได้เลย`]
  };
  return base[mood].map((raw, i) => `${fitLength(raw, length)}${end}${emojiPack(emoji, i)}`);
}

function applySpecialRule(replies, specialRule) {
  return specialRule.trim() ? replies.map((line) => `${line} (${specialRule})`) : replies;
}

function renderHistory(messages) {
  E.historyBox.textContent = messages.length
    ? messages.map((m) => `${m.direction === 'inbound' ? 'เขา' : 'ฉัน'}: ${m.text || '[ไม่มีข้อความ]'} (${m.created_time || '-'})`).join('\n')
    : 'ไม่พบข้อความในห้องแชทนี้';
}

function generateOutput() {
  const latestText = latestMessages[0]?.text || '';
  const mood = detectMood(latestText);
  const replies = applySpecialRule(
    buildReplies({
      callThem: E.callThem.value.trim(),
      callSelf: E.callSelf.value.trim(),
      length: E.length.value,
      ending: E.ending.value,
      emoji: E.emoji.value,
      mood
    }),
    E.specialRule.value
  );

  lastOutput = { insight: makeInsight(mood), source: { latest_message: latestText, total_messages_loaded: latestMessages.length }, replies };
  E.output.textContent = JSON.stringify(lastOutput, null, 2);
}

function connectInstagram() {
  const appId = E.appId.value.trim();
  if (!appId) {
    E.connectStatus.textContent = 'กรอก Meta App ID ก่อน';
    return;
  }

  localStorage.setItem('ig_app_id', appId);

  const redirectUri = `${window.location.origin}/oauth-callback.html`;
  const scope = ['instagram_basic', 'instagram_manage_messages', 'pages_show_list', 'pages_messaging'].join(',');
  const authUrl = new URL('https://www.facebook.com/v22.0/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', scope);

  E.connectStatus.textContent = 'กำลังพาไปเชื่อมต่อ Instagram...';
  window.location.href = authUrl.toString();
}

async function hydrateFromToken(token) {
  E.accessToken.value = token;
  try {
    const meUrl = new URL('https://graph.facebook.com/v22.0/me/accounts');
    meUrl.searchParams.set('fields', 'instagram_business_account{id,name},name,id');
    meUrl.searchParams.set('access_token', token);
    const res = await fetch(meUrl);
    const data = await res.json();
    const firstPage = data?.data?.find((p) => p.instagram_business_account?.id);
    if (firstPage?.instagram_business_account?.id) {
      E.igUserId.value = firstPage.instagram_business_account.id;
      E.connectStatus.textContent = 'Connect Instagram สำเร็จ และดึง IG User ID อัตโนมัติแล้ว';
      return;
    }
    E.connectStatus.textContent = 'Connect สำเร็จ แต่ยังดึง IG User ID ไม่ได้ (กรอกเองได้)';
  } catch {
    E.connectStatus.textContent = 'Connect สำเร็จ แต่เช็คบัญชีไม่ผ่าน (กรอก IG User ID เองได้)';
  }
}

async function fetchChatHistory() {
  const igUserId = E.igUserId.value.trim();
  const recipientId = E.recipientId.value.trim();
  const accessToken = E.accessToken.value.trim();
  if (!igUserId || !recipientId || !accessToken) {
    E.fetchStatus.textContent = 'กรอก IG User ID, Recipient ID, Access Token ก่อนดึงแชท';
    return;
  }

  E.fetchStatus.textContent = 'กำลังดึงแชทจาก IG...';
  try {
    const res = await fetch('/api/fetch-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ igUserId, recipientId, accessToken }) });
    const data = await res.json();
    if (!res.ok) {
      E.fetchStatus.textContent = `ดึงแชทไม่สำเร็จ: ${data.error || 'unknown error'}`;
      return;
    }
    latestMessages = data.messages || [];
    renderHistory(latestMessages);
    E.fetchStatus.textContent = `ดึงสำเร็จ ${latestMessages.length} ข้อความ`;
    generateOutput();
  } catch (err) {
    E.fetchStatus.textContent = `ดึงแชทไม่สำเร็จ: ${err.message}`;
  }
}

async function initConnectionState() {
  const savedAppId = localStorage.getItem('ig_app_id');
  if (savedAppId && !E.appId.value) E.appId.value = savedAppId;

  const status = localStorage.getItem('ig_connect_status');
  if (status?.startsWith('error:')) {
    E.connectStatus.textContent = `เชื่อมต่อไม่สำเร็จ: ${status.replace('error:', '')}`;
    localStorage.removeItem('ig_connect_status');
  }

  const token = localStorage.getItem('ig_access_token');
  if (token) {
    await hydrateFromToken(token);
    localStorage.removeItem('ig_connect_status');
  }
}

E.genBtn.addEventListener('click', generateOutput);
E.connectBtn.addEventListener('click', connectInstagram);
E.fetchBtn.addEventListener('click', fetchChatHistory);

E.sendBtn.addEventListener('click', async () => {
  if (!lastOutput) generateOutput();
  const igUserId = E.igUserId.value.trim();
  const recipientId = E.recipientId.value.trim();
  const accessToken = E.accessToken.value.trim();
  const idx = Number(E.replyIndex.value || 0);
  if (!igUserId || !recipientId || !accessToken) {
    E.sendStatus.textContent = 'กรอก IG User ID, Recipient ID, Access Token ให้ครบก่อน';
    return;
  }

  const message = (lastOutput?.replies?.[idx] || '').trim();
  if (!message) {
    E.sendStatus.textContent = 'ยังไม่มีข้อความที่จะส่ง ลองดึงแชทและ Generate ก่อน';
    return;
  }

  E.sendStatus.textContent = 'กำลังส่ง...';
  try {
    const res = await fetch('/api/send-dm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ igUserId, recipientId, accessToken, message }) });
    const data = await res.json();
    E.sendStatus.textContent = res.ok ? `ส่งสำเร็จ message_id: ${data.messageId || '-'}` : `ส่งไม่สำเร็จ: ${data.error || 'unknown error'}`;
  } catch (err) {
    E.sendStatus.textContent = `ส่งไม่สำเร็จ: ${err.message}`;
  }
});

initConnectionState();
