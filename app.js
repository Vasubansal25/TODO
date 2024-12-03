// Redux Setup
const { createStore } = Redux;

// Initial State
const initialState = {
  tasks: [],
  filter: 'all'
};

// Action Types
const ADD_TASK = 'ADD_TASK';
const EDIT_TASK = 'EDIT_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_COMPLETE = 'TOGGLE_COMPLETE';
const SET_FILTER = 'SET_FILTER';

// Reducer
function taskReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] };
    case EDIT_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case DELETE_TASK:
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case TOGGLE_COMPLETE:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        )
      };
    case SET_FILTER:
      return { ...state, filter: action.payload };
    default:
      return state;
  }
}

// Store
const store = createStore(taskReducer);

// Selectors
const getFilteredTasks = (tasks, filter) => {
  const now = new Date().toISOString().split('T')[0];
  switch (filter) {
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'pending':
      return tasks.filter(task => !task.completed && task.dueDate >= now);
    case 'overdue':
      return tasks.filter(task => !task.completed && task.dueDate < now);
    default:
      return tasks;
  }
};

// DOM Elements
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const closeModal = document.getElementById('closeModal');
const filterBtns = document.querySelectorAll('.filter-btn');

// Utility Functions
const openModal = () => taskModal.classList.add('visible');
const closeModalFunc = () => taskModal.classList.remove('visible');
const renderTasks = () => {
  const state = store.getState();
  const filteredTasks = getFilteredTasks(state.tasks, state.filter);
  taskList.innerHTML = filteredTasks
    .map(
      task => `
      <div class="task ${task.completed ? 'completed' : ''}">
        <span>${task.title} - ${task.dueDate}</span>
        <div class="task-buttons">
          <button class="complete" data-id="${task.id}">${
        task.completed ? 'Undo' : 'Complete'
      }</button>
          <button class="delete" data-id="${task.id}">Delete</button>
        </div>
      </div>
    `
    )
    .join('');
};

// Event Listeners
addTaskBtn.addEventListener('click', () => {
  taskForm.reset();
  document.getElementById('taskId').value = '';
  openModal();
});

closeModal.addEventListener('click', closeModalFunc);

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('taskId').value || Date.now().toString();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('dueDate').value;
  const isEdit = Boolean(document.getElementById('taskId').value);
  const action = isEdit
    ? { type: EDIT_TASK, payload: { id, title, description, dueDate, completed: false } }
    : { type: ADD_TASK, payload: { id, title, description, dueDate, completed: false } };

  store.dispatch(action);
  closeModalFunc();
});

taskList.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    const id = e.target.dataset.id;
    store.dispatch({ type: DELETE_TASK, payload: id });
  } else if (e.target.classList.contains('complete')) {
    const id = e.target.dataset.id;
    store.dispatch({ type: TOGGLE_COMPLETE, payload: id });
  }
});

filterBtns.forEach(btn =>
  btn.addEventListener('click', e => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    store.dispatch({ type: SET_FILTER, payload: e.target.dataset.filter });
  })
);

// Subscribe to Store
store.subscribe(renderTasks);

// Initial Render
renderTasks();
