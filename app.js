const STORAGE_KEY = 'cloudy-day-planner-tasks';
const form = document.querySelector('#task-form');
const list = document.querySelector('#task-list');
const empty = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');
const puffball = document.querySelector('#puffball');
const companionMessage = document.querySelector('#companion-message');
const companionDetail = document.querySelector('#companion-detail');
const dateInput = form.elements.date;

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);
dateInput.value = isoToday;
dateInput.min = isoToday;
document.querySelector('#today-label').textContent = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function formatDue(task) {
  const date = new Date(`${task.date}T${task.time}`);
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
function render() {
  list.replaceChildren();
  tasks.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  tasks.forEach(task => {
    const item = document.createElement('article');
    item.className = 'task';
    item.innerHTML = `<button class="check" aria-label="Mark assignment complete">✓</button><div class="task-info"><p class="task-name"></p><p class="task-due">Due ${formatDue(task)}</p></div><button class="delete" aria-label="Delete assignment">×</button>`;
    item.querySelector('.task-name').textContent = task.name;
    item.querySelector('.check').addEventListener('click', () => complete(task.id, item));
    item.querySelector('.delete').addEventListener('click', () => remove(task.id));
    list.appendChild(item);
  });
  empty.hidden = tasks.length !== 0;
  count.textContent = `${tasks.length} ${tasks.length === 1 ? 'assignment' : 'assignments'} left`;
}
function complete(id, item) {
  item.classList.add('completing');
  setTimeout(() => { tasks = tasks.filter(task => task.id !== id); save(); render(); }, 280);
  puffball.classList.remove('celebrate'); void puffball.offsetWidth; puffball.classList.add('celebrate');
  companionMessage.textContent = 'Yay, you did it!'; companionDetail.textContent = 'Your progress is worth celebrating.';
  setTimeout(() => { companionMessage.textContent = 'You’ve got this!'; companionDetail.textContent = 'Small steps still move you forward.'; }, 2600);
}
function remove(id) { tasks = tasks.filter(task => task.id !== id); save(); render(); }
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  if (!name || !data.get('date') || !data.get('time')) return;
  tasks.push({ id: createId(), name, date: data.get('date'), time: data.get('time') });
  save();
  render();
  form.reset();
  dateInput.value = isoToday;
  form.elements.name.focus();
});
render();
