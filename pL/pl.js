import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ CONFIG
const firebaseConfig = { 
  apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4", 
  authDomain: "ashu-0143.firebaseapp.com", 
  projectId: "ashu-0143" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ✅ LOGIN CHECK
onAuthStateChanged(auth, (user) => {
    if (user) { 
        currentUser = user; 
        loadVault(); 
    } else { 
        alert("Access Denied! Please login first.");
        window.location.href = '../index.html'; 
    }
});

// ✅ NAVIGATION
window.showSection = (id) => {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
};

// ✅ GENERATE PASSWORD
window.generateNewLock = async () => {
    if (!currentUser) return;

    const label = prompt("Purpose for this lock?");
    if (!label) return;

    const dayInput = prompt("Days (0=Sun, 6=Sat)\nExample: 2,6");
    const hourInput = prompt("Hour (0-23)");

    if (dayInput === null || hourInput === null) return;

    const secret = Math.random().toString(36).substring(2, 12).toUpperCase() + "#" + Math.floor(Math.random() * 99);
    
    try {
        await navigator.clipboard.writeText(secret);
        alert("KEY COPIED! You have 20 seconds.");

        await addDoc(collection(db, "users", currentUser.uid, "strict_vault"), {
            label: label,
            key: secret,
            unlockDays: dayInput.split(',').map(Number),
            unlockHour: parseInt(hourInput),
            timestamp: new Date()
        });

    } catch (e) {
        console.error("Error:", e);
        alert("Something went wrong!");
    }

    // Clipboard wipe
    let countdown = 20;
    const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(timer);
            navigator.clipboard.writeText("WIPED_FOR_SECURITY");
            alert("Clipboard cleared.");
        }
    }, 1000);
};

// ✅ LOAD VAULT
function loadVault() {
    const vList = document.getElementById('vaultList');
    if (!vList) return;

    const q = query(
        collection(db, "users", currentUser.uid, "strict_vault"),
        orderBy("timestamp", "desc")
    );

    onSnapshot(q, (snap) => {
        vList.innerHTML = "";

        if (snap.empty) {
            vList.innerHTML = "<p>No passwords saved yet.</p>";
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            const now = new Date();

            const isDayMatch = data.unlockDays.includes(now.getDay());
            const isHourMatch = now.getHours() >= data.unlockHour;
            const isOpen = isDayMatch && isHourMatch;

            const card = document.createElement('div');
            card.className = 'vault-card';
            
            if (isOpen) {
                card.innerHTML = `
                    <h3>🔓 ${data.label}</h3>
                    <p class="unlocked">${data.key}</p>
                    <small>Status: UNLOCKED</small>
                `;
            } else {
                card.innerHTML = `
                    <h3>🔒 ${data.label}</h3>
                    <p class="locked">TIME LOCKED</p>
                    <small>Unlocks: Days (${data.unlockDays}) at ${data.unlockHour}:00</small>
                `;
            }

            vList.appendChild(card);
        });
    });
}