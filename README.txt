# Loto Bingo Pro — OCR demo virtual kredit

## Yeniliklər
- Çek/qəbz şəkli seçmək olur.
- OCR (Tesseract.js) şəkildən mətn və məbləğ oxumağa çalışır.
- Tapılan məbləğ istifadəçiyə göstərilir; istifadəçi yoxlayıb təsdiqləsə, həmin qədər DEMO virtual kredit əlavə olunur.
- Virtual balans və əməliyyat tarixçəsi brauzerin localStorage yaddaşında qalır.
- Telegram dəstək linki `https://t.me/Bro_789l`-dir.

## Məhdudiyyətlər
- OCR məbləği səhv oxuya bilər.
- Bu funksiya ödənişi və çekin həqiqiliyini yoxlamır.
- Balans yalnız demo virtual kreditidir; real pul/depozit/real pul çıxarışı yoxdur.
- OCR üçün internet bağlantısı və Tesseract.js CDN-in yüklənməsi lazımdır.
- Seçilən şəkil avtomatik Telegram-a göndərilmir.

## Render
GitHub-a `index.html`, `server.js`, `package.json` yüklə; Render Web Service üçün Build Command `npm install`, Start Command `npm start`.
