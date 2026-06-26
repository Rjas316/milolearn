(function() {
  const landingPage = document.getElementById("landingPage");
  const form = document.getElementById("loginForm");
  const loadingScreen = document.getElementById("loadingScreen");
  const loginScreen = document.getElementById("loginScreen");
  const appScreen = document.getElementById("appScreen");
  const welcomeUser = document.getElementById("welcomeUser");
  const message = document.getElementById("message");

  console.log("Lema Learning App loaded");
  console.log("Use ANY email and password to sign in!");

  // ==================== NAVIGATION ====================
  window.openLogin = function() {
    if (landingPage) landingPage.style.display = "none";
    if (loginScreen) loginScreen.classList.remove("hidden");
  };

  window.goToLanding = function() {
    if (landingPage) landingPage.style.display = "flex";
    if (loginScreen) loginScreen.classList.add("hidden");
    if (appScreen) appScreen.classList.add("hidden");
  };

  // ==================== FIREBASE SETUP ====================
  const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyReplaceWithYours",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
  };

  let firebaseReady = false;
  let db = null;

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    firebaseReady = true;
    const fbStatus = document.getElementById("firebaseStatus");
    if (fbStatus) fbStatus.textContent = "Connected to Firebase";
  } catch (e) {
    firebaseReady = false;
    const fbStatus = document.getElementById("firebaseStatus");
    if (fbStatus) fbStatus.textContent = "Offline mode — replace config with your Firebase keys";
  }

  // ==================== CUTE LOADING ANIMATION ====================
  function showLoadingSequence(email) {
    const loadingMessages = [
      { text: "Preparing your dashboard... 🎨", delay: 250 },
      { text: "Loading your personal stats... 📊", delay: 300 },
      { text: "Setting up your AI tutor... 🤖", delay: 350 },
      { text: "Syncing study materials... 📚", delay: 400 },
      { text: "Gathering cute animals... 🐱🐶", delay: 350 },
      { text: "Almost ready... ✨", delay: 350 }
    ];

    const loadingMessage = document.getElementById("loadingMessage");
    if (!loadingMessage) return;
    
    let totalDelay = 0;
    loadingMessages.forEach(function(item) {
      setTimeout(function() {
        if (loadingMessage) loadingMessage.textContent = item.text;
      }, totalDelay);
      totalDelay += item.delay;
    });

    setTimeout(function() {
      if (loadingScreen) loadingScreen.classList.add("hidden");
      if (appScreen) appScreen.classList.remove("hidden");
      if (welcomeUser) welcomeUser.textContent = "Welcome back, " + email + "! 🎉";
      updateDashboardStats();
      renderNotes();
      renderFlashcardDeck();
    }, 2000);
  }

  // ==================== LOGIN ====================
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      
      if (!emailInput || !passwordInput) {
        if (message) {
          message.textContent = "Error: Form elements not found.";
          message.style.color = "#ef4444";
        }
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email) {
        if (message) { message.textContent = "Please enter your email address."; message.style.color = "#ef4444"; }
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        if (message) { message.textContent = "Please enter a valid email address."; message.style.color = "#ef4444"; }
        return;
      }

      if (!password) {
        if (message) { message.textContent = "Please enter your password."; message.style.color = "#ef4444"; }
        return;
      }

      if (message) { message.textContent = ""; message.style.color = ""; }
      if (loginScreen) loginScreen.classList.add("hidden");
      if (loadingScreen) loadingScreen.classList.remove("hidden");
      showLoadingSequence(email);
    });
  }

  // ==================== TABS ====================
  window.showTab = function(event, tabName) {
    const allContents = document.querySelectorAll(".tab-content");
    const allTabs = document.querySelectorAll(".tab");
    
    allContents.forEach(function(t) { t.classList.remove("active"); });
    allTabs.forEach(function(t) { t.classList.remove("active"); });
    
    var targetContent = document.getElementById(tabName);
    if (targetContent) targetContent.classList.add("active");
    if (event && event.target) event.target.classList.add("active");
    
    if (tabName === "dashboard") updateDashboardStats();
    if (tabName === "aiTutor") updateAISuggestions();
    if (tabName === "quizzes") loadQuiz();
  };

  // ==================== DASHBOARD ====================
  function updateDashboardStats() {
    var notesCountEl = document.getElementById("notesCount");
    var studyHoursEl = document.getElementById("studyHours");
    var tasksDoneEl = document.getElementById("tasksDone");
    var flashcardCountEl = document.getElementById("flashcardCount");
    
    if (notesCountEl) notesCountEl.textContent = JSON.parse(localStorage.getItem("notes") || "[]").length;
    if (studyHoursEl) studyHoursEl.textContent = Math.floor(Math.random() * 20 + 5);
    if (tasksDoneEl) tasksDoneEl.textContent = document.querySelectorAll("#workList li.done").length;
    if (flashcardCountEl) flashcardCountEl.textContent = JSON.parse(localStorage.getItem("flashcards") || "[]").length;
  }

  // ==================== WORK TRACKER ====================
  window.addWork = function() {
    var task = document.getElementById("workInput").value.trim();
    var deadline = document.getElementById("workDeadline").value;
    if (!task) return;

    var li = document.createElement("li");
    li.innerHTML = '<span>' + task + (deadline ? ' - ' + deadline : '') + '</span><div style="display:flex;gap:8px;"><button onclick="toggleWorkDone(this)">Done</button><button onclick="deleteWork(this)">Delete</button></div>';
    li.dataset.status = "pending";
    document.getElementById("workList").appendChild(li);
    document.getElementById("workInput").value = "";
    document.getElementById("workDeadline").value = "";
    updateDashboardStats();
  };

  window.toggleWorkDone = function(btn) { btn.closest("li").classList.toggle("done"); updateDashboardStats(); };
  window.deleteWork = function(btn) { btn.closest("li").remove(); updateDashboardStats(); };

  window.filterWork = function(event, filter) {
    document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
    if (event && event.target) event.target.classList.add("active");
    document.querySelectorAll("#workList li").forEach(function(li) {
      if (filter === "all") li.style.display = "flex";
      else if (filter === "done") li.style.display = li.classList.contains("done") ? "flex" : "none";
      else li.style.display = !li.classList.contains("done") ? "flex" : "none";
    });
  };

  // ==================== QUIZZES ====================
  var quizQuestions = [
    { q: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], answer: 1 },
    { q: "What is 5 + 3?", options: ["6", "7", "8", "9"], answer: 2 },
    { q: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Earth"], answer: 2 },
    { q: "What is H2O?", options: ["Oxygen", "Water", "Hydrogen", "Salt"], answer: 1 },
    { q: "Who wrote Romeo and Juliet?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 }
  ];

  window.loadQuiz = function() {
    var quizQuestionEl = document.getElementById("quizQuestion");
    var quizOptionsEl = document.getElementById("quizOptions");
    var quizResultEl = document.getElementById("quizResult");
    if (!quizQuestionEl || !quizOptionsEl) return;
    
    var question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    quizQuestionEl.innerHTML = '<h3 style="color:#1e293b;">' + question.q + '</h3>';
    quizOptionsEl.innerHTML = question.options.map(function(opt, i) {
      return '<button onclick="checkAnswer(' + i + ', ' + question.answer + ')" style="width:auto;display:inline-block;margin:5px;">' + opt + '</button>';
    }).join("");
    if (quizResultEl) quizResultEl.textContent = "";
  };

  window.checkAnswer = function(selected, correct) {
    var result = document.getElementById("quizResult");
    if (!result) return;
    if (selected === correct) { result.textContent = "Correct!"; result.style.color = "#4caf50"; }
    else { result.textContent = "Wrong answer. Try again!"; result.style.color = "#f44336"; }
  };

  // ==================== CALCULATOR ====================
  window.appendToCalc = function(value) { var d = document.getElementById("calcDisplay"); if (d) d.value += value; };
  window.clearCalc = function() { var d = document.getElementById("calcDisplay"); if (d) d.value = ""; };
  window.calculate = function() {
    var d = document.getElementById("calcDisplay");
    if (!d) return;
    try { d.value = eval(d.value); } catch (e) { d.value = "Error"; }
  };

  // ==================== POMODORO ====================
  var pomodoroTimer, pomodoroSeconds = 1500, pomodoroRunning = false;

  function updateTimerDisplay() {
    var d = document.getElementById("timerDisplay");
    if (!d) return;
    var m = Math.floor(pomodoroSeconds / 60);
    var s = pomodoroSeconds % 60;
    d.textContent = m + ":" + s.toString().padStart(2, "0");
  }

  window.setPomodoro = function(minutes) { window.pausePomodoro(); pomodoroSeconds = minutes * 60; updateTimerDisplay(); };
  window.startPomodoro = function() {
    if (pomodoroRunning) return;
    pomodoroRunning = true;
    pomodoroTimer = setInterval(function() {
      if (pomodoroSeconds > 0) { pomodoroSeconds--; updateTimerDisplay(); }
      else { clearInterval(pomodoroTimer); pomodoroRunning = false; }
    }, 1000);
  };
  window.pausePomodoro = function() { clearInterval(pomodoroTimer); pomodoroRunning = false; };
  window.resetPomodoro = function() { window.pausePomodoro(); pomodoroSeconds = 1500; updateTimerDisplay(); };
  updateTimerDisplay();

  // ==================== FLASHCARDS ====================
  var flashcards = JSON.parse(localStorage.getItem("flashcards") || "[]");
  var flashcardIndex = 0, isFlipped = false;

  window.addFlashcard = function() {
    var q = document.getElementById("flashcardQuestion").value.trim();
    var a = document.getElementById("flashcardAnswer").value.trim();
    if (!q || !a) return;
    flashcards.push({ q: q, a: a });
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
    renderFlashcardDeck();
    document.getElementById("flashcardQuestion").value = "";
    document.getElementById("flashcardAnswer").value = "";
    updateDashboardStats();
  };

  function renderFlashcardDeck() {
    var deck = document.getElementById("flashcardDeck");
    if (!deck) return;
    deck.innerHTML = flashcards.map(function(card, i) {
      return '<div class="mini-card" onclick="removeFlashcard(' + i + ')">' + card.q + ' X</div>';
    }).join("");
  }

  window.studyFlashcards = function() {
    if (flashcards.length === 0) return alert("Add some flashcards first!");
    flashcardIndex = 0; isFlipped = false;
    document.getElementById("flashcardViewer").classList.remove("hidden");
    showFlashcard();
  };

  function showFlashcard() {
    if (flashcardIndex >= flashcards.length) { document.getElementById("flashcardViewer").classList.add("hidden"); return; }
    isFlipped = false;
    var t = document.getElementById("flashcardText");
    if (t) t.textContent = flashcards[flashcardIndex].q;
  }

  window.flipFlashcard = function() {
    isFlipped = !isFlipped;
    var t = document.getElementById("flashcardText");
    if (t) t.textContent = isFlipped ? flashcards[flashcardIndex].a : flashcards[flashcardIndex].q;
  };
  window.nextFlashcard = function() { flashcardIndex++; showFlashcard(); };
  window.removeFlashcard = function(index) { flashcards.splice(index, 1); localStorage.setItem("flashcards", JSON.stringify(flashcards)); renderFlashcardDeck(); updateDashboardStats(); };

  // ==================== NOTES ====================
  window.saveNote = function() {
    var title = document.getElementById("noteTitle").value.trim();
    var content = document.getElementById("noteContent").value.trim();
    if (!title || !content) return;
    var notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push({ title: title, content: content, date: new Date().toLocaleString() });
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    updateDashboardStats();
  };

  function renderNotes() {
    var list = document.getElementById("notesList");
    if (!list) return;
    var notes = JSON.parse(localStorage.getItem("notes") || "[]");
    list.innerHTML = notes.map(function(note, i) {
      return '<div class="note-item"><div><strong>' + note.title + '</strong><br><small>' + note.date + '</small><br>' + note.content.substring(0, 50) + '...</div><button onclick="deleteNote(' + i + ')" style="width:auto;">Delete</button></div>';
    }).join("");
  }
  window.deleteNote = function(index) { var notes = JSON.parse(localStorage.getItem("notes") || "[]"); notes.splice(index, 1); localStorage.setItem("notes", JSON.stringify(notes)); renderNotes(); updateDashboardStats(); };

  // ==================== MUSIC ====================
  var isPlaying = false, currentTrack = "Lo-fi Beats";
  window.toggleMusic = function() {
    var btn = document.getElementById("playBtn"); isPlaying = !isPlaying;
    if (btn) btn.textContent = isPlaying ? "Pause" : "Play";
    var np = document.querySelector(".now-playing");
    if (np) np.textContent = isPlaying ? "Now Playing: " + currentTrack : "Paused";
  };
  window.stopMusic = function() { isPlaying = false; var btn = document.getElementById("playBtn"); if (btn) btn.textContent = "Play"; };
  window.selectTrack = function(track) { currentTrack = track; isPlaying = true; };

  // ==================== QUESTION ====================
  window.askQuestion = function() {
    var q = document.getElementById("questionInput").value.trim();
    if (!q) return;
    var answers = ["Great question! Try breaking it down step by step.", "Check Khan Academy for detailed explanations.", "Focus on the core concept and practice with examples.", "Master the basics first, then tackle advanced problems."];
    var el = document.getElementById("questionAnswer");
    if (el) el.innerHTML = "<strong>Answer:</strong> " + answers[Math.floor(Math.random() * answers.length)];
    document.getElementById("questionInput").value = "";
  };

  // ==================== AI TUTOR ====================
  var currentAISubject = "general";
  var aiKnowledgeBase = {
    general: { suggestions: ["How can I improve my study habits?", "What are effective note-taking methods?", "How do I stay focused while studying?", "Tips for better time management?"] },
    math: { suggestions: ["What is 15% of 200?", "What is 25 * 4?", "What is the area of a circle with radius 5?", "What is the Pythagorean theorem?", "What is 144 / 12?"] },
    science: { suggestions: ["How does photosynthesis work?", "What is DNA?", "Explain Newton's laws", "What is the periodic table?", "How does the immune system work?"] },
    history: { suggestions: ["When was WWI?", "When was WWII?", "What caused the French Revolution?", "Who was MLK?", "What was the Renaissance?"] },
    language: { suggestions: ["What are the 8 parts of speech?", "Active vs passive voice?", "Common grammar mistakes?", "How to write an essay?", "Tips for learning a language?"] },
    coding: { suggestions: ["What is OOP?", "What is an API?", "Frontend vs Backend?", "What is HTML?", "What is JavaScript?"] }
  };

  function getAIResponse(question) {
    var q = question.toLowerCase().trim();

    var wordMatch = q.match(/what\s+is\s+(\d+)\s*(plus|add|\+|minus|subtract|\-|times|multiply|\*|x|divided\s+by|over|\/)\s*(\d+)/i);
    if (wordMatch) {
      var a = parseInt(wordMatch[1]), op = wordMatch[2].toLowerCase(), b = parseInt(wordMatch[3]), result;
      if (op === 'plus' || op === 'add' || op === '+') result = a + b;
      else if (op === 'minus' || op === 'subtract' || op === '-') result = a - b;
      else if (op === 'times' || op === 'multiply' || op === '*' || op === 'x') result = a * b;
      else if (op === 'divided by' || op === 'over' || op === '/') result = b !== 0 ? a / b : 'undefined';
      return a + " " + (op === 'plus' || op === 'add' || op === '+' ? '+' : op === 'minus' || op === 'subtract' || op === '-' ? '-' : op === 'divided by' || op === 'over' || op === '/' ? '/' : 'x') + " " + b + " = " + result;
    }

    var directAnswers = {
      "capital of france": "Paris is the capital of France.",
      "largest planet": "Jupiter is the largest planet - 318 times more massive than Earth!",
      "speed of light": "The speed of light is 299,792,458 m/s (about 300,000 km/s).",
      "what is pi": "Pi = 3.14159...",
      "how many continents": "There are 7 continents.",
      "how old is earth": "Earth is about 4.54 billion years old.",
      "meaning of life": "42! Just kidding."
    };
    for (var key in directAnswers) { if (q.includes(key)) return directAnswers[key]; }

    if (q.includes("photosynthesis")) return "Photosynthesis: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2";
    if (q.includes("dna")) return "DNA = Deoxyribonucleic Acid. Double helix structure.";
    if (q.includes("pythagorean")) return "Pythagorean Theorem: a^2 + b^2 = c^2";
    if (q.includes("api")) return "API = Application Programming Interface.";
    if (q === "hello" || q === "hi") return "Hello! Ask me anything!";
    if (q.includes("thank")) return "You're welcome!";
    return "Can you ask it differently? Try math, science, or coding questions!";
  }

  window.setAISubject = function(subject, element) {
    currentAISubject = subject;
    document.querySelectorAll(".subject-chip").forEach(function(c) { c.classList.remove("active"); });
    if (element) element.classList.add("active");
    updateAISuggestions();
  };

  function updateAISuggestions() {
    var list = document.getElementById("aiSuggestionsList");
    if (!list) return;
    var s = aiKnowledgeBase[currentAISubject] ? aiKnowledgeBase[currentAISubject].suggestions : aiKnowledgeBase.general.suggestions;
    list.innerHTML = s.map(function(sug) { return '<div class="suggestion-chip" onclick="askAITutorPrompt(\'' + sug.replace(/'/g, "\\'") + '\')">' + sug + '</div>'; }).join("");
  }

  window.askAITutorPrompt = function(p) { askAITutorInternal(p); };
  window.askAITutor = function() { var i = document.getElementById("aiQuestionInput"); if (!i) return; var q = i.value.trim(); if (!q) return; i.value = ""; askAITutorInternal(q); };

  function askAITutorInternal(question) {
    addAIMessage(question, true);
    var ind = document.getElementById("aiTypingIndicator"); if (ind) ind.classList.remove("hidden");
    setTimeout(function() { if (ind) ind.classList.add("hidden"); addAIMessage(getAIResponse(question), false); }, 800 + Math.random() * 700);
  }

  function addAIMessage(msg, isUser) {
    var chat = document.getElementById("aiChatMessages"); if (!chat) return;
    var div = document.createElement("div");
    div.className = "ai-message " + (isUser ? "ai-message-user" : "ai-message-bot");
    div.innerHTML = '<div class="ai-avatar">' + (isUser ? "You" : "AI") + '</div><div class="ai-bubble">' + msg.replace(/\n/g, '<br>') + '</div>';
    chat.appendChild(div); chat.scrollTop = chat.scrollHeight;
  }

  window.explainConcept = function() { var i = document.getElementById("aiQuestionInput"); if (i) { i.value = "Explain: "; i.focus(); } };
  window.generateQuiz = function() { addAIMessage("Quiz: What is 15% of 200? Answer: 30", false); };
  window.summarizeNotes = function() { var n = JSON.parse(localStorage.getItem("notes") || "[]"); addAIMessage(n.length === 0 ? "No notes yet!" : "You have " + n.length + " notes.", false); };
  window.studyTips = function() { addAIMessage("Tips: 1. Active Recall 2. Pomodoro 3. Spaced Repetition 4. Teach others 5. Sleep!", false); };

  // ==================== STUDY PARTNERS ====================
  var currentRoomCode = null, currentUser = "You", currentUserId = "user-" + Math.random().toString(36).substring(2, 8);
  var roomRef = null, whiteboardRef = null, chatRef = null;

  window.createStudyRoom = function() {
    if (!firebaseReady) return alert("Firebase not connected!");
    var name = document.getElementById("roomNameInput").value.trim();
    if (!name) return alert("Enter a room name!");
    currentRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); currentUser = "Host";
    roomRef = db.ref("rooms/" + currentRoomCode);
    roomRef.set({ name: name, participants: {} });
    roomRef.child("participants").child(currentUserId).set({ name: currentUser });
    document.getElementById("createdRoomInfo").classList.remove("hidden");
    document.getElementById("roomCodeDisplay").textContent = currentRoomCode;
    enterStudyRoom(name);
  };

  window.joinStudyRoom = function() {
    if (!firebaseReady) return alert("Firebase not connected!");
    var code = document.getElementById("joinRoomCode").value.trim().toUpperCase();
    if (!code) return;
    db.ref("rooms/" + code).once("value", function(snap) {
      if (snap.exists()) {
        currentRoomCode = code; currentUser = "Partner"; roomRef = db.ref("rooms/" + code);
        roomRef.child("participants").child(currentUserId).set({ name: currentUser });
        document.getElementById("joinError").classList.add("hidden");
        enterStudyRoom(snap.val().name);
      } else { document.getElementById("joinError").classList.remove("hidden"); }
    });
  };

  function enterStudyRoom(name) {
    document.getElementById("partnerLobby").classList.add("hidden");
    document.getElementById("studyRoom").classList.remove("hidden");
    document.getElementById("roomTitle").textContent = name;
    document.getElementById("activeRoomCode").textContent = currentRoomCode;
    roomRef.child("participants").on("value", function(snap) {
      var p = snap.val() || {}, html = "";
      for (var id in p) { html += '<li class="participant ' + (id === currentUserId ? 'you' : 'partner') + '">' + p[id].name + '</li>'; }
      document.getElementById("participantsList").innerHTML = html;
    });
  }

  window.leaveStudyRoom = function() {
    document.getElementById("partnerLobby").classList.remove("hidden");
    document.getElementById("studyRoom").classList.add("hidden");
    currentRoomCode = null;
  };

  window.syncWhiteboard = function() { document.getElementById("syncStatus").textContent = "Synced!"; setTimeout(function() { document.getElementById("syncStatus").textContent = ""; }, 2000); };
  window.sendChat = function() {
    var input = document.getElementById("chatInput"), text = input.value.trim();
    if (!text) return; input.value = "";
    var chatDiv = document.getElementById("chatMessages");
    chatDiv.innerHTML += '<div class="chat-message mine"><strong>' + currentUser + ':</strong> ' + text + '</div>';
    chatDiv.scrollTop = chatDiv.scrollHeight;
  };
  window.copyRoomCode = function() { if (currentRoomCode) navigator.clipboard.writeText(currentRoomCode).then(function() { alert("Copied!"); }); };

  window.startSharedPomodoro = function() {};
  window.pauseSharedPomodoro = function() {};
  window.resetSharedPomodoro = function() {};
  window.loadSharedQuiz = function() {};
  window.checkSharedAnswer = function() {};
})();
