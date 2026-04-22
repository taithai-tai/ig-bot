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

function endingText(ending) {
  if (ending === 'ไม่มี') return '';
  if (ending === 'นุ่ม ๆ') return 'น้า';
  return ending;
}

function emojiPack(mode, variant) {
  if (mode === 'ไม่ใช้') return '';
  if (mode === 'นิดหน่อย') return variant === 0 ? ' 🙂' : '';
  return [' 🫶', ' 😊', ' ✨'][variant] || ' 😊';
}

function fitLength(text, length) {
  if (length === 'สั้น') return text;
  if (length === 'กลาง') return `${text} เดี๋ยวค่อยคุยต่อได้`;
  return `${text} เดี๋ยวเราอยู่ตรงนี้นะ ถ้าอยากเล่าเพิ่มก็บอกได้เลย`;
}

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

  return base[mood].map((raw, i) => {
    let line = fitLength(raw, length);
    if (end) line += end;
    line += emojiPack(emoji, i);
    return line;
  });
}

function applySpecialRule(replies, specialRule) {
  if (!specialRule.trim()) return replies;
  return replies.map((line) => `${line} (${specialRule})`);
}

function renderHistory(messages) {
  if (!messages.length) {
    E.historyBox.textContent = 'ไม่พบข้อความในห้องแชทนี้';
    return;
  }

  const rows = messages
    .map((m) => `${m.direction === 'inbound' ? 'เขา' : 'ฉัน'}: ${m.text || '[ไม่มีข้อความ]'} (${m.created_time || '-'})`)
    .join('\n');

  E.historyBox.textContent = rows;
}

function generateOutput() {
  const latestText = latestMessages[0]?.text || '';
  const mood = detectMood(latestText);

  let replies = buildReplies({
    callThem: E.callThem.value.trim(),
    callSelf: E.callSelf.value.trim(),
    length: E.length.value,
    ending: E.ending.value,
    emoji: E.emoji.value,
    mood
  });

  replies = applySpecialRule(replies, E.specialRule.value);

  lastOutput = {
    insight: makeInsight(mood),
    source: {
      latest_message: latestText,
      total_messages_loaded: latestMessages.length
    },
    replies
  };

  E.output.textContent = JSON.stringify(lastOutput, null, 2);
}

function connectInstagram() {
  E.connectStatus.textContent = 'กำลังเปิดหน้าเชื่อมต่อ Instagram...';
  const popup = window.open('/auth/instagram/start', 'ig-connect', 'width=520,height=720');
  if (!popup) {
    E.connectStatus.textContent = 'เบราว์เซอร์บล็อก popup กรุณาอนุญาตก่อน';
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
    const res = await fetch('/api/fetch-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId, recipientId, accessToken })
    });
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

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const payload = event.data || {};
  if (payload.type !== 'ig_oauth_success') return;

  if (payload.accessToken) E.accessToken.value = payload.accessToken;
  if (payload.igUserId) E.igUserId.value = payload.igUserId;

  E.connectStatus.textContent = 'เชื่อมต่อ Instagram สำเร็จ ได้ access token แล้ว';
});

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
    const res = await fetch('/api/send-dm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ igUserId, recipientId, accessToken, message })
    });
    const data = await res.json();
    if (!res.ok) {
      E.sendStatus.textContent = `ส่งไม่สำเร็จ: ${data.error || 'unknown error'}`;
      return;
    }
    E.sendStatus.textContent = `ส่งสำเร็จ message_id: ${data.messageId || '-'}`;
  } catch (err) {
    E.sendStatus.textContent = `ส่งไม่สำเร็จ: ${err.message}`;
  }
});
