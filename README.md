# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM จาก "แชทจริงใน IG" (ทั้งเขาพิมพ์มา + เราพิมพ์ไป) และส่งข้อความกลับไปหาอีกฝ่ายได้ทันที

## วิธีรันบนเซิร์ฟเวอร์

```bash
npm install
META_APP_ID=YOUR_APP_ID META_APP_SECRET=YOUR_APP_SECRET npm start
```

เปิด `http://localhost:3000`

## Connect Instagram (อัตโนมัติ)

ปุ่ม `Connect Instagram` จะพาไป OAuth ทันทีโดยอัตโนมัติ (ไม่ต้องกรอกอะไรเพิ่มในหน้าเว็บ)

เงื่อนไขที่ต้องตั้งใน Meta App:

- Valid OAuth Redirect URI: `http://localhost:3000/auth/instagram/callback`

หลัง connect สำเร็จ ระบบจะบันทึกและเติมให้เอง:

- `access token`
- `IG User ID`

## วิธีที่ระบบดึงข้อมูลแชท

เมื่อกด `ดึงแชทจาก IG` backend จะเรียก:

1. `/{igUserId}/conversations` เพื่อหาห้องแชทของ recipient
2. `/{conversationId}/messages` เพื่อโหลดทั้งข้อความขาเข้า/ขาออก

## คุณต้องเตรียมอะไรบ้าง

- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- Meta App ที่ได้สิทธิ์ messaging
- `Recipient ID` ของคนที่คุยกับคุณ

> หมายเหตุ: ถ้า permission/token ยังไม่ผ่าน review หรือ scope ไม่ครบ ระบบจะดึงแชท/ส่งข้อความไม่สำเร็จและแสดง error
