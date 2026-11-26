// 1) Replace the Firebase config below with your project's config.
// 2) Put your admin UID into firestore.rules and publish those rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-HvUaJMugrf2V8o0wYme1EEBLLtUbFeI",
  authDomain: "santosh-beauty-parlour.firebaseapp.com",
  projectId: "santosh-beauty-parlour",
  storageBucket: "santosh-beauty-parlour.firebasestorage.app",
  messagingSenderId: "568662157532",
  appId: "1:568662157532:web:649651725639e311906c19",
  measurementId: "G-MV78MNMFJF"
};
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const $=id=>document.getElementById(id);
window.show=(id)=>{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(id).classList.remove('hidden');if(id==='students')loadPublic();};
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
onAuthStateChanged(auth,user=>{ $('adminPanel').classList.toggle('hidden',!user);$('login').classList.toggle('hidden',!!user);$('logout').classList.toggle('hidden',!user);$('authMsg').textContent=user?'Logged in as '+user.email:'';if(user)loadAdmin();});
$('login').onclick=async()=>{try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value);}catch(e){$('authMsg').textContent=e.message;}};
$('logout').onclick=()=>signOut(auth);
$('studentForm').onsubmit=async e=>{e.preventDefault();try{await addDoc(collection(db,'certificates'),{name:$('name').value.trim(),course:$('course').value.trim(),date:$('date').value,photo:$('photo').value.trim(),certId:$('certId').value.trim(),notes:$('notes').value.trim(),published:$('publish').checked,createdAt:Date.now()});$('saveMsg').textContent='Saved!';e.target.reset();loadAdmin();}catch(err){$('saveMsg').textContent=err.message;}};
async function loadPublic(){try{let snap=await getDocs(query(collection(db,'certificates'),where('published','==',true)));let arr=snap.docs.map(d=>d.data());$('studentList').innerHTML=arr.length?arr.map(s=>card(s,false)).join(''):'No certificates published yet.';}catch(e){$('studentList').textContent='Database setup required: '+e.message;}}
async function loadAdmin(){try{let snap=await getDocs(collection(db,'certificates'));$('adminList').innerHTML=snap.docs.map(d=>`<div class="student"><b>${esc(d.data().name)}</b> — ${esc(d.data().course)} · ${esc(d.data().certId)} · ${d.data().published?'Published':'Hidden'} <button data-del="${d.id}">Delete</button></div>`).join('');document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this certificate record?')){await deleteDoc(doc(db,'certificates',b.dataset.del));loadAdmin();loadPublic();}});}catch(e){$('adminList').textContent=e.message;}}
$('verifyBtn').onclick=async()=>{let id=$('verifyId').value.trim();$('verifyResult').textContent='Searching…';try{let snap=await getDocs(query(collection(db,'certificates'),where('certId','==',id)));let s=snap.docs.map(d=>d.data()).find(x=>x.published);$('verifyResult').innerHTML=s?card(s,true):'Certificate not found or not public.';}catch(e){$('verifyResult').textContent=e.message;}};
function card(s,verify){return `<div class="student">${s.photo?`<img src="${esc(s.photo)}" alt="Student photo">`:''}<h3>${esc(s.name)}</h3><p><b>Course:</b> ${esc(s.course)}</p><p><b>Completion date:</b> ${esc(s.date)}</p><p><b>Certificate ID:</b> ${esc(s.certId)}</p>${s.notes?`<p>${esc(s.notes)}</p>`:''}${verify?'<p><b>✓ Certificate record found</b></p>':''}<button onclick="printCertificate('${encodeURIComponent(s.name)}','${encodeURIComponent(s.course)}','${encodeURIComponent(s.date)}','${encodeURIComponent(s.certId)}')">Print / Save PDF</button></div>`;}
window.printCertificate=(n,c,d,i)=>{let w=window.open('','_blank');if(!w){alert('Allow pop-ups to print certificate');return;}w.document.write(`<html><head><title>Certificate</title><style>body{font-family:Georgia;padding:35px}.box{border:12px double #986b56;padding:45px;text-align:center}h1{color:#6d3c4a}h2{font-size:30px}</style></head><body><div class="box"><h1>SANTOSH BEAUTY PARLOUR</h1><h2>Certificate of Completion</h2><p>This certificate is presented to</p><h2>${decodeURIComponent(n)}</h2><p>for successfully completing</p><h2>${decodeURIComponent(c)}</h2><p>Completion date: ${decodeURIComponent(d)}</p><p>Certificate ID: ${decodeURIComponent(i)}</p><p>Santosh Kashyap · 9416958211</p><p>Village Abdullapur, Karnal, Haryana 132001</p></div><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
