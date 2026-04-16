import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  deleteDoc, getDoc
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

// ✅ NAV
window.showSection = (id) => {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
};

// ✅ OPEN INPUT UI
window.openInputUI = () => {
  document.getElementById("inputUI").style.display = "block";
};

// ✅ CREATE LOCK
window.createLock = async () => {
  const label = document.getElementById("labelInput").value;
  const timeValue = document.getElementById("timeInput").value;

  if (!label || !timeValue) {
    alert("Fill all fields!");
    return;
  }

  const checkboxes = document.querySelectorAll("#inputUI input[type=checkbox]:checked");
  const unlockDays = Array.from(checkboxes).map(cb => Number(cb.value));

  if (unlockDays.length === 0) {
    alert("Select at least one day!");
    return;
  }

  const unlockHour = parseInt(timeValue.split(":")[0]);

  const secret = Math.random().toString(36).substring(2, 12).toUpperCase();

  await navigator.clipboard.writeText(secret);
  alert("Copied! Click DONE within 20 sec.");

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

  setTimeout(async () => {
    if (tempDocRef) {
      await deleteDoc(tempDocRef);
      tempDocRef = null;
      alert("Expired.");
      hideDoneButton();
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

  try {
    const snap = await getDoc(tempDocRef);
    const tempData = snap.data();

    await addDoc(
      collection(db, "users", currentUser.uid, "strict_vault"),
      tempData
    );

    await deleteDoc(tempDocRef);
    tempDocRef = null;

    alert("Saved!");
    hideDoneButton();

  } catch (e) {
    console.error(e);
    alert("Error saving.");
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
          <p>Locked</p>
        `;
      }

      vList.appendChild(card);
    });
  });
}