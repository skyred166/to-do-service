// Получение DOM-элементов
const formElement = document.getElementById('to-do-form');
const inputElement = document.getElementById('to-do-input');
const scheduleElement = document.getElementById('to-do-schedule');
const listElement = document.getElementById('to-do-list');
const templateElement = document.getElementById('to-do__item-template');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');

// Переменная для отслеживания перетаскивания
let draggedElement = null;

// Исходный список задач
const defaultItems = [
  { text: 'Позвонить другу', schedule: '', completed: false },
  { text: 'Купить продукты', schedule: '', completed: false },
  { text: 'Написать письмо', schedule: '', completed: false },
  { text: 'Сделать зарядку', schedule: '', completed: false },
  { text: 'Помыть посуду', schedule: '', completed: false },
  { text: 'Прочитать статью', schedule: '', completed: false }
];

// Функция для получения задач из локального хранилища или возврата исходного списка
function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    return JSON.parse(savedTasks);
  }
  return defaultItems;
}

// Функция для сохранения задач в локальное хранилище
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Функция для получения списка задач из разметки
function getTasksFromDOM() {
  const items = document.querySelectorAll('.to-do__item');
  const tasks = [];
  items.forEach((item) => {
    const textElement = item.querySelector('.to-do__item-text');
    const scheduleElement = item.querySelector('.to-do__item-schedule');
    const checkboxElement = item.querySelector('.to-do__item-checkbox');
    tasks.push({
      text: textElement.textContent,
      schedule: scheduleElement.textContent,
      completed: checkboxElement.checked
    });
  });
  return tasks;
}

// Функция для обновления статистики
function updateStats() {
  const tasks = getTasksFromDOM();
  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  totalTasksElement.textContent = `Всего: ${totalCount}`;
  completedTasksElement.textContent = `Выполнено: ${completedCount}`;
}

// Функция для форматирования даты расписания
function formatSchedule(scheduleDateTime) {
  if (!scheduleDateTime) return '';
  const date = new Date(scheduleDateTime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `📅 ${day}.${month} ${hours}:${minutes}`;
}

// Функция для добавления обработчиков перетаскивания
function addDragHandlers(itemElement) {
  itemElement.addEventListener('dragstart', (evt) => {
    draggedElement = itemElement;
    itemElement.classList.add('dragging');
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/html', itemElement.innerHTML);
  });

  itemElement.addEventListener('dragend', () => {
    itemElement.classList.remove('dragging');
    document.querySelectorAll('.to-do__item').forEach((item) => {
      item.classList.remove('drag-over');
    });
    draggedElement = null;
  });

  itemElement.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    
    if (draggedElement && draggedElement !== itemElement) {
      itemElement.classList.add('drag-over');
    }
  });

  itemElement.addEventListener('dragleave', (evt) => {
    if (evt.target === itemElement) {
      itemElement.classList.remove('drag-over');
    }
  });

  itemElement.addEventListener('drop', (evt) => {
    evt.preventDefault();
    
    if (draggedElement && draggedElement !== itemElement) {
      const allItems = Array.from(document.querySelectorAll('.to-do__item'));
      const draggedIndex = allItems.indexOf(draggedElement);
      const targetIndex = allItems.indexOf(itemElement);

      if (draggedIndex < targetIndex) {
        itemElement.parentNode.insertBefore(draggedElement, itemElement.nextSibling);
      } else {
        itemElement.parentNode.insertBefore(draggedElement, itemElement);
      }

      const tasks = getTasksFromDOM();
      saveTasks(tasks);
    }

    itemElement.classList.remove('drag-over');
  });
}

// Функция для создания элемента задачи
function createItem(taskData) {
  const clone = templateElement.content.cloneNode(true);
  const itemElement = clone.querySelector('.to-do__item');
  const checkboxElement = clone.querySelector('.to-do__item-checkbox');
  const textElement = clone.querySelector('.to-do__item-text');
  const scheduleDisplayElement = clone.querySelector('.to-do__item-schedule');
  const deleteButton = clone.querySelector('.to-do__item-button_type_delete');
  const duplicateButton = clone.querySelector('.to-do__item-button_type_duplicate');
  const editButton = clone.querySelector('.to-do__item-button_type_edit');

  // Устанавливаем данные задачи
  textElement.textContent = taskData.text;
  scheduleDisplayElement.textContent = formatSchedule(taskData.schedule);
  checkboxElement.checked = taskData.completed;

  // Добавляем класс для выполненной задачи
  if (taskData.completed) {
    itemElement.classList.add('completed');
  }

  // Обработчик для отметки выполнения
  checkboxElement.addEventListener('change', () => {
    itemElement.classList.toggle('completed');
    const tasks = getTasksFromDOM();
    saveTasks(tasks);
    updateStats();
  });

  // Обработчик для удаления задачи
  deleteButton.addEventListener('click', () => {
    itemElement.remove();
    const tasks = getTasksFromDOM();
    saveTasks(tasks);
    updateStats();
  });

  // Обработчик для копирования задачи
  duplicateButton.addEventListener('click', () => {
    const newTask = {
      text: taskData.text,
      schedule: taskData.schedule,
      completed: false
    };
    const newItem = createItem(newTask);
    listElement.prepend(newItem);
    const tasks = getTasksFromDOM();
    saveTasks(tasks);
    updateStats();
  });

  // Обработчик для редактирования задачи
  editButton.addEventListener('click', () => {
    textElement.setAttribute('contenteditable', 'true');
    textElement.focus();
  });

  // Обработчик для сохранения изменений при потере фокуса
  textElement.addEventListener('blur', () => {
    textElement.setAttribute('contenteditable', 'false');
    const tasks = getTasksFromDOM();
    saveTasks(tasks);
  });

  // Добавляем обработчики перетаскивания
  addDragHandlers(itemElement);

  return clone;
}

// Обработчик отправки формы
formElement.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const taskText = inputElement.value.trim();
  if (taskText === '') {
    return;
  }

  const newTask = {
    text: taskText,
    schedule: scheduleElement.value,
    completed: false
  };

  const newItem = createItem(newTask);
  listElement.prepend(newItem);

  const tasks = getTasksFromDOM();
  saveTasks(tasks);
  updateStats();

  inputElement.value = '';
  scheduleElement.value = '';
});

// Инициализация приложения при загрузке страницы
const tasks = loadTasks();
tasks.forEach((task) => {
  const itemElement = createItem(task);
  listElement.append(itemElement);
});

updateStats();
