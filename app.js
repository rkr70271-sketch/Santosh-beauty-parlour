
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB-HvUaJMugrf2V8o0wYme1EEBLLtUbFeI",
  authDomain: "santosh-beauty-parlour.firebaseapp.com",
  projectId: "santosh-beauty-parlour",
  storageBucket: "santosh-beauty-parlour.firebasestorage.app",
  messagingSenderId: "568662157532",
  appId: "1:568662157532:web:649651725639e311906c19",
  measurementId: "G-MV78MNMFJF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);


window.show = id => {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  $(id).classList.remove('hidden');

  if (id === 'students') loadPublic();
};

document.querySelectorAll('nav button').forEach(b => {
  b.addEventListener('click', () => show(b.dataset.view));
});


onAuthStateChanged(auth, user => {
  $('adminPanel').classList.toggle('hidden', !user);
  $('login').classList.toggle('hidden', !!user);
  $('logout').classList.toggle('hidden', !user);

  $('authMsg').textContent = user
    ? 'Logged in as ' + user.email
    : '';

  if (user) loadAdmin();
});


$('login').onclick = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      $('email').value,
      $('password').value
    );
  } catch (e) {
    $('authMsg').textContent = e.message;
  }
};

$('logout').onclick = () => signOut(auth);


// ADD NEW STUDENT CERTIFICATE

$('studentForm').onsubmit = async e => {
  e.preventDefault();

  try {
    await addDoc(collection(db, 'certificates'), {
      name: $('name').value.trim(),
      course: $('course').value.trim(),

      startDate: $('startDate').value,
      endDate: $('endDate').value,

      photo: $('photo').value.trim(),
      certId: $('certId').value.trim(),
      notes: $('notes').value.trim(),

      published: $('publish').checked,
      createdAt: Date.now()
    });

    $('saveMsg').textContent = 'Certificate saved successfully!';
    e.target.reset();

    loadAdmin();
    loadPublic();

  } catch (err) {
    $('saveMsg').textContent = err.message;
  }
};


// PUBLIC STUDENT LIST

async function loadPublic() {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'certificates'),
        where('published', '==', true)
      )
    );

    const arr = snap.docs.map(d => d.data());

    $('studentList').innerHTML = arr.length
      ? arr.map(s => card(s, false)).join('')
      : 'No certificates published yet.';

  } catch (e) {
    $('studentList').textContent =
      'Database setup required: ' + e.message;
  }
}


// ADMIN STUDENT LIST

async function loadAdmin() {
  try {
    const snap = await getDocs(collection(db, 'certificates'));

    $('adminList').innerHTML = snap.docs.map(d => {
      const s = d.data();

      return `
        <div class="student">
          <b>${esc(s.name)}</b>
          — ${esc(s.course)}
          · ${esc(s.certId)}
          · ${s.published ? 'Published' : 'Hidden'}
          <button data-del="${esc(d.id)}">Delete</button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = async () => {
        if (confirm('Delete this certificate record?')) {
          await deleteDoc(doc(db, 'certificates', b.dataset.del));
          loadAdmin();
          loadPublic();
        }
      };
    });

  } catch (e) {
    $('adminList').textContent = e.message;
  }
}


// CERTIFICATE VERIFICATION

$('verifyBtn').onclick = async () => {
  const id = $('verifyId').value.trim();

  $('verifyResult').textContent = 'Searching...';

  if (!id) {
    $('verifyResult').textContent = 'Please enter Certificate ID.';
    return;
  }

  try {
    const snap = await getDocs(
      query(
        collection(db, 'certificates'),
        where('certId', '==', id)
      )
    );

    const s = snap.docs
      .map(d => d.data())
      .find(x => x.published === true);

    $('verifyResult').innerHTML = s
      ? card(s, true)
      : 'Certificate not found or not public.';

  } catch (e) {
    $('verifyResult').textContent = e.message;
  }
};


// STUDENT CERTIFICATE CARD

function card(s, verify) {
  const startDate = s.startDate || s.date || '';
  const endDate = s.endDate || s.date || '';

  return `
    <div class="student">

      ${safePhoto(s.photo) ? `
        <img src="${esc(safePhoto(s.photo))}" alt="Student photo">
      ` : ''}

      <h3>${esc(s.name)}</h3>

      <p><b>Course:</b> ${esc(s.course)}</p>

      <p><b>Course Duration:</b>
        ${esc(startDate)} to ${esc(endDate)}
      </p>

      <p><b>Certificate ID:</b> ${esc(s.certId)}</p>

      ${s.notes ? `<p>${esc(s.notes)}</p>` : ''}

      ${verify ? '<p><b>✓ Certificate record verified</b></p>' : ''}

      <button onclick="printCertificate(
        '${encodeURIComponent(s.name || '')}',
        '${encodeURIComponent(s.course || '')}',
        '${encodeURIComponent(startDate)}',
        '${encodeURIComponent(endDate)}',
        '${encodeURIComponent(s.certId || '')}',
        '${encodeURIComponent(s.photo || '')}',
        '${encodeURIComponent(s.notes || '')}'
      )">
        Print / Save PDF
      </button>

    </div>
  `;
}


// PRINT A4 LANDSCAPE GOLDEN CERTIFICATE WITH QR CODE

window.printCertificate = (n, c, sd, ed, i, p, notes) => {

  const name = decodeURIComponent(n);
  const course = decodeURIComponent(c);
  const startDate = decodeURIComponent(sd);
  const endDate = decodeURIComponent(ed);
  const certId = decodeURIComponent(i);
  const photo = safePhoto(decodeURIComponent(p));
  const extraNotes = decodeURIComponent(notes);

  const verifyUrl =
    window.location.origin +
    window.location.pathname +
    '?verify=' +
    encodeURIComponent(certId);

  const qrUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
    encodeURIComponent(verifyUrl);

  const w = window.open('', '_blank');

  if (!w) {
    alert('Please allow pop-ups to print certificate.');
    return;
  }

  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificate - ${esc(name)}</title>

      <meta name="viewport" content="width=device-width, initial-scale=1">

      <style>

        @page {
          size: A4 landscape;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Georgia, serif;
          background: #fffdf5;
          color: #392b1d;
        }

        .certificate {
          width: 297mm;
          height: 210mm;
          padding: 12mm;
          position: relative;
          overflow: hidden;
          text-align: center;
          background: #fffdf5;
        }

        .outer-border {
          height: 100%;
          width: 100%;
          border: 5px double #c49a32;
          padding: 7mm;
        }

        .inner-border {
          height: 100%;
          width: 100%;
          border: 1px solid #d9b65a;
          padding: 7mm 12mm;
          position: relative;
        }

        .top-label {
          color: #98701e;
          font-size: 13px;
          letter-spacing: 4px;
          margin-top: 2mm;
          text-transform: uppercase;
        }

        h1 {
          color: #9b7628;
          font-size: 30px;
          letter-spacing: 3px;
          margin: 8px 0;
        }

        .academy {
          font-size: 13px;
          letter-spacing: 2px;
          color: #66533a;
        }

        .line {
          width: 65%;
          margin: 10px auto;
          border-top: 2px solid #c49a32;
        }

        h2 {
          color: #79551b;
          font-size: 28px;
          margin: 8px 0;
        }

        .presented {
          font-size: 15px;
          margin: 8px;
        }

        .student-name {
          color: #8c6421;
          font-size: 34px;
          font-weight: bold;
          margin: 8px;
          text-transform: uppercase;
        }

        .course {
          font-size: 22px;
          font-weight: bold;
          margin: 8px;
        }

        .details {
          font-size: 14px;
          line-height: 1.8;
          margin-top: 8px;
        }

        .photo {
          width: 90px;
          height: 105px;
          object-fit: cover;
          border: 3px solid #c49a32;
          padding: 3px;
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
        }

        .qr {
          width: 90px;
          height: 90px;
          position: absolute;
          right: 18px;
          bottom: 20px;
        }

        .qr-label {
          position: absolute;
          right: 10px;
          bottom: 8px;
          width: 110px;
          font-size: 9px;
          color: #66533a;
        }

        .footer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 18px;
          font-size: 12px;
          line-height: 1.6;
        }

        .signature {
          position: absolute;
          left: 35px;
          bottom: 38px;
          width: 150px;
          border-top: 1px solid #98701e;
          padding-top: 5px;
          font-size: 12px;
        }

        .signature b {
          display: block;
        }

        .cert-id {
          color: #79551b;
          font-weight: bold;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

      </style>
    </head>

    <body>

      <div class="certificate">
        <div class="outer-border">
          <div class="inner-border">

            <div class="top-label">
              Santosh Beauty Parlour & Academy
            </div>

            <h1>SANTOSH BEAUTY PARLOUR</h1>

            <div class="academy">
              BEAUTY & PROFESSIONAL TRAINING ACADEMY
            </div>

            <div class="line"></div>

            <h2>CERTIFICATE OF COMPLETION</h2>

            <p class="presented">
              This certificate is proudly presented to
            </p>

            <div class="student-name">${esc(name)}</div>

            <p class="presented">
              for successfully completing the course
            </p>

            <div class="course">${esc(course)}</div>

            <div class="details">
              <b>Course Start Date:</b> ${esc(startDate)}
              &nbsp;&nbsp;&nbsp;
              <b>Course End Date:</b> ${esc(endDate)}
              <br>

              <b>Certificate ID:</b>
              <span class="cert-id">${esc(certId)}</span>

              ${extraNotes ? `<br>${esc(extraNotes)}` : ''}
            </div>

            ${photo ? `
              <img class="photo" src="${esc(photo)}" alt="Student photo">
            ` : ''}

            <img class="qr" src="${esc(qrUrl)}" alt="Certificate verification QR">

            <div class="qr-label">
              Scan QR to verify certificate
            </div>

            <div class="signature">
              <b>Santosh Kashyap</b>
              Authorized Signature
            </div>

            <div class="footer">
              <b>9416958211</b><br>
              Village Abdullapur, Karnal, Haryana 132001
            </div>

          </div>
        </div>
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => window.print(), 700);
        };
      <\/script>

    </body>
    </html>
  `);

  w.document.close();
};


// PHOTO URL VALIDATION

function safePhoto(value) {
  if (!value) return '';

  try {
    const url = new URL(value);

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.href;
    }

    return '';
  } catch {
    return '';
  }
}


// HTML SECURITY HELPER

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}


// OPEN VERIFICATION AUTOMATICALLY WHEN QR IS SCANNED

const params = new URLSearchParams(window.location.search);
const certificateToVerify = params.get('verify');

if (certificateToVerify) {
  $('verifyId').value = certificateToVerify;
  $('verifyBtn').click();
}
