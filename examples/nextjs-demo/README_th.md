# Next.js LINE Pay เดโม

นี่คือตัวอย่างแอปพลิเคชัน Next.js App Router ที่ผสานรวมกับ `line-pay-online-v4` SDK

[English](./README.md) | [繁體中文](./README_zh-TW.md) | [日本語](./README_ja.md) | ไทย

## ข้อกำหนดเบื้องต้น

- **Node.js** >= 18
- **pnpm** (จำเป็นสำหรับการเชื่อมโยง workspace ภายใน)

## การติดตั้งและการตั้งค่า

1. **ติดตั้ง Dependencies**

   เนื่องจากตัวอย่างนี้ขึ้นอยู่กับ SDK ภายในที่สร้างในไดเรกทอรี root เราแนะนำให้ใช้ **pnpm** เพื่อจัดการ symlink ของ workspace ภายในให้ถูกต้อง โดยเฉพาะเมื่อใช้ Next.js Turbopack

   ```bash
   pnpm install
   ```

2. **ตัวแปรสภาพแวดล้อม**

   คัดลอกไฟล์ตัวแปรสภาพแวดล้อมตัวอย่างไปยัง `.env.local` และกรอกข้อมูลประจำตัว LINE Pay ของคุณ

   ```bash
   cp .env.example .env.local
   ```

   **ตัวแปรที่จำเป็น:**
   - `LINE_PAY_CHANNEL_ID`: Channel ID ของคุณจาก LINE Pay Merchant Center
   - `LINE_PAY_CHANNEL_SECRET`: Channel Secret ของคุณ
   - `LINE_PAY_ENV`: `sandbox` สำหรับการทดสอบ หรือ `production` สำหรับใช้งานจริง

3. **รันเซิร์ฟเวอร์สำหรับพัฒนา**

   เริ่ม Next.js development server:

   ```bash
   pnpm run dev
   ```

   เปิด [http://localhost:3000](http://localhost:3000) ด้วยเบราว์เซอร์ของคุณเพื่อดูผลลัพธ์

## โครงสร้างโปรเจกต์

- **`lib/linepay.ts`**: เริ่มต้น `LinePayClient` singleton และโหลดตัวแปรสภาพแวดล้อม
- **`app/api/checkout/route.ts`**: API Route ที่จัดการการสร้างคำร้องขอชำระเงิน เรียกใช้งาน `client.requestPayment()`
- **`app/api/confirm/route.ts`**: API Route ที่จัดการ callback ยืนยันการชำระเงิน เรียกใช้งาน `client.confirm()`
- **`app/page.tsx`**: หน้า frontend หลักที่มีหน้าแสดงสินค้าและปุ่ม "Pay Now"
- **`app/payment/success/page.tsx`**: หน้าสำเร็จที่แสดงหลังจากชำระเงินเสร็จสิ้น

## การ Deploy

วิธีที่ง่ายที่สุดในการ deploy แอป Next.js ของคุณคือการใช้ [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) จากผู้สร้าง Next.js

ดูรายละเอียดเพิ่มเติมได้ที่ [เอกสารการ deploy Next.js](https://nextjs.org/docs/deployment)
