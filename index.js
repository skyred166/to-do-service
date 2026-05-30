// Получение DOM-элементов
const formElement = document.getElementById('to-do-form');
const inputElement = document.getElementById('to-do-input');
const descriptionElement = document.getElementById('to-do-description');
const scheduleElement = document.getElementById('to-do-schedule');
const listElement = document.getElementById('to-do-list');
const templateElement = document.getElementById('to-do__item-template');
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');

// Элементы модального окна
const modalElement = document.getElementById('task-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalCloseButton = document.getElementById('modal-close-button');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalSchedule = document.getElementById('modal-schedule');
const modalStatus = document.getElementById('modal-status');

// Переменная для отслеживания перетаскивания
let draggedElement = null;

// Исходный список задач
const defaultItems = [
  { text: 'Позвонить другу', description: 'Позвонить старому другу и узнать как дела', schedule: '', completed: false },
  { text: 'Купить продукты', description: 'Молоко, хлеб, яйца, помидоры', schedule: '', completed: false },
  { text: 'Написать письмо', description: 'Отправить деловое письмо по проекту', schedule: '', completed: false },
  { text: 'Сделать зарядку', description: '30 минут упражнений по утрам', schedule: '', completed: false },
  { text: 'Помыть посуду', description: 'Вымыть всю грязную посуду на кухне', schedule: '', completed: false },
  { text: 'Прочитать статью', description: 'Прочитать новую статью про веб-разработку', schedule: '', completed: false }
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
    const descriptionElement = item.querySelector('.to-do__item-description');
    const scheduleElement = item.querySelector('.to-do__item-schedule');
    const checkboxElement = item.querySelector('.to-do__item-checkbox');
    tasks.push({
      text: textElement.textContent,
      description: descriptionElement.dataset.description || '',
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

// Функция для открытия модального окна
function openModal(taskData) {
  modalTitle.textContent = taskData.text;
  modalDescription.textContent = taskData.description || 'Описание отсутствует';
  modalSchedule.textContent = taskData.schedule || 'Не установлено';
  modalStatus.textContent = taskData.completed ? '✅ Выполнено' : '⏳ В процессе';
  
  modalElement.classList.remove('modal--hidden');
}

// Функция для закрытия модального окна
function closeModal() {
  modalElement.classList.add('modal--hidden');
}

// Обработчики закрытия модального окна
modalClose.addEventListener('click', closeModal);
modalCloseButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Закрытие при нажатии Escape
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && !modalElement.classList.contains('modal--hidden')) {
    closeModal();
  }
});

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
  const descriptionDisplayElement = clone.querySelector('.to-do__item-description');
  const scheduleDisplayElement = clone.querySelector('.to-do__item-schedule');
  const viewButton = clone.querySelector('.to-do__item-button_type_view');
  const deleteButton = clone.querySelector('.to-do__item-button_type_delete');
  const duplicateButton = clone.querySelector('.to-do__item-button_type_duplicate');
  const editButton = clone.querySelector('.to-do__item-button_type_edit');

  // Устанавливаем данные задачи
  textElement.textContent = taskData.text;
  descriptionDisplayElement.textContent = taskData.description ? `📝 ${taskData.description.substring(0, 50)}...` : '';
  descriptionDisplayElement.dataset.description = taskData.description;
  scheduleDisplayElement.textContent = formatSchedule(taskData.schedule);
  checkboxElement.checked = taskData.completed;

  // Добавляем класс для выполненной задачи
  if (taskData.completed) {
    itemElement.classList.add('completed');
  }

  // Обработчик для просмотра деталей
  viewButton.addEventListener('click', () => {
    openModal(taskData);
  });

  // Обработчик для отметки выполнения
  checkboxElement.addEventListener('change', () => {
    itemElement.classList.toggle('completed');
    taskData.completed = checkboxElement.checked;
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
      description: taskData.description,
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
    taskData.text = textElement.textContent;
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
    description: descriptionElement.value.trim(),
    schedule: scheduleElement.value,
    completed: false
  };

  const newItem = createItem(newTask);
  listElement.prepend(newItem);

  const tasks = getTasksFromDOM();
  saveTasks(tasks);
  updateStats();

  inputElement.value = '';
  descriptionElement.value = '';
  scheduleElement.value = '';
});

// Инициализация приложения при загрузке страницы
const tasks = loadTasks();
tasks.forEach((task) => {
  const itemElement = createItem(task);
  listElement.append(itemElement);
});

updateStats();
