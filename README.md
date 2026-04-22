# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM จาก "แชทจริงใน IG" (ทั้งเขาพิมพ์มา + เราพิมพ์ไป) และส่งข้อความกลับไปหาอีกฝ่ายได้ทันที

## วิธีรันบนเซิร์ฟเวอร์ (แนะนำ)

```bash
npm install
META_APP_ID=YOUR_APP_ID META_APP_SECRET=YOUR_APP_SECRET npm start
```

เปิด `http://localhost:3000`

## วิธี Connect Instagram (รองรับหน้าเว็บ static ด้วย)

ปุ่ม `Connect Instagram` ใช้วิธีพาไป Facebook OAuth โดยตรง (ไม่ต้องพึ่ง `/auth/instagram/start`) แล้วกลับมาที่ `oauth-callback.html` เพื่อเก็บ token

สิ่งที่ต้องตั้งค่าใน Meta App:

- Valid OAuth Redirect URI: `https://<your-domain>/oauth-callback.html`
- ถ้ารัน local: `http://localhost:3000/oauth-callback.html`

ในหน้าเว็บต้องกรอกอย่างน้อย:

- `Meta App ID`

หลัง connect สำเร็จ ระบบจะ:

1. เติม `access token` อัตโนมัติ
2. พยายามดึง `IG User ID` อัตโนมัติจาก `me/accounts`

## วิธีที่ระบบดึงข้อมูลแชท

เมื่อกด `ดึงแชทจาก IG` backend จะเรียก:

1. `/{igUserId}/conversations` เพื่อหาห้องแชทของ recipient
2. `/{conversationId}/messages` เพื่อโหลดทั้งข้อความขาเข้า/ขาออก

## คุณต้องเตรียมอะไรบ้าง

- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- Meta App ที่ได้สิทธิ์ messaging
- `Meta App ID` (สำหรับปุ่ม connect)
- `Recipient ID` ของคนที่คุยกับคุณ

> หมายเหตุ: ถ้า permission/token ยังไม่ผ่าน review หรือ scope ไม่ครบ ระบบจะดึงแชท/ส่งข้อความไม่สำเร็จและแสดง error
