// ✅ YOUR OLD CODE (UNCHANGED)
$(document).ready(function () {

  let random = null;
  let trails = 0;

  $(".game1").on("click", function () {
    $("#minNumber").val("1");
    $("#maxNumber").val("");
    $("#guessNumber").val("");
    $(".resultNum").text("");

    trails = 0;

    $(".g").toggle();
    $(this).toggle("fast");
    $(".game1Center").toggle("fast");

    let min = parseInt($("#minNumber").val());
    let max = parseInt($("#maxNumber").val());
    random = Math.floor(Math.random() * (max - min + 1)) + min;

    $("#guessButton").off("click").on("click", function () {
      let min = parseInt($("#minNumber").val());
      let max = parseInt($("#maxNumber").val());
      let guess = parseInt($("#guessNumber").val());

      if (isNaN(min) || isNaN(max) || isNaN(guess)) {
        $(".resultNum").text("Enter valid numbers");
        return;
      }

      if (min >= max) {
        $(".resultNum").text("Min should be less than Max");
        return;
      }

      if (trails === 0) {
        random = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      if (guess < min || guess > max) {
        $(".resultNum").text("Out of range!");
        return;
      }

      trails++;

      if (guess > random) {
        $(".resultNum").text("Too High!");
      } else if (guess < random) {
        $(".resultNum").text("Too Low!");
      } else {
        $(".resultNum").text("Guessed in " + trails + " tries!!");
        trails = 0;
      }
    });
  });

  $(".game2").on("click", function (){
    $(".g").toggle();
    $(this).toggle("fast");
  });

  $(".more").on("click", function () {
    window.location.href = "https://www.friv.com/old";
  });

});


// 🔥 FIREBASE

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


// 🔑 PUT YOUR REAL CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ✅ LOGIN (FIXED GLOBAL)
window.login = function () {
  if (auth.currentUser) return;

  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};


// ✅ SHOW CHAT
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("chat-container").style.display = "block";
    loadMessages();
  }
});


// ✅ SEND MESSAGE
window.sendMessage = async function () {
  const input = document.getElementById("message");
  if (!input.value.trim()) return;

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
  const q = query(collection(db, "messages"), orderBy("timestamp"));

  onSnapshot(q, (snapshot) => {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");

      if (data.uid === auth.currentUser.uid) {
        div.style.textAlign = "right";
      }

      div.innerText = data.name + ": " + data.text;
      chatBox.appendChild(div);
    });
  });
}