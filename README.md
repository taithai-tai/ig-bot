# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM และส่งข้อความไป Instagram ได้จริงผ่าน Instagram Graph API

## วิธีรัน

```bash
npm install
META_APP_ID=YOUR_APP_ID META_APP_SECRET=YOUR_APP_SECRET npm start
```

เปิด `http://localhost:3000`

## ปุ่ม Connect Instagram

ปุ่ม `Connect Instagram` จะเปิด OAuth ของ Meta และดึง access token กลับมาใส่ในฟอร์มให้อัตโนมัติ

ต้องตั้งค่า Redirect URI ใน Meta Developer ให้ตรงกับ:

- `http://localhost:3000/auth/instagram/callback`

## สิ่งที่ต้องมีเพื่อส่ง DM จริง

- Instagram Professional/Business account
- เชื่อม IG กับ Facebook Page
- App บน Meta for Developers ที่อนุญาต Instagram Messaging
- Access Token ที่มีสิทธิ์ส่งข้อความ
- `IG User ID` ของบัญชีเรา และ `Recipient ID` ของผู้รับ

> หมายเหตุ: ถ้า token/permission ไม่ถูกต้อง API จะตอบ error กลับมาในหน้าเว็บ
