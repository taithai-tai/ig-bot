const E = {
  callThem: document.getElementById('callThem'),
  callSelf: document.getElementById('callSelf'),
  tone: document.getElementById('tone'),
  length: document.getElementById('length'),
  ending: document.getElementById('ending'),
  emoji: document.getElementById('emoji'),
  specialRule: document.getElementById('specialRule'),
  latest: document.getElementById('latest'),
  output: document.getElementById('output'),
  genBtn: document.getElementById('genBtn')
};

function detectMood(text) {
  const t = text.toLowerCase();
  if (!t.trim()) return 'neutral';
  const sadWords = ['เศร้า', 'เหนื่อย', 'แย่', 'ร้องไห้', 'เสียใจ', 'ท้อ'];
  const cuteWords = ['คิดถึง', 'งอน', 'อ้อน', 'รัก', 'หวง'];
  const askWords = ['ไหม', 'มั้ย', '?', 'อะไร', 'ทำไม', 'ยังไง', 'ได้ปะ', 'ได้ไหม'];
  if (sadWords.some((w) => t.includes(w))) return 'sad';
  if (cuteWords.some((w) => t.includes(w))) return 'cute';
  if (askWords.some((w) => t.includes(w))) return 'question';
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
  return `${text} เดี๋ยว${Math.random() > 0.5 ? 'เรา' : 'เค้า'}อยู่ตรงนี้นะ ถ้าอยากเล่าเพิ่มก็บอกได้เลย`;
}

function buildReplies({ callThem, callSelf, tone, length, ending, emoji, latest, mood }) {
  const end = endingText(ending);
  const self = callSelf || 'เรา';
  const them = callThem || 'เธอ';

  const tonePrefix = {
    อบอุ่น: `${them}`,
    น่ารัก: `${them}`,
    เพื่อน: `${them}`,
    สุภาพ: `${them}`,
    อ้อน: `${them}`
  }[tone] || them;

  const baseByMood = {
    sad: [
      `${tonePrefix}โอเคนะ ${self}ฟังอยู่`,
      `${self}อยู่ตรงนี้นะ ไม่ต้องฝืนเลย`,
      `กอดๆ ก่อน เดี๋ยวค่อย ๆ เล่าให้${self}ฟังก็ได้`
    ],
    question: [
      `${self}ตอบได้เลย ว่าไงถามมา`,
      `ได้สิ ${self}ช่วยคิดให้`,
      `โอเค เดี๋ยว${self}ตอบให้ตรง ๆ เลย`
    ],
    cute: [
      `งั้นมาใกล้ ๆ ${self}หน่อย`,
      `${self}ก็คิดถึง${them}เหมือนกัน`,
      `ถ้าอ้อนแบบนี้ ${self}แพ้เลย`
    ],
    playful: [
      `ฮ่า ๆ มาแนวนี้เลยนะ`,
      `เอาดี ๆ ${them}กำลังแกล้ง${self}ใช่ไหม`,
      `โอเค งั้นคุยกันยาว ๆ`
    ],
    neutral: [
      `ว่าไง ${them}`,
      `${self}อยู่ ๆ`,
      `ทักมาได้เลย`
    ]
  };

  return baseByMood[mood].map((raw, i) => {
    let line = fitLength(raw, length);
    if (end) line = `${line}${end}`;
    line += emojiPack(emoji, i);
    return line.replace(/\s+/g, ' ').trim();
  });
}

function makeInsight(mood, latest) {
  if (!latest.trim()) return 'อีกฝ่ายยังไม่ได้ส่งข้อความชัดเจน ควรเปิดบทสนทนาแบบสบาย ๆ ก่อน';
  if (mood === 'sad') return 'อีกฝ่ายดูอารมณ์ตกหรือเหนื่อยอยู่ ต้องการคำตอบที่อ่อนโยนและทำให้รู้สึกไม่โดดเดี่ยว';
  if (mood === 'question') return 'อีกฝ่ายกำลังถามหรืออยากได้คำตอบตรง ๆ ควรตอบชัดและเป็นกันเอง';
  if (mood === 'cute') return 'อีกฝ่ายมาโหมดอ้อนหรือหวาน ๆ เหมาะกับคำตอบน่ารักแบบไม่เยอะเกิน';
  return 'อีกฝ่ายคุยเล่นสบาย ๆ ตอบแบบกันเองและมีจังหวะขี้เล่นนิดหน่อยได้';
}

function applySpecialRule(replies, specialRule) {
  if (!specialRule.trim()) return replies;
  return replies.map((line) => `${line} (${specialRule})`);
}

E.genBtn.addEventListener('click', () => {
  const latest = E.latest.value || '';
  const mood = detectMood(latest);

  let replies = buildReplies({
    callThem: E.callThem.value.trim(),
    callSelf: E.callSelf.value.trim(),
    tone: E.tone.value,
    length: E.length.value,
    ending: E.ending.value,
    emoji: E.emoji.value,
    latest,
    mood
  });

  replies = applySpecialRule(replies, E.specialRule.value);

  const output = {
    insight: makeInsight(mood, latest),
    replies
  };

  E.output.textContent = JSON.stringify(output, null, 2);
});
