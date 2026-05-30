// Получение DOM-элементов
const formElement = document.getElementById('to-do-form');
const inputElement = document.getElementById('to-do-input');
const listElement = document.getElementById('to-do-list');
const templateElement = document.getElementById('to-do__item-template');

// Исходный список задач
let items = [
  'Позвонить другу',
  'Купить продукты',
  'Написать письмо',
  'Сделать зарядку',
  'Помыть посуду',
  'Прочитать статью'
];

// Функция для получения задач из локального хранилища или возврата исходного списка
function loadTasks() {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    return JSON.parse(savedTasks);
  }
  return items;
}

// Функция для сохранения задач в локальное хранилище
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Функция для получения списка задач из разметки
function getTasksFromDOM() {
  const itemsNamesElements = document.querySelectorAll('.to-do__item-text');
  const tasks = [];
  itemsNamesElements.forEach((element) => {
    tasks.push(element.textContent);
  });
  return tasks;
}

// Функция для создания элемента задачи
function createItem(item) {
  const clone = templateElement.content.cloneNode(true);
  const textElement = clone.querySelector('.to-do__item-text');
  const deleteButton = clone.querySelector('.to-do__item-button_type_delete');
  const duplicateButton = clone.querySelector('.to-do__item-button_type_duplicate');
  const editButton = clone.querySelector('.to-do__item-button_type_edit');

  // Устанавливаем текст задачи
  textElement.textContent = item;

  // Обработчик для удаления задачи
  deleteButton.addEventListener('click', () => {
    clone.querySelector('.to-do__item').remove();
    const updatedItems = getTasksFromDOM();
    saveTasks(updatedItems);
  });

  // Обработчик для копирования задачи
  duplicateButton.addEventListener('click', () => {
    const itemName = textElement.textContent;
    const newItem = createItem(itemName);
    listElement.prepend(newItem);
    const updatedItems = getTasksFromDOM();
    saveTasks(updatedItems);
  });

  // Обработчик для редактирования задачи
  editButton.addEventListener('click', () => {
    textElement.setAttribute('contenteditable', 'true');
    textElement.focus();
  });

  // Обработчик для сохранения изменений при потере фокуса
  textElement.addEventListener('blur', () => {
    textElement.setAttribute('contenteditable', 'false');
    const updatedItems = getTasksFromDOM();
    saveTasks(updatedItems);
  });

  return clone;
}

// Обработчик отправки формы
formElement.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const taskText = inputElement.value.trim();
  if (taskText === '') {
    return;
  }

  const newItem = createItem(taskText);
  listElement.prepend(newItem);

  items = getTasksFromDOM();
  saveTasks(items);

  inputElement.value = '';
});

// Инициализация приложения при загрузке страницы
items = loadTasks();
items.forEach((item) => {
  const itemElement = createItem(item);
  listElement.append(itemElement);
});
