# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM จาก "แชทจริงใน IG" (ทั้งเขาพิมพ์มา + เราพิมพ์ไป) และส่งข้อความกลับไปหาอีกฝ่ายได้ทันที

## วิธีรันบนเซิร์ฟเวอร์

```bash
npm install
META_APP_ID=YOUR_META_APP_ID META_APP_SECRET=YOUR_META_APP_SECRET \
IG_CLIENT_ID=YOUR_IG_CLIENT_ID IG_CLIENT_SECRET=YOUR_IG_CLIENT_SECRET \
npm start
```

เปิด `http://localhost:3000`

## Connect Instagram (แก้ปัญหา 404 บน GitHub Pages)

สาเหตุ 404 ในภาพเกิดจาก GitHub Pages ไม่มี backend route (`/auth/instagram-direct/start`)

ตอนนี้ระบบเชื่อมต่อแบบนี้:

1. ถ้าเป็น static host (GitHub Pages) และมี `window.IG_APP_ID` ใน `config.js`:
   - ปุ่ม `Connect Instagram` จะพาไป Facebook OAuth โดยตรง
   - callback กลับมาที่ `oauth-callback.html`
2. ถ้าไม่มี `window.IG_APP_ID`:
   - fallback ไปที่ server route `/auth/instagram-direct/start` (ใช้ตอนรัน Node server)

### ต้องตั้งค่าอะไรเพิ่มสำหรับ GitHub Pages

แก้ไฟล์ `config.js`:

```js
window.IG_APP_ID = 'YOUR_META_APP_ID';
```

แล้วตั้ง Valid OAuth Redirect URI ใน Meta App เป็น:

- `https://<your-github-pages-domain>/oauth-callback.html`

## วิธีที่ระบบดึงข้อมูลแชท

เมื่อกด `ดึงแชทจาก IG` backend จะเรียก:

1. `/{igUserId}/conversations` เพื่อหาห้องแชทของ recipient
2. `/{conversationId}/messages` เพื่อโหลดทั้งข้อความขาเข้า/ขาออก

## คุณต้องเตรียมอะไรบ้าง

- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- Meta App ที่ได้สิทธิ์ messaging (สำหรับดึงแชท/ส่ง DM)
- Instagram App credentials (`IG_CLIENT_ID`, `IG_CLIENT_SECRET`) สำหรับ direct login ฝั่ง server
- `Recipient ID` ของคนที่คุยกับคุณ

> หมายเหตุ: direct login ได้ token สำหรับการยืนยันตัวตน ส่วนการดึง/ส่ง DM ยังต้องมีสิทธิ์ messaging ของ Meta Graph API
