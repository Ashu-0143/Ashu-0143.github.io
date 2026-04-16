import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = { 
  apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4", 
  authDomain: "ashu-0143.firebaseapp.com", 
  projectId: "ashu-0143" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let tempDocRef = null;

// ✅ DAY MAP
const dayMap = {
  sun: 0, mon: 1, tue: 2, wed: 3,
  thu: 4, fri: 5, sat: 6
};

// ✅ LOGIN CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadVault();
  } else {
    alert("Login required!");
    window.location.href = '../index.html';
  }
});

// ✅ NAVIGATION
window.showSection = (id) => {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
};

// ✅ AM/PM → 24hr
function convertTo24(hourStr) {
  let [hour, period] = hourStr.trim().split(" ");
  hour = parseInt(hour);

  if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (period.toLowerCase() === "am" && hour === 12) hour = 0;

  return hour;
}

// ✅ GENERATE PASSWORD
window.generateNewLock = async () => {
  const label = prompt("Purpose?");
  if (!label) return;

  const dayInput = prompt("Enter days (Mon, Tue, Fri)");
  const hourInput = prompt("Enter time (e.g. 6 PM)");

  if (!dayInput || !hourInput) return;

  const unlockDays = dayInput
    .toLowerCase()
    .split(',')
    .map(d => dayMap[d.trim()]);

  const unlockHour = convertTo24(hourInput);

  const secret = Math.random().toString(36).substring(2, 12).toUpperCase();

  await navigator.clipboard.writeText(secret);
  alert("Password copied! Come back and click DONE within 20 seconds.");

  // ✅ SAVE TEMP
  tempDocRef = await addDoc(
    collection(db, "users", currentUser.uid, "temp_vault"), 
    {
      label,
      key: secret,
      unlockDays,
      unlockHour,
      createdAt: new Date()
    }
  );

  showDoneButton();

  // ⏳ AUTO DELETE AFTER 20s
  setTimeout(async () => {
    if (tempDocRef) {
      await deleteDoc(tempDocRef);
      tempDocRef = null;
      alert("Time expired. Password discarded.");
      hideDoneButton();
    }
  }, 20000);
};

// ✅ SHOW DONE BUTTON
function showDoneButton() {
  let btn = document.getElementById("doneBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "doneBtn";
    btn.innerText = "✅ Done";
    btn.style.marginTop = "15px";
    btn.onclick = confirmSave;
    document.querySelector(".glass-container").appendChild(btn);
  }
}

// ✅ HIDE DONE BUTTON
function hideDoneButton() {
  const btn = document.getElementById("doneBtn");
  if (btn) btn.remove();
}

// ✅ CONFIRM SAVE (FIXED 🔥)
async function confirmSave() {
  if (!tempDocRef) return;

  try {
    // ✅ CORRECT WAY (instead of tempDocRef.get())
    const snap = await getDoc(tempDocRef);
    const tempData = snap.data();

    await addDoc(
      collection(db, "users", currentUser.uid, "strict_vault"), 
      tempData
    );

    await deleteDoc(tempDocRef);
    tempDocRef = null;

    alert("Saved securely!");
    hideDoneButton();

  } catch (e) {
    console.error(e);
    alert("Error saving password.");
  }
}

// ✅ LOAD VAULT
function loadVault() {
  const vList = document.getElementById('vaultList');

  const q = query(
    collection(db, "users", currentUser.uid, "strict_vault"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snap) => {
    vList.innerHTML = "";

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const now = new Date();

      const isOpen =
        data.unlockDays.includes(now.getDay()) &&
        now.getHours() >= data.unlockHour;

      const card = document.createElement('div');
      card.className = 'vault-card';

      if (isOpen) {
        card.innerHTML = `
          <h3>🔓 ${data.label}</h3>
          <p class="unlocked">${data.key}</p>
        `;
      } else {
        card.innerHTML = `
          <h3>🔒 ${data.label}</h3>
          <p>Locked until allowed time</p>
        `;
      }

      vList.appendChild(card);
    });
  });
}