// State Management
let tasks = JSON.parse(localStorage.getItem('pwa_tasks')) || [];
let currentDate = new Date();
let selectedDateStr = "";

// Format Helpers
const formatDateStr = (date) => date.toISOString().split('T')[0];
const getTodayStr = () => formatDateStr(new Date());

// Init App
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupCalendar();
  setupTaskForm();
  renderHome();
  
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker Registered"));
  }
});

// Tab Switching functionality
function setupTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      
      const targetTab = e.currentTarget.getAttribute('data-tab');
      e.currentTarget.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
      
      if (targetTab === 'home') renderHome();
      if (targetTab === 'dates') renderCalendar();
      if (targetTab === 'todos') renderAllTodos();
    });
  });
}

// HOME TAB RENDERING
function renderHome() {
  const todayStr = getTodayStr();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  document.getElementById('home-today-date').innerText = new Date().toLocaleDateString('en-US', options);

  // Today's Tasks
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const todayContainer = document.getElementById('home-today-tasks');
  todayContainer.innerHTML = todayTasks.length ? '' : '<p style="color:var(--text-muted)">No tasks for today!</p>';
  todayTasks.forEach(task => todayContainer.appendChild(createTaskElement(task)));

  // Upcoming Days Tasks (Next 7 Days)
  const upcomingContainer = document.getElementById('home-upcoming-tasks');
  upcomingContainer.innerHTML = '';
  
  for (let i = 1; i <= 7; i++) {
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + i);
    let nextDateStr = formatDateStr(nextDate);
    let dayTasks = tasks.filter(t => t.date === nextDateStr);
    
    if (dayTasks.length > 0) {
      const dayGroup = document.createElement('div');
      dayGroup.className = 'upcoming-day-group card';
      dayGroup.innerHTML = `<div class="upcoming-day-title">${nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>`;
      
      const list = document.createElement('div');
      list.className = 'task-list';
      dayTasks.forEach(task => list.appendChild(createTaskElement(task)));
      
      dayGroup.appendChild(list);
      upcomingContainer.appendChild(dayGroup);
    }
  }
  if(upcomingContainer.innerHTML === '') {
    upcomingContainer.innerHTML = '<p style="color:var(--text-muted); padding: 10px;">No upcoming tasks code for the next 7 days.</p>';
  }
}

// CALENDAR TAB RENDERING
function setupCalendar() {
  document.getElementById('prev-month').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
  document.getElementById('next-month').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
}

function renderCalendar() {
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days');
  daysContainer.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearLabel.innerText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // Padding days for previous month offset
  for (let x = 0; x < firstDayIndex; x++) {
    const emptyDiv = document.createElement('div');
    daysContainer.appendChild(emptyDiv);
  }

  // Current month's days
  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.innerText = day;
    
    const thisDateStr = formatDateStr(new Date(year, month, day));
    dayDiv.dataset.date = thisDateStr;

    // Check if day has tasks
    if (tasks.some(t => t.date === thisDateStr)) {
      dayDiv.classList.add('has-task');
    }

    if (thisDateStr === selectedDateStr) {
      dayDiv.classList.add('selected');
    }

    dayDiv.addEventListener('click', (e) => {
      document.querySelectorAll('.calendar-days div').forEach(d => d.classList.remove('selected'));
      e.target.classList.add('selected');
      selectDate(thisDateStr);
    });

    daysContainer.appendChild(dayDiv);
  }
}

function selectDate(dateStr) {
  selectedDateStr = dateStr;
  const displayDate = new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  document.getElementById('selected-date-label').innerText = `Tasks for ${displayDate}`;
  document.getElementById('add-task-form').classList.remove('hidden');
  renderSelectedDateTasks();
}

function renderSelectedDateTasks() {
  const container = document.getElementById('selected-date-tasks');
  container.innerHTML = '';
  const filtered = tasks.filter(t => t.date === selectedDateStr);
  filtered.forEach(task => container.appendChild(createTaskElement(task)));
}

// TODO TAB RENDERING (ALL TODOS)
function renderAllTodos() {
  const container = document.getElementById('all-todos-list');
  container.innerHTML = tasks.length ? '' : '<p style="color:var(--text-muted)">Your dynamic master checklist is clean!</p>';
  
  // Sort tasks chronologically
  const sortedTasks = [...tasks].sort((a,b) => new Date(a.date) - new Date(b.date));
  
  sortedTasks.forEach(task => {
    const el = createTaskElement(task);
    const dateTag = document.createElement('span');
    dateTag.className = 'task-date-tag';
    dateTag.innerText = task.date;
    el.appendChild(dateTag);
    container.appendChild(el);
  });
}

// TASK ACTIONS & FACTORY
function setupTaskForm() {
  document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-input');
    if (!input.value.trim() || !selectedDateStr) return;

    const newTask = {
      id: Date.now(),
      title: input.value.trim(),
      date: selectedDateStr,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    input.value = '';
    renderSelectedDateTasks();
    renderCalendar(); // updates task dots
  });
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = `task-item ${task.completed ? 'completed' : ''}`;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    saveTasks();
    div.classList.toggle('completed', task.completed);
  });

  const span = document.createElement('span');
  span.innerText = task.title;

  div.appendChild(checkbox);
  div.appendChild(span);
  return div;
}

function saveTasks() {
  localStorage.setItem('pwa_tasks', JSON.stringify(tasks));
}
