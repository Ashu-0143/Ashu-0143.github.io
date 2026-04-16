import { initializeApp } from "https://gstatic.com";
import { getAuth, onAuthStateChanged } from "https://gstatic.com";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from "https://gstatic.com";

const firebaseConfig = { apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4", authDomain: "://firebaseapp.com", projectId: "ashu-0143" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) { 
        currentUser = user; 
        loadVault(); 
    } else { 
        window.location.href = '../index.html'; 
    }
});

// --- UI NAVIGATION ---
window.showSection = (id) => {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
};

// --- 1. GENERATE NEW PASSWORD ---
window.generateNewLock = async () => {
    const label = prompt("What is this for? (e.g. WhatsApp Private)");
    if (!label) return;

    const dayInput = prompt("Enter unlock days (0-6 where 0=Sun, 6=Sat). Use commas for multiple: e.g. 2,6");
    const hourInput = prompt("Enter unlock hour (0-23): e.g. 18 for 6PM");
    
    if (dayInput === null || hourInput === null) return;

    const secret = Math.random().toString(36).substring(2, 12).toUpperCase() + "!";
    await navigator.clipboard.writeText(secret);
    
    // Save to your private folder
    await addDoc(collection(db, "users", currentUser.uid, "strict_vault"), {
        label: label,
        key: secret,
        unlockDays: dayInput.split(',').map(Number), // Convert "2,6" to [2, 6]
        unlockHour: parseInt(hourInput),
        created: serverTimestamp()
    });

    alert("KEY COPIED! You have 20 seconds to paste it.");
    setTimeout(() => {
        navigator.clipboard.writeText("CLEARED");
        alert("Clipboard wiped! Stay disciplined.");
    }, 20000);
};

// --- 2. LOAD & CHECK VAULT ---
function loadVault() {
    const vList = document.getElementById('vaultList');
    const q = query(collection(db, "users", currentUser.uid, "strict_vault"));

    onSnapshot(q, (snap) => {
        vList.innerHTML = "";
        snap.forEach(doc => {
            const data = doc.data();
            const now = new Date();
            
            // Flexible Day/Time Check
            const isDayMatch = data.unlockDays.includes(now.getDay());
            const isHourMatch = now.getHours() >= data.unlockHour;
            const isOpen = isDayMatch && isHourMatch;

            const card = document.createElement('div');
            card.className = 'vault-card';
            
            if (isOpen) {
                card.innerHTML = `<h3>✅ ${data.label}</h3><p class="unlocked">${data.key}</p>`;
            } else {
                card.innerHTML = `<h3>🔒 ${data.label}</h3><p class="locked">LOCKED</p>
                                  <small>Next: Days ${data.unlockDays} at ${data.unlockHour}:00</small>`;
            }
            vList.appendChild(card);
        });
    });
}
