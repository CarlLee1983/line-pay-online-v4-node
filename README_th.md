# @carllee1983/line-pay-v4

[![npm version](https://img.shields.io/npm/v/@carllee1983/line-pay-v4.svg)](https://www.npmjs.com/package/@carllee1983/line-pay-v4)
[![CI](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml/badge.svg)](https://github.com/CarlLee1983/line-pay-v4-node/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/CarlLee1983/line-pay-v4-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

> 🌏 [English](./README.md) | [繁體中文](./README_zh-TW.md) | [日本語](./README_ja.md) | ไทย

LINE Pay V4 API SDK สำหรับ Node.js - ปลอดภัยด้านประเภท, ทันสมัย, พร้อมใช้งานจริง

## ✨ คุณสมบัติ

- 🚀 **TypeScript ทันสมัย** - สร้างด้วย TypeScript 5.7+ และการตรวจสอบประเภทอย่างเข้มงวด
- 🛠 **Builder Pattern** - อินเทอร์เฟซที่ลื่นไหลสำหรับสร้างคำร้องขอการชำระเงิน
- 📦 **รองรับ Dual Module** - ใช้งานได้ทั้ง ESM และ CommonJS
- 🔒 **ปลอดภัยด้านประเภท** - มีการกำหนดประเภทครบถ้วนสำหรับ Request และ Response ทั้งหมด
- ⚡ **น้ำหนักเบา** - มี dependencies น้อยมาก (ใช้แค่ `node:crypto` และ `fetch`)
- 🧪 **ครอบคลุมการทดสอบ 100%** - ทดสอบอย่างละเอียดและเชื่อถือได้

## 📦 การติดตั้ง

```bash
# npm
npm install @carllee1983/line-pay-v4

# yarn
yarn add @carllee1983/line-pay-v4

# pnpm
pnpm add @carllee1983/line-pay-v4

# bun
bun add @carllee1983/line-pay-v4
```

## 🚀 การใช้งาน

### 1. สร้าง Client

```typescript
import { LinePayClient } from '@carllee1983/line-pay-v4'

const client = new LinePayClient({
  channelId: 'YOUR_CHANNEL_ID',
  channelSecret: 'YOUR_CHANNEL_SECRET',
  env: 'sandbox', // หรือ 'production'
  timeout: 5000 // ไม่บังคับ, ค่าเริ่มต้น 20000ms
})
```

### 2. ร้องขอการชำระเงิน

ใช้ `RequestPayment` builder เพื่อสร้างคำร้องขอการชำระเงินพร้อมการตรวจสอบในตัว

Builder จะตรวจสอบอัตโนมัติ:
- ฟิลด์ที่จำเป็น (amount, currency, orderId, packages, redirectUrls)
- ยอดรวมตรงกับผลรวมของยอด package
- ยอดแต่ละ package ตรงกับผลรวมของยอดสินค้า

```typescript
import { Currency } from 'line-pay-online-v4'

try {
    // ใช้ client.payment() factory method (แนะนำ)
    const response = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId('ORDER_20231201_001')
        .addPackage({
            id: 'PKG_1',
            amount: 100,
            products: [
                {
                    name: 'แพ็คเกจพรีเมียม',
                    quantity: 1,
                    price: 100
                }
            ]
        })
        .setRedirectUrls(
            'https://example.com/confirm', // URL ยืนยันของเซิร์ฟเวอร์
            'https://example.com/cancel'   // URL ยกเลิกของเซิร์ฟเวอร์
        )
        .setOptions({ display: { locale: 'th' } }) // ไม่บังคับ
        .send()

    // รับ Payment URL และ Transaction ID
    const paymentUrl = response.info.paymentUrl.web
    const transactionId = response.info.transactionId

    console.log('URL การชำระเงิน:', paymentUrl)
    console.log('รหัสธุรกรรม:', transactionId)

    // Redirect ผู้ใช้ไปยัง paymentUrl...

} catch (error) {
    console.error('ร้องขอการชำระเงินล้มเหลว:', error)
}
```

> **ทางเลือก:** คุณสามารถใช้ `new RequestPayment(client)` โดยตรงได้เช่นกัน

### 3. 💳 ขั้นตอนการชำระเงินออนไลน์ครบถ้วน

อ้างอิงจาก [LINE Pay Online API Guide](https://developers-pay.line.me/th/online-apis) ขั้นตอนมาตรฐานประกอบด้วย 3 ขั้นตอนหลัก:

#### ขั้นตอนที่ 1: ร้องขอการชำระเงินและ Redirect ผู้ใช้

เซิร์ฟเวอร์ backend ของคุณเรียก `requestPayment` API เพื่อรับ `paymentUrl` แล้ว redirect browser ของผู้ใช้ไปยัง URL นั้น

```typescript
// โค้ด Backend (ตัวอย่าง Node.js/Express)
app.post('/api/checkout', async (req, res) => {
    const orderId = `ORDER_${Date.now()}`
    
    // 1. เรียก LINE Pay API
    const result = await client.payment()
        .setAmount(100)
        .setCurrency(Currency.TWD)
        .setOrderId(orderId)
        .addPackage({
            id: 'pkg-1',
            amount: 100,
            products: [{ name: 'สินค้า A', quantity: 1, price: 100 }]
        })
        .setRedirectUrls(
            'https://your-domain.com/pay/confirm', // Redirect มาที่นี่หลังอนุมัติ
            'https://your-domain.com/pay/cancel'
        )
        .send()

    // 2. ส่ง paymentUrl กลับไปยัง frontend หรือ redirect โดยตรง
    // หมายเหตุ: เก็บ transactionId ลง DB เพื่อตรวจสอบภายหลัง
    res.json({ 
        url: result.info.paymentUrl.web, 
        transactionId: result.info.transactionId 
    })
})
```

#### ขั้นตอนที่ 2: การอนุญาตจากผู้ใช้

ผู้ใช้ยืนยันการชำระเงินบนหน้า LINE Pay เมื่อสำเร็จ LINE Pay จะ redirect ผู้ใช้กลับมายัง `confirmUrl` พร้อมพารามิเตอร์ `transactionId` และ `orderId`:

`https://your-domain.com/pay/confirm?transactionId=123456789&orderId=ORDER_...`

#### ขั้นตอนที่ 3: ยืนยันการชำระเงิน

เมื่อผู้ใช้กลับมาที่ `confirmUrl` ของคุณ คุณ**ต้อง**เรียก Confirm API เพื่อสรุปธุรกรรม หากไม่เรียกภายในกรอบเวลาหมดอายุ ธุรกรรมจะหมดอายุ

```typescript
// โค้ด Backend (จัดการ route confirmUrl)
app.get('/pay/confirm', async (req, res) => {
    const { transactionId, orderId } = req.query
    
    try {
        // 3. เรียก Confirm API เพื่อดำเนินการธุรกรรมให้เสร็จสมบูรณ์
        const response = await client.confirm(transactionId as string, {
            amount: 100, // ต้องตรงกับจำนวนเงินที่ร้องขอ
            currency: Currency.TWD
        })

        if (response.returnCode === '0000') {
            // สำเร็จ
            console.log('ธุรกรรมเสร็จสมบูรณ์:', response.info)
            res.redirect('/payment/success')
        } else {
            console.error('การชำระเงินล้มเหลว:', response.returnMessage)
            res.redirect('/payment/failure')
        }
    } catch (error) {
        console.error('API Error:', error)
        res.redirect('/payment/error')
    }
})
```

### 4. การดำเนินการอื่นๆ

#### Capture การชำระเงิน
สำหรับขั้นตอน "AUTHORIZATION" ที่ต้อง capture ด้วยตนเอง

```typescript
await client.capture(transactionId, {
    amount: 100,
    currency: Currency.TWD
})
```

#### ยกเลิกการชำระเงิน (Void)
ยกเลิกการชำระเงินที่อนุมัติแล้วแต่ยังไม่ได้ capture

```typescript
await client.void(transactionId)
```

#### คืนเงิน
คืนเงินการชำระเงินที่เสร็จสมบูรณ์

```typescript
// คืนเงินเต็มจำนวน
await client.refund(transactionId)

// คืนเงินบางส่วน
await client.refund(transactionId, { refundAmount: 50 })
```

#### ดึงรายละเอียดการชำระเงิน
สอบถามประวัติธุรกรรม

```typescript
const details = await client.getDetails({
    transactionId: ['123456789'],
    fields: 'transactionId,amount,currency'
})
```

#### ตรวจสอบสถานะการชำระเงิน
ตรวจสอบสถานะของธุรกรรมที่ระบุ

```typescript
const status = await client.checkStatus(transactionId)
```

### 5. ยูทิลิตี้

SDK มี class `LinePayUtils` สำหรับงานทั่วไป

#### แยกวิเคราะห์พารามิเตอร์ Callback
ดึง `transactionId` และ `orderId` จาก query ของ Confirm URL

```typescript
import { LinePayUtils } from '@carllee1983/line-pay-v4'

// ใน callback handler ของคุณ (เช่น Express)
const { transactionId, orderId } = LinePayUtils.parseConfirmQuery(req.query)
```

#### ตรวจสอบลายเซ็น HMAC
หากคุณต้องการตรวจสอบลายเซ็น (เช่น สำหรับ custom webhook)

```typescript
const isValid = LinePayUtils.verifySignature(channelSecret, body, signature)
```

## 🏗️ โครงสร้างโปรเจกต์

```
@carllee1983/line-pay-v4/
├── src/                    # ซอร์สโค้ด
├── examples/               # ตัวอย่างการใช้งาน
│   └── nextjs-demo/       # ตัวอย่าง Next.js App Router
├── tests/                  # ไฟล์ทดสอบ
└── dist/                   # เอาต์พุตการ build
```

## 🎮 ตัวอย่าง

ดู [Next.js Example](./examples/nextjs-demo) สำหรับการรวมเข้ากับ App Router อย่างสมบูรณ์

## 📄 ใบอนุญาต

MIT
