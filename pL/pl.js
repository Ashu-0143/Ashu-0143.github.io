import { initializeApp } from "https://gstatic.com";
import { getAuth, onAuthStateChanged } from "https://gstatic.com";
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "https://gstatic.com";

const firebaseConfig = { apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4", authDomain: "://firebaseapp.com", projectId: "ashu-0143" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) { currentUser = user; loadVault(); } 
    else { window.location.href = '../index.html'; }
});

window.generateNewLock = async () => {
    const site = prompt("Label for this lock (e.g. WhatsApp):");
    if (!site) return;

    const secret = Math.random().toString(36).substring(2, 12).toUpperCase() + "@" + Math.floor(10 + Math.random() * 90);
    
    await navigator.clipboard.writeText(secret);
    
    // UI Update for the 20s countdown
    const btn = document.getElementById("generateBtn");
    const warning = document.querySelector(".warning");
    btn.disabled = true;
    
    let secondsLeft = 20;
    const interval = setInterval(() => {
        secondsLeft--;
        warning.innerHTML = `⚠️ <strong>CLIPBOARD WIPE IN: ${secondsLeft}s</strong><br>Paste it now!`;
        warning.style.color = "#ff4d6d";
        
        if (secondsLeft <= 0) {
            clearInterval(interval);
            navigator.clipboard.writeText("CLEARED_BY_VAULT");
            warning.innerHTML = "✅ Clipboard Wiped. Access Restricted.";
            warning.style.color = "#00ff41";
            btn.disabled = false;
        }
    }, 1000);

    // Save to Firebase
    await addDoc(collection(db, "strict_vault"), {
        uid: currentUser.uid,
        label: site,
        key: secret,
        day: 6,   // Saturday
        hour: 18,  // 6 PM
        created: serverTimestamp()
    });
};

function loadVault() {
    const q = query(collection(db, "strict_vault"), where("uid", "==", currentUser.uid));
    onSnapshot(q, (snap) => {
        const container = document.getElementById('vaultList');
        container.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('div');
            card.className = 'vault-card';
            
            const updateUI = () => {
                const now = new Date();
                // 0=Sun, 1=Mon... 6=Sat
                const isSaturday = now.getDay() === 6;
                const isEvening = now.getHours() >= 18;

                if (isSaturday && isEvening) {
                    card.innerHTML = `<h3>${data.label}</h3><p class="unlocked">${data.key}</p><small>Vault Open</small>`;
                } else {
                    card.innerHTML = `<h3>${data.label}</h3><p class="locked">LOCKED</p><div class="timer" id="timer-${doc.id}">Calculating...</div>`;
                    startCountdown(doc.id);
                }
            };
            updateUI();
            container.appendChild(card);
        });
    });
}

function startCountdown(id) {
    setInterval(() => {
        const now = new Date();
        let target = new Date();
        // Calculate next Saturday 6PM
        target.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
        target.setHours(18, 0, 0, 0);

        // If today is Saturday but past 6PM, target next week
        if (now > target) target.setDate(target.getDate() + 7);

        const diff = target - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        const el = document.getElementById(`timer-${id}`);
        if (el) el.innerText = `${h}h ${m}m ${s}s until unlock`;
    }, 1000);
}
