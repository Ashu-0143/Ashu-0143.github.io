import { initializeApp } from "https://gstatic.com";
import { getAuth, onAuthStateChanged } from "https://gstatic.com";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://gstatic.com";

// ✅ YOUR FIREBASE CONFIG
const firebaseConfig = { 
  apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4", 
  authDomain: "ashu-0143.firebaseapp.com", 
  projectId: "ashu-0143" 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ✅ 1. LOGIN PROTECTION
// This runs immediately when the page loads
onAuthStateChanged(auth, (user) => {
    if (user) { 
        currentUser = user; 
        loadVault(); 
    } else { 
        // If not logged in, show alert and redirect back to index
        alert("Access Denied! Please click on 'Ashu' to login first.");
        window.location.href = '../index.html'; 
    }
});

// ✅ 2. UI NAVIGATION
window.showSection = (id) => {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
};

// ✅ 3. GENERATE NEW PASSWORD (Strict 20s Wipe)
window.generateNewLock = async () => {
    const label = prompt("Purpose for this lock? (e.g., WhatsApp Admin)");
    if (!label) return;

    const dayInput = prompt("Which days should this unlock? (0=Sun, 6=Sat)\nExample: Type '2,6' for Tuesday and Saturday");
    const hourInput = prompt("What hour should it unlock? (0-23)\nExample: 18 for 6:00 PM");

    if (dayInput === null || hourInput === null) return;

    // Create secure random key
    const secret = Math.random().toString(36).substring(2, 12).toUpperCase() + "#" + Math.floor(Math.random() * 99);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(secret);
    alert("KEY COPIED!\nYou have 20 seconds to paste it before it is wiped.");

    // SAVE TO FIREBASE (Matches your users/{uid}/... rule)
    await addDoc(collection(db, "users", currentUser.uid, "strict_vault"), {
        label: label,
        key: secret,
        unlockDays: dayInput.split(',').map(Number),
        unlockHour: parseInt(hourInput),
        timestamp: new Date()
    });

    // 20 Second Clipboard Wipe
    let countdown = 20;
    const timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(timer);
            navigator.clipboard.writeText("WIPED_FOR_SECURITY");
            alert("Clipboard cleared. Stay disciplined!");
        }
    }, 1000);
};

// ✅ 4. LOAD & CHECK VAULT
function loadVault() {
    const vList = document.getElementById('vaultList');
    // Query your private user folder
    const q = query(collection(db, "users", currentUser.uid, "strict_vault"));

    onSnapshot(q, (snap) => {
        vList.innerHTML = "";
        if (snap.empty) {
            vList.innerHTML = "<p>No passwords saved yet.</p>";
            return;
        }

        snap.forEach(doc => {
            const data = doc.data();
            const now = new Date();
            
            // Check if current day and time match user settings
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
