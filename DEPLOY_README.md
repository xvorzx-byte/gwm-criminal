# Guild War Manager - Deployment Guide

## ✅ สิ่งที่แก้ไขแล้ว (Version 2)

### 🐛 Bug ที่เจอ: Unicode Error
```
btoa() can only operate on characters in the Latin1 (ISO/IEC 8859-1) range
```

**สาเหตุ:** `btoa()` ไม่รองรับภาษาไทย, emoji และ Unicode characters

### ✨ การแก้ไข:

1. **`functions/auth/callback.js`**
   - แก้ไขการ encode session token ให้รองรับ Unicode
   - ใช้ TextEncoder + custom base64 encoding

2. **`functions/api/state.js`**  
   - แก้ไขการ decode session cookie ให้รองรับ Unicode
   - ใช้ TextDecoder + custom base64 decoding

3. **Error logging**
   - เพิ่ม console.error ใน callback.js
   - Redirect พร้อม error message

---

## 🚀 วิธี Deploy

### วิธีที่ 1: ใช้ Script (แนะนำ)
```cmd
deploy.bat
```

### วิธีที่ 2: Manual
```cmd
cd C:\Users\xvorz\Downloads\gwm-deploy
wrangler pages deploy . --project-name=guild-war-manager
```

---

## 🧪 ทดสอบ

1. Extract `gwm-deploy-fixed.zip` ทับไฟล์เดิม
2. Deploy ใหม่: `deploy.bat` หรือ `wrangler pages deploy . --project-name=guild-war-manager`
3. เข้า: https://guild-war-manager.pages.dev
4. Login ด้วย Discord
5. **ควรผ่าน!** ไม่มี Error 1101 อีกต่อไป ✅

---

## 📋 Environment Variables ที่ต้องมี

ตรวจสอบใน Cloudflare Dashboard → Settings → Environment Variables:

```
DISCORD_CLIENT_ID = 1499813957663877136
DISCORD_CLIENT_SECRET = <your_secret>
DISCORD_REDIRECT_URI = https://guild-war-manager.pages.dev/auth/callback
GUILD_SERVER_ID = 1424265653535379466
ADMIN_IDS = 798922868917796874
```

---

## 🔍 ดู Logs (ถ้ายังมีปัญหา)

```cmd
wrangler pages deployment tail
```

หรือดูใน Cloudflare Dashboard:
1. ไปที่ https://dash.cloudflare.com
2. Pages → guild-war-manager
3. คลิก Deployment ล่าสุด
4. ดู "Functions logs"

---

## 🎯 สิ่งที่แก้ไขในครั้งนี้แก้ปัญหา:

✅ Unicode characters (ภาษาไทย, emoji) ใน username/displayName  
✅ Error logging ละเอียดขึ้น  
✅ btoa/atob แทนด้วย Unicode-safe encoding

---

**ควรทำงานได้แล้วครับ!** 🚀

---

Created by Claude - Guild War Manager Debug Session v2
Fixed: Unicode btoa() error

## v82 — Stats + Vision

### KV Namespace ที่ต้องสร้าง
```
wrangler kv:namespace create SOJ_STATS
wrangler kv:namespace create SOJ_STATS --preview
```
แล้วเพิ่มใน wrangler.toml:
```toml
[[kv_namespaces]]
binding = "SOJ_STATS"
id = "<id จาก output>"
preview_id = "<preview_id>"
```

### Environment Variables (Cloudflare Dashboard > Settings > Variables)
- `ANTHROPIC_API_KEY` = sk-ant-...
- `STATS_ADMIN_KEY` = รหัสลับสำหรับ Super Admin ดู stats ทุกคน

### Flow
- ผู้เล่นเปิด /calc → ระบบโหลด stat เดิมอัตโนมัติ (ถ้ามี)
- กรอกชื่อ In-game + กด "บันทึก stat" → เก็บใน KV 90 วัน
- กด "อ่านจากภาพ" → AI อ่าน stat screen (ต้อง ANTHROPIC_API_KEY)
- กด 👑 (Super Admin) → กรอก STATS_ADMIN_KEY → ดูทุกคน
