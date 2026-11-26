BEAUTY ACADEMY CERTIFICATE PORTAL — STARTER (FREE TIER)

Setup:
1. https://console.firebase.google.com/ par Google account se project banayein.
2. Project ke andar Web app add karein; Firebase config copy karke app.js mein placeholder values replace karein.
3. Authentication > Sign-in method > Email/Password enable karein.
4. Authentication > Users mein admin email/password user add karein. Us user ka UID copy karein.
5. Firestore Database create karein (production mode). Rules tab mein firestore.rules paste karein aur REPLACE_WITH_ADMIN_UID ko admin UID se replace karke publish karein.
6. App.js Firebase config mein apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId bhar dein.
7. GitHub account banayein; new repository create karein. In files ko upload karein.
8. Repository Settings > Pages > Build and deployment > Deploy from branch; main branch/root select karein. Website link milega.
9. Website par Admin section mein Firebase admin account se login karein. Students add karein.

Important:
- Firebase config web app mein public hoti hai; security Firestore rules se enforce hoti hai. Admin UID rules mein hi rakhein, client code mein nahi.
- Admin UID placeholder ko sahi replace karna zaroori hai; galat rules hone par data exposed ho sakta hai.
- Starter mein certificate print/save PDF browser print dialog se hota hai. QR feature aur automated PDF/QR enhancement next step mein add kar sakte hain.
- Student ki photo/details publish karne se pehle consent lein.
- Duplicate certificate IDs avoid karein. This starter does not yet enforce uniqueness.

Branding: Santosh Beauty Parlour | Owner: Santosh Kashyap | Phone: 9416958211 | Village Abdullapur, Karnal, Haryana 132001
