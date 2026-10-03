// ================================
// DAILYNOTE JAVASCRIPT
// ================================

let notes = JSON.parse(localStorage.getItem("dailyNotes")) || [];
let tasks = JSON.parse(localStorage.getItem("dailyTasks")) || [];
let moods = JSON.parse(localStorage.getItem("dailyMoods")) || [];

let selectedMood = null;

let currentCalendarDate = new Date();


// ================================
// INIT
// ================================

document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  updateGreeting();
  renderNotes();
  renderTasks();
  renderMoodHistory();
  renderCalendar();
  updateStatistics();
  loadProfile();
  loadDarkMode();
});


// ================================
// PAGE NAVIGATION
// ================================

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageName);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  const nav = document.querySelector(
    `.nav-item[data-page="${pageName}"]`
  );

  if (nav) {
    nav.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageName === "calendar") {
    renderCalendar();
  }

  if (pageName === "stats") {
    updateStatistics();
  }

  if (pageName === "profile") {
    loadProfile();
  }
}


function openSettings() {
  showPage("settings");

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
}


// ================================
// DATE & GREETING
// ================================

function updateDate() {

  const now = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  document.getElementById("todayText").textContent =
    now.toLocaleDateString("id-ID", options);
}


function updateGreeting() {

  const hour = new Date().getHours();

  let greeting = "Selamat malam 🌙";

  if (hour >= 5 && hour < 11) {
    greeting = "Selamat pagi ☀️";
  } else if (hour >= 11 && hour < 15) {
    greeting = "Selamat siang 🌤️";
  } else if (hour >= 15 && hour < 18) {
    greeting = "Selamat sore 🌅";
  }

  document.getElementById("greeting").textContent = greeting;
}


// ================================
// NOTES
// ================================

function openNoteModal() {

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";

  document.getElementById("noteModal").classList.add("show");
}


function saveNote() {

  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const category = document.getElementById("noteCategory").value;

  if (!title || !content) {
    alert("Judul dan isi catatan harus diisi.");
    return;
  }

  const note = {
    id: Date.now(),
    title: title,
    content: content,
    category: category,
    date: getTodayKey(),
    createdAt: new Date().toISOString()
  };

  notes.unshift(note);

  saveData();

  closeModal("noteModal");

  renderNotes();
  updateStatistics();

  alert("Catatan berhasil disimpan 💜");
}


function renderNotes() {

  const list = document.getElementById("notesList");
  const empty = document.getElementById("emptyNotes");

  list.innerHTML = "";

  if (notes.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  notes.forEach(note => {

    const div = document.createElement("div");

    div.className = "note-card";

    div.innerHTML = `
      <div class="note-top">
        <span class="note-category">${note.category}</span>

        <button class="delete-btn"
          onclick="deleteNote(${note.id})">
          🗑️
        </button>
      </div>

      <h3>${escapeHTML(note.title)}</h3>

      <p>${escapeHTML(note.content)}</p>

      <div class="note-date">
        ${formatDate(note.date)}
      </div>
    `;

    list.appendChild(div);
  });

  document.getElementById("noteCount").textContent = notes.length;
}


function deleteNote(id) {

  if (!confirm("Hapus catatan ini?")) return;

  notes = notes.filter(note => note.id !== id);

  saveData();
  renderNotes();
  updateStatistics();
}


// ================================
// TASK
// ================================

function openTaskModal() {

  document.getElementById("taskInput").value = "";

  document.getElementById("taskModal").classList.add("show");
}


function saveTask() {

  const title = document.getElementById("taskInput").value.trim();
  const priority = document.getElementById("taskPriority").value;

  if (!title) {
    alert("Masukkan kegiatan terlebih dahulu.");
    return;
  }

  tasks.push({
    id: Date.now(),
    title: title,
    priority: priority,
    completed: false,
    date: getTodayKey()
  });

  saveData();

  closeModal("taskModal");

  renderTasks();
  updateStatistics();
}


function renderTasks() {

  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyTasks");

  list.innerHTML = "";

  if (tasks.length === 0) {
    empty.style.display = "block";
    updateProgress();
    return;
  }

  empty.style.display = "none";

  tasks.forEach(task => {

    const div = document.createElement("div");

    div.className =
      "task-card " + (task.completed ? "completed" : "");

    div.innerHTML = `

      <button
        class="task-check ${task.completed ? "done" : ""}"
        onclick="toggleTask(${task.id})">

        ${task.completed ? "✓" : ""}

      </button>

      <div class="task-info">

        <b>${escapeHTML(task.title)}</b>

        <small>
          ${task.priority} • ${formatDate(task.date)}
        </small>

      </div>

      <button
        class="delete-btn"
        onclick="deleteTask(${task.id})">
        🗑️
      </button>
    `;

    list.appendChild(div);
  });

  updateProgress();
}


function toggleTask(id) {

  const task = tasks.find(t => t.id === id);

  if (task) {
    task.completed = !task.completed;
  }

  saveData();
  renderTasks();
  updateStatistics();
}


function deleteTask(id) {

  if (!confirm("Hapus kegiatan ini?")) return;

  tasks = tasks.filter(task => task.id !== id);

  saveData();
  renderTasks();
  updateStatistics();
}


function updateProgress() {

  const total = tasks.length;

  const completed =
    tasks.filter(task => task.completed).length;

  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progressFill").style.width =
    percentage + "%";

  document.getElementById("progressText").textContent =
    percentage + "%";

  document.getElementById("taskCount").textContent =
    completed;
}


// ================================
// MOOD
// ================================

function selectMood(emoji, name) {

  selectedMood = {
    emoji: emoji,
    name: name
  };

  document.getElementById("selectedMood").textContent =
    emoji + "  " + name;
}


function saveMood() {

  if (!selectedMood) {
    alert("Pilih mood terlebih dahulu.");
    return;
  }

  const note =
    document.getElementById("moodNote").value.trim();

  const today = getTodayKey
