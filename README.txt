# Loto Bingo Pro — virtual balans və dəstək görünüşü

## Fayllar
- `index.html` — oyun interfeysi, virtual balans, əməliyyat tarixçəsi və Telegram dəstəyi
- `server.js` — Socket.IO oyun serveri
- `package.json` — Node.js kitabxanaları və start əmri

## Render-də yerləşdirmə
1. Bu faylları GitHub repozitoriyasının əsas qovluğuna yüklə.
2. Render-də **New + → Web Service** seç və GitHub repozitoriyasını qoş.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment: `Node`
6. Deploy bitəndə Render-in verdiyi `https://...onrender.com` ünvanını aç.

## Vacib
- Bu versiyada real pul, depozit, bank kartı, çek yükləmə və pul çıxarışı yoxdur.
- Balans yalnız virtual kredit görünüşüdür və ilkin olaraq `0.00 kredit` göstərir.
- Balans/tarixçə brauzerin `localStorage` yaddaşında, həmin cihazda saxlanır; başqa cihazda avtomatik görünməyəcək.
- Telegram dəstək düyməsinin işləməsi üçün `index.html` daxilində `https://t.me/YourSupportUsername` hissəsini öz Telegram istifadəçi adınla dəyiş.
- Server yenidən başladıqda oyun raundunun məlumatları sıfırlana bilər.
