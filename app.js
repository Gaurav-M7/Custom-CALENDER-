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

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker Registered"));
  }
});

// =============================================
// TAB SWITCHING
// =============================================
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

// =============================================
// HOME TAB
// =============================================
function renderHome() {
  const todayStr = getTodayStr();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('home-today-date').innerText = new Date().toLocaleDateString('en-US', options);

  // Today's Tasks
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const todayContainer = document.getElementById('home-today-tasks');
  const countEl = document.getElementById('today-task-count');

  const pending = todayTasks.filter(t => !t.completed).length;
  countEl.innerText = todayTasks.length === 0
    ? '0 tasks'
    : `${pending} remaining · ${todayTasks.length} total`;

  todayContainer.innerHTML = '';
  if (todayTasks.length === 0) {
    todayContainer.innerHTML = '<p class="empty-msg">Nothing scheduled — enjoy your day! 🎉</p>';
  } else {
    todayTasks.forEach(task => todayContainer.appendChild(createTaskElement(task, renderHome)));
  }

  // Upcoming (Next 7 Days)
  const upcomingContainer = document.getElementById('home-upcoming-tasks');
  upcomingContainer.innerHTML = '';
  let hasUpcoming = false;

  for (let i = 1; i <= 7; i++) {
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + i);
    let nextDateStr = formatDateStr(nextDate);
    let dayTasks = tasks.filter(t => t.date === nextDateStr);

    if (dayTasks.length > 0) {
      hasUpcoming = true;
      const dayGroup = document.createElement('div');
      dayGroup.className = 'upcoming-day-group';

      const title = document.createElement('div');
      title.className = 'upcoming-day-title';
      title.innerText = nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

      const list = document.createElement('div');
      list.className = 'task-list';
      dayTasks.forEach(task => list.appendChild(createTaskElement(task, renderHome)));

      dayGroup.appendChild(title);
      dayGroup.appendChild(list);
      upcomingContainer.appendChild(dayGroup);
    }
  }

  if (!hasUpcoming) {
    upcomingContainer.innerHTML = '<p class="empty-msg" style="padding: 4px;">Nothing coming up this week.</p>';
  }
}

// =============================================
// CALENDAR TAB
// =============================================
function setupCalendar() {
  document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days');
  daysContainer.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = getTodayStr();

  monthYearLabel.innerText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let x = 0; x < firstDayIndex; x++) {
    daysContainer.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.innerText = day;

    const thisDateStr = formatDateStr(new Date(year, month, day));
    dayDiv.dataset.date = thisDateStr;

    if (tasks.some(t => t.date === thisDateStr)) dayDiv.classList.add('has-task');
    if (thisDateStr === selectedDateStr) dayDiv.classList.add('selected');
    if (thisDateStr === todayStr) dayDiv.classList.add('today-day');

    const today = new Date(); today.setHours(0,0,0,0);
    const thisDay = new Date(year, month, day);
    if (thisDay < today) dayDiv.classList.add('past-day');

    dayDiv.addEventListener('click', () => {
      document.querySelectorAll('.calendar-days div').forEach(d => d.classList.remove('selected'));
      dayDiv.classList.add('selected');
      selectDate(thisDateStr);
    });

    daysContainer.appendChild(dayDiv);
  }
}

function selectDate(dateStr) {
  selectedDateStr = dateStr;
  const displayDate = new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
  document.getElementById('selected-date-label').innerText = displayDate;
  document.getElementById('add-task-form').classList.remove('hidden');
  renderSelectedDateTasks();
}

function renderSelectedDateTasks() {
  const container = document.getElementById('selected-date-tasks');
  container.innerHTML = '';
  const filtered = tasks.filter(t => t.date === selectedDateStr);
  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-msg">No tasks for this day.</p>';
  } else {
    filtered.forEach(task => container.appendChild(createTaskElement(task, () => {
      renderSelectedDateTasks();
      renderCalendar();
    })));
  }
}

// =============================================
// ALL TODOS TAB
// =============================================
function renderAllTodos() {
  const container = document.getElementById('all-todos-list');
  const countEl = document.getElementById('all-tasks-count');
  container.innerHTML = '';

  countEl.innerText = tasks.length;

  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your list is pristine ✨</p>';
    return;
  }

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedTasks.forEach(task => {
    const el = createTaskElement(task, renderAllTodos);
    const dateTag = document.createElement('span');
    dateTag.className = 'task-date-tag';
    const d = new Date(task.date + 'T00:00:00');
    dateTag.innerText = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    el.appendChild(dateTag);
    container.appendChild(el);
  });
}

// =============================================
// TASK FORM
// =============================================
function setupTaskForm() {
  document.getElementById('add-task-btn').addEventListener('click', () => {
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
    renderCalendar();
  });

  document.getElementById('task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('add-task-btn').click();
  });
}

// =============================================
// TASK ELEMENT FACTORY
// =============================================
function createTaskElement(task, onUpdate) {
  const div = document.createElement('div');
  div.className = `task-item ${task.completed ? 'completed' : ''}`;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    saveTasks();
    div.classList.toggle('completed', task.completed);
    span.classList.toggle('completed', task.completed);
    if (onUpdate) onUpdate();
  });

  // Title
  const span = document.createElement('span');
  span.className = 'task-title';
  span.innerText = task.title;

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete task';
  deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    div.style.opacity = '0';
    div.style.transform = 'translateX(16px)';
    div.style.transition = '0.2s ease';
    setTimeout(() => {
      div.remove();
      if (onUpdate) onUpdate();
    }, 200);
  });

  div.appendChild(checkbox);
  div.appendChild(span);
  div.appendChild(deleteBtn);
  return div;
}

// =============================================
// PERSIST
// =============================================
function saveTasks() {
  localStorage.setItem('pwa_tasks', JSON.stringify(tasks));
}
