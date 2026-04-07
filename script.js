import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ✅ YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCaRF_Kpsjlpy4PbhB5wrEKjnTk34n9Me4",
  authDomain: "ashu-0143.firebaseapp.com",
  projectId: "ashu-0143",
  storageBucket: "ashu-0143.firebasestorage.app",
  messagingSenderId: "910444439310",
  appId: "1:910444439310:web:6f327391bbea321684195f",
  measurementId: "G-5SELW1ZK3Z"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


window.login = function () {
  if (auth.currentUser) return;

  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};
window.onload = function() {
    const images = [
        'url(gallery/1.jpg)',
        'url(gallery/2.jpg)',
        'url(gallery/4.jpg)',
        'url(gallery/5.jpg)',
        'url(gallery/3.jpg)',
        'url(gallery/6.jpg)',
        'url(gallery/7.jpg)',
        'url(gallery/8.jpg)',
        'url(gallery/9.jpg)',
        'url(gallery/10.jpg)'
        // 'url(gallery/11.jpg)',
        // 'url(gallery/12.jpg)'
        
    ];
    const randomImg = images[Math.floor(Math.random() * images.length)];
    
    const div = document.getElementById("chat-container");
    div.style.backgroundImage = randomImg;
    div.style.backgroundSize = "cover";
};

// ✅ AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    const chatContainer = document.getElementById("chat-container");

    // Only run if chat exists (important for safety)
    if (chatContainer) {
      chatContainer.style.display = "block";
      loadMessages();
    }
  }
});


// ✅ SEND MESSAGE
window.sendMessage = async function () {
  const input = document.getElementById("message");

  if (!input || !input.value.trim()) return;

  await addDoc(collection(db, "messages"), {
    text: input.value,
    uid: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    timestamp: serverTimestamp()
  });

  input.value = "";
};


// ✅ LOAD MESSAGES
function loadMessages() {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  const q = query(collection(db, "messages"), orderBy("timestamp"));

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");

      // Right align own messages
      if (data.uid === auth.currentUser.uid) {
        div.style.textAlign = "right";
      }

      div.innerText = data.name + ": " + data.text;
      chatBox.appendChild(div);
    });

    // Auto scroll down
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}