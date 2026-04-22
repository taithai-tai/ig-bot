# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM จาก "แชทจริงใน IG" (ทั้งเขาพิมพ์มา + เราพิมพ์ไป) และส่งข้อความกลับไปหาอีกฝ่ายได้ทันที

## วิธีรัน

```bash
npm install
META_APP_ID=YOUR_APP_ID META_APP_SECRET=YOUR_APP_SECRET npm start
```

เปิด `http://localhost:3000`

## วิธีที่ระบบดึงข้อมูลจาก IG

1. กด `Connect Instagram` เพื่อทำ OAuth กับ Meta
2. ระบบจะได้ `access token` และเติมในฟอร์มให้
3. กด `ดึงแชทจาก IG`
4. backend จะเรียก Graph API สองจุด:
   - `/{igUserId}/conversations` เพื่อหาห้องแชท
   - `/{conversationId}/messages` เพื่อดึงข้อความทั้งหมดในห้องนั้น
5. ระบบแสดงประวัติแชท (แยกว่า "เขา" หรือ "ฉัน") และสร้างคำตอบ 3 เซ็ต

## คุณต้องเตรียมอะไรให้ระบบบ้าง

- `META_APP_ID` และ `META_APP_SECRET` (ตอนรันเซิร์ฟเวอร์)
- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- App ใน Meta Developer ที่ได้สิทธิ์ Instagram Messaging
- ในหน้าเว็บต้องมี:
  - `IG User ID` ของบัญชีคุณ
  - `Recipient ID` ของคนที่คุยกับคุณ
  - `Access Token` (ได้จากปุ่ม Connect หรือกรอกเอง)

## ตั้งค่า Redirect URI ใน Meta

- `http://localhost:3000/auth/instagram/callback`

> หมายเหตุ: ถ้า permission/token ยังไม่ผ่าน review หรือไม่ครบ scope ระบบจะดึงแชท/ส่งข้อความไม่สำเร็จและแสดง error กลับมา
