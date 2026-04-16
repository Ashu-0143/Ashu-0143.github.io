import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
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

// ✅ LOGIN
window.login = async function () {
  if (auth.currentUser) {
    alert("Already logged in as " + auth.currentUser.displayName);
    return;
  }

  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.displayName) {
      let customName = prompt("Enter your Chat Name:");

      if (!customName || customName.trim() === "") {
        customName = "User_" + user.uid.substring(0, 4);
      }

      await updateProfile(user, { displayName: customName });
      window.location.reload();
    }

  } catch (error) {
    console.error("Login failed:", error);
  }
};

// ✅ UI SETUP
window.onload = function () {
  const images = [
    'url(gallery/0.jpeg)', 'url(gallery/1.jpeg)', 'url(gallery/2.jpeg)',
    'url(gallery/4.jpeg)', 'url(gallery/5.jpeg)', 'url(gallery/3.jpeg)',
    'url(gallery/6.jpeg)', 'url(gallery/7.jpeg)', 'url(gallery/8.jpeg)',
    'url(gallery/9.jpeg)', 'url(gallery/10.jpeg)', 'url(gallery/11.jpeg)',
    'url(gallery/12.jpeg)', 'url(gallery/13.jpeg)', 'url(gallery/14.jpeg)',
    'url(gallery/15.jpeg)', 'url(gallery/16.jpeg)', 'url(gallery/17.jpeg)'
  ];

  const randomImg = images[Math.floor(Math.random() * images.length)];

  const div = document.getElementById("chat-container");
  if (div) {
    div.style.backgroundImage = randomImg;
    div.style.backgroundSize = "cover";
  }

  const msgInput = document.getElementById("message");
  if (msgInput) {
    msgInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") window.sendMessage();
    });
  }
};

// ✅ AUTH
onAuthStateChanged(auth, (user) => {
  if (user) {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.style.display = "block";
      loadMessages();
    }
  }
});

// ✅ SEND
window.sendMessage = async function () {
  const input = document.getElementById("message");
  if (!input || !input.value.trim() || !auth.currentUser) return;

  try {
    await addDoc(collection(db, "messages"), {
      text: input.value.trim(),
      uid: auth.currentUser.uid,
      name: auth.currentUser.displayName || "Anonymous",
      timestamp: serverTimestamp()
    });
    input.value = "";
  } catch (e) {
    console.error("Error:", e);
  }
};

// ✅ LOAD
function loadMessages() {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  const q = query(collection(db, "messages"), orderBy("timestamp"));

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");

      const isMine = data.uid === auth.currentUser.uid;
      div.className = isMine ? "my-msg" : "other-msg";

      div.innerHTML = `
        <span class="chat-name">${data.name}</span>
        <span class="chat-text">${data.text}</span>
      `;

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}