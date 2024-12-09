const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUl = document.getElementById("todo-list");
const completedListUl = document.getElementById("completed-list");

let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo();
});

function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText.length > 0) {
    const todoObject = {
      text: todoText,
      completed: false,
      id: Date.now(),
    };
    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    todoInput.value = "";
  }
}

function updateTodoList() {
  todoListUl.innerHTML = "";
  completedListUl.innerHTML = "";

  allTodos.forEach((todo) => {
    const todoItem = createTodoItem(todo);
    if (todo.completed) {
      completedListUl.appendChild(todoItem);
    } else {
      todoListUl.appendChild(todoItem);
    }
  });
}

function createTodoItem(todo) {
  const todoLi = document.createElement("li");
  todoLi.className = "todo";
  todoLi.innerHTML = `
    <input type="checkbox" id="todo-${todo.id}" ${
    todo.completed ? "checked" : ""
  } />
    <label class="custom-checkbox" for="todo-${todo.id}"></label>
    <label for="todo-${todo.id}" class="todo-text">${todo.text}</label>
    <button class="delete-button" data-id="${todo.id}">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#94ADCF"
            >
              <path
                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
              />
            </svg>
          </button>
  `;

  const deleteButton = todoLi.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(todo.id);
  });

  const checkbox = todoLi.querySelector("input");
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    saveTodos();
    updateTodoList();
  });

  return todoLi;
}

function deleteTodoItem(todoId) {
  allTodos = allTodos.filter((todo) => todo.id !== todoId);
  saveTodos();
  updateTodoList();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}

function getTodos() {
  const todos = localStorage.getItem("todos") || "[]";
  return JSON.parse(todos);
}

// Mobile form add task
const addMobileButton = document.getElementById("add-mobile");
const addTaskModal = document.getElementById("addTaskModal");
const closeModalButton = document.querySelector(".close-modal");
const modalTodoForm = document.getElementById("modal-todo-form");
const modalTodoInput = document.getElementById("modal-todo-input");

addMobileButton.addEventListener("click", () => {
  addTaskModal.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
  addTaskModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == addTaskModal) {
    addTaskModal.style.display = "none";
  }
});

modalTodoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskText = modalTodoInput.value.trim();
  if (taskText) {
    const todoObject = {
      text: taskText,
      completed: false,
      id: Date.now(),
    };
    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();
    modalTodoInput.value = "";
    addTaskModal.style.display = "none";
  }
});
