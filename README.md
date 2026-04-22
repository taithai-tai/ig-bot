# IG DM Reply Helper (Web)

เว็บช่วยสร้างคำตอบ DM จาก "แชทจริงใน IG" (ทั้งเขาพิมพ์มา + เราพิมพ์ไป) และส่งข้อความกลับไปหาอีกฝ่าย โดยใช้ Instagram/Meta Graph API

## วิธีรัน

```bash
npm install
META_APP_ID=YOUR_META_APP_ID META_APP_SECRET=YOUR_META_APP_SECRET npm start
```

เปิด `http://localhost:3000`

## Connect Instagram (ใช้ API)

ปุ่ม `Connect Instagram (API)` ใช้ OAuth ผ่าน server API:

1. ไปที่ `/auth/instagram/start`
2. รับ callback ที่ `/auth/instagram/callback`
3. server เก็บ access token ลง localStorage บน browser
4. frontend เรียก `/api/resolve-ig-user` เพื่อดึง `IG User ID` อัตโนมัติ

## การดึง/ส่งข้อมูลทั้งหมดใช้ API

- ดึง IG User ID: `POST /api/resolve-ig-user`
- ดึงแชท: `POST /api/fetch-chat`
- ส่งข้อความ: `POST /api/send-dm`

ทั้งหมดวิ่งผ่าน Graph API จาก backend ไม่มีการดึงข้อมูลแบบ scrape จากหน้าเว็บ

## ต้องเตรียมอะไรบ้าง

- Instagram Professional/Business account
- IG ผูกกับ Facebook Page
- Meta App ที่มีสิทธิ์ `instagram_manage_messages`, `pages_messaging`, `pages_show_list`, `instagram_basic`
- `Recipient ID` ของคนที่คุยด้วย

> หมายเหตุ: หากสิทธิ์ไม่ครบหรือแอปยังไม่ผ่าน review จะ connect/dึงแชท/ส่ง DM ไม่สำเร็จ
