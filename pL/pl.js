import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  deleteDoc, getDoc, doc
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
let tempTimer = null;

// ✅ LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadVault();
  } else {
    alert("Login required!");
    window.location.href = '../index.html';
  }
});

// ✅ NAV
window.showSection = (id) => {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
};

// ✅ OPEN INPUT
window.openInputUI = () => {
  document.getElementById("inputUI").style.display = "block";
};

// ✅ CREATE LOCK
window.createLock = async () => {
  const label = document.getElementById("labelInput").value.trim();
  const timeValue = document.getElementById("timeInput").value;

  if (!label || !timeValue) {
    alert("Fill all fields!");
    return;
  }

  const checkboxes = document.querySelectorAll("#inputUI input[type=checkbox]:checked");
  const unlockDays = Array.from(checkboxes).map(cb => Number(cb.value));

  if (unlockDays.length === 0) {
    alert("Select days!");
    return;
  }

  const [hour, minute] = timeValue.split(":").map(Number);

  const secret = Math.random().toString(36).substring(2, 12).toUpperCase();

  await navigator.clipboard.writeText(secret);
  alert("Copied! Click DONE within 20 sec.");

  tempDocRef = await addDoc(
    collection(db, "users", currentUser.uid, "temp_vault"),
    {
      label,
      key: secret,
      unlockDays,
      unlockHour: hour,
      unlockMinute: minute,
      createdAt: new Date()
    }
  );

  showDoneButton();

  tempTimer = setTimeout(async () => {
    if (tempDocRef) {
      await deleteDoc(tempDocRef);
      tempDocRef = null;
      hideDoneButton();
      alert("Expired.");
    }
  }, 20000);
};

// ✅ DONE BUTTON
function showDoneButton() {
  let btn = document.getElementById("doneBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "doneBtn";
    btn.innerText = "✅ Done";
    btn.className = "menu-btn";
    btn.onclick = confirmSave;
    document.querySelector(".glass-container").appendChild(btn);
  }
}

function hideDoneButton() {
  const btn = document.getElementById("doneBtn");
  if (btn) btn.remove();
}

// ✅ CONFIRM SAVE
async function confirmSave() {
  if (!tempDocRef) return;

  const snap = await getDoc(tempDocRef);
  if (!snap.exists()) {
    alert("Expired!");
    return;
  }

  const data = snap.data();

  await addDoc(
    collection(db, "users", currentUser.uid, "strict_vault"),
    {
      ...data,
      savedAt: new Date()
    }
  );

  await deleteDoc(tempDocRef);
  tempDocRef = null;
  clearTimeout(tempTimer);
  hideDoneButton();

  alert("Saved!");
}

// ✅ FORMAT TIME (SMART)
function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

// ✅ GET NEXT OPEN TIME
function getNextOpenTime(data) {
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const checkDay = (now.getDay() + i) % 7;

    if (data.unlockDays.includes(checkDay)) {
      const next = new Date();
      next.setDate(now.getDate() + i);
      next.setHours(data.unlockHour, data.unlockMinute || 0, 0, 0);

      if (next > now) return next;
    }
  }

  return null;
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

      const card = document.createElement('div');
      card.className = 'vault-card';

      const keyId = "key-" + docSnap.id;
      const timerId = "timer-" + docSnap.id;

      card.innerHTML = `
        <h3>${data.label}</h3>
        <p id="${keyId}">••••••••</p>
        <div id="${timerId}" class="timer"></div>
        <div id="actions-${docSnap.id}"></div>
      `;

      vList.appendChild(card);

      startLiveTimer(data, docSnap.id, keyId, timerId);
    });
  });
}

// ✅ MAIN TIMER LOGIC
function startLiveTimer(data, id, keyId, timerId) {
  const timerEl = document.getElementById(timerId);
  const actionEl = document.getElementById("actions-" + id);

  setInterval(() => {
    const now = new Date();

    const start = new Date();
    start.setHours(data.unlockHour, data.unlockMinute || 0, 0, 0);

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const isDay = data.unlockDays.includes(now.getDay());
    const isOpen = isDay && now >= start && now <= end;

    if (isOpen) {
      const remaining = end - now;

      timerEl.innerText = "Closes in " + formatTime(remaining);

      actionEl.innerHTML = `
        <div onclick="tapCopy('${data.key}')" 
             style="cursor:pointer; padding:10px; background:#222; border-radius:10px;">
             Tap to Copy 🔐
        </div>
        <button onclick="deleteVault('${id}')">🗑 Delete</button>
      `;

    } else {
      const next = getNextOpenTime(data);

      if (next) {
        const diff = next - now;
        timerEl.innerText = "Opens in " + formatTime(diff);
      } else {
        timerEl.innerText = "No schedule";
      }

      actionEl.innerHTML = "";
      document.getElementById(keyId).innerText = "••••••••";
    }

  }, 1000);
}

// ✅ TAP COPY
window.tapCopy = async (key) => {
  await navigator.clipboard.writeText(key);
  alert("Copied! Clearing in 15s.");

  setTimeout(() => {
    navigator.clipboard.writeText("CLEARED");
  }, 15000);
};

// ✅ DELETE
window.deleteVault = async (id) => {
  if (!confirm("Delete this password?")) return;

  await deleteDoc(doc(db, "users", currentUser.uid, "strict_vault", id));
};