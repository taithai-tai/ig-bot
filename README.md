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

## Connect Instagram (Direct)

ปุ่ม `Connect Instagram (Direct)` จะพาไปหน้าอนุญาตของ Instagram โดยตรง (ไม่ต้องกรอกอะไรเพิ่ม)

- ใช้ endpoint: `/auth/instagram-direct/start`
- callback: `/auth/instagram-direct/callback`

ต้องตั้งค่า Redirect URI ใน Instagram App ให้ตรง:

- `http://localhost:3000/auth/instagram-direct/callback`

## วิธีที่ระบบดึงข้อมูลแชท

เมื่อกด `ดึงแชทจาก IG` backend จะเรียก:

1. `/{igUserId}/conversations` เพื่อหาห้องแชทของ recipient
2. `/{conversationId}/messages` เพื่อโหลดทั้งข้อความขาเข้า/ขาออก

## คุณต้องเตรียมอะไรบ้าง

- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- Meta App ที่ได้สิทธิ์ messaging (สำหรับดึงแชท/ส่ง DM)
- Instagram App credentials (`IG_CLIENT_ID`, `IG_CLIENT_SECRET`) สำหรับ direct login
- `Recipient ID` ของคนที่คุยกับคุณ

> หมายเหตุ: direct login ได้ token สำหรับการยืนยันตัวตนกับ Instagram โดยตรง ส่วนการดึง DM/ส่ง DM ยังต้องใช้สิทธิ์ messaging ของ Meta Graph API
