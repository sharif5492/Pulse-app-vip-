# Pulse VIP - Deployment & Commercial Launch Guide 🚀

## 1. GitHub par Code Upload Karna

Apne local terminal ya VS Code me ye commands run karein:

```bash
# 1. Git initialize karein
git init

# 2. Tamam files add karein
git add .

# 3. Initial commit banayein
git commit -m "Pulse VIP App Production Release"

# 4. Main branch set karein
git branch -M main

# 5. Apna GitHub Repo URL link karein
git remote add origin https://github.com/<AAPKA_GITHUB_USERNAME>/pulse-vip-app.git

# 6. Push karein
git push -u origin main
```

---

## 2. Vercel par Frontend Deploy Karna (Instant Permanent Link)

1. [Vercel.com](https://vercel.com) par jayein aur GitHub se login karein.
2. **"Add New Project"** par click karein aur `pulse-vip-app` repository select karein.
3. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **"Deploy"** par click karein.
5. Vercel aapko instant permanent live link de dega (e.g., `https://pulse-vip-app.vercel.app`).
   *(Humne `vercel.json` already configure kar diya hai taake koi 404 route error na aaye).*

---

## 3. Render / Railway par Full-Stack Backend Deploy Karna (Recommended for Reel Uploads & Persistent Storage)

Kyunki app me camera & gallery reels direct server disk par save hoti hain:

1. [Render.com](https://render.com) ya [Railway.app](https://railway.app) par jayein.
2. **"New Web Service"** select kar ke apni GitHub repo connect karein.
3. Configuration:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Deploy hone par aapko permanent backend URL mil jayega jo 24/7 online rahega.

---

## 4. App ko Client ko Sell / Demo Karne ke Tips

- **Real vs Demo Transparency**:
  - Reel upload, camera recording, aspect ratio toggling, lighting profile rings, comments, aur PWA install 100% real working code hai.
  - Sample profiles (Zara Khan, DJ Kabir) demo ke tor par community dikhane ke liye rakhi gayi hain. Client chahe to apne mutabiq customize karwa sakta hai.
- **Custom Domain**:
  - Kisi bhi domain provider (jaise Namecheap ya GoDaddy) se `$5-$10` me `pulsevip.live` ya `pulseapp.pk` khareed kar Vercel/Railway se connect karein. Is se client par professional impression padta hai.
