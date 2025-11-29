# Quick Fix Guide - Backend Running Issues

## ✅ All Code Fixed!

- ✅ Models (Identity, Session, ApiKey) - Fixed Types.ObjectId
- ✅ aptosService.ts - Fixed payload format  
- ✅ All controllers - Fixed return types
- ✅ SDK builds successfully

## ⚠️ Current Issue: __dirname Error

The backend server won't start due to `ReferenceError: __dirname is not defined`.

This is a ts-node-dev ES modules compatibility issue.

##  Solutions

### Option 1: Use Built Version (Fastest) ✨

```powershell
cd backend
npm run build
node dist/index.js
```

### Option 2: Fix package.json

Add this to `backend/package.json`:
```json
{
  "type": "commonjs"
}
```

Then run:
```powershell
npm run dev
```

### Option 3: Use nodemon

```powershell
npm install --save-dev nodemon
npm run build
npx nodemon dist/index.js
```

## Once Running

You should see:
```
✅ Aptos account loaded: 0x0938...
✅ MongoDB connected
🚀 Server running on port 3001
```

Then start frontend:
```powershell
cd example-dapp
npm run dev
```

Open: http://localhost:3000
