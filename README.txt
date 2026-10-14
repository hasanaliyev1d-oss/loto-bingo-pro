# Loto Bingo Pro — kart qiyməti və balans UI yenilənməsi

- Loto kartları paneli oyunçu balansının dərhal altına keçirildi.
- Bir loto kartı 0.50 virtual kreditdir.
- Balans 0.50-dən azdırsa kart alma düyməsi deaktivdir və alış bloklanır.
- Kart serverdən uğurla qayıdanda 0.50 kredit çıxılır və tarixçəyə yazılır.
- İstənilən oyunçu maksimum 3 kart ala bilər (mövcud server limitinə uyğun).
- İstifadəçinin istədiyi sınaq/depozit disclaimer yazıları giriş və OCR bölməsindən silinib.
- OCR-dan çıxan məbləğ yalnız brauzerdəki virtual balansı dəyişir; bu, çekin həqiqiliyini yoxlamır.
- Balans və tarixçə bu versiyada brauzerin localStorage yaddaşında saxlanır.

## Deploy
GitHub-a `index.html`, `server.js`, `package.json` yüklə. Render Build Command: `npm install`; Start Command: `npm start`.


YENİLƏNMƏ:
- Hər loto kartının altında çıxan daşlar göstərilir.
- Yuxarıda ümumi virtual uduş hovuzu görünür.
- Hər alınan kart ümumi hovuza 0.50 virtual kredit əlavə edir.
- Bingo qalibi ümumi virtual hovuzu öz brauzerindəki balansına alır.
- Bu sistem yalnız virtual demo kreditidir; real ödəniş və real pul çıxarışı etmir.
