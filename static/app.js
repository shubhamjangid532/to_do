const todoListEl = document.getElementById("todo-list");
const todoFormEl = document.getElementById("todo-form");
const todoInputEl = document.getElementById("todo-input");
const completedCountEl = document.getElementById("completed-count");
const uncompletedCountEl = document.getElementById("uncompleted-count");

// Fetch and render todos on load
window.addEventListener("DOMContentLoaded", loadTodos);

async function loadTodos() {
  const res = await fetch("/api/todos");
  const todos = await res.json();
  todoListEl.innerHTML = "";
  todos.forEach(renderTodo);
  updateCounters();
}

function renderTodo(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;

  const leftDiv = document.createElement("div");
  leftDiv.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked));

  const titleP = document.createElement("p");
  titleP.className = "todo-title";
  titleP.textContent = todo.title;
  if (todo.completed) {
    titleP.classList.add("completed");
  }

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(titleP);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";
  editBtn.addEventListener("click", () => editTodo(todo.id, titleP));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  actionsDiv.appendChild(deleteBtn);
  actionsDiv.appendChild(editBtn);

  li.appendChild(leftDiv);
  li.appendChild(actionsDiv);

  todoListEl.appendChild(li);
  updateCounters();
}

// Handle create
todoFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = todoInputEl.value.trim();
  if (!title) return;

  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    alert("Failed to add task");
    return;
  }

  const newTodo = await res.json();
  renderTodo(newTodo);
  todoInputEl.value = "";
});

// Toggle completed
async function toggleTodo(id, completed) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });

  if (!res.ok) {
    alert("Failed to update task");
    return;
  }

  const updated = await res.json();
  const li = todoListEl.querySelector(`li[data-id="${id}"]`);
  if (!li) return;
  const titleP = li.querySelector(".todo-title");
  if (updated.completed) {
    titleP.classList.add("completed");
  } else {
    titleP.classList.remove("completed");
  }
  updateCounters();
}

// Edit title
async function editTodo(id, titleElement) {
  const current = titleElement.textContent;
  const next = window.prompt("Edit task", current);
  if (next === null) return;
  const trimmed = next.trim();
  if (!trimmed) {
    alert("Title cannot be empty");
    return;
  }

  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: trimmed }),
  });

  if (!res.ok) {
    alert("Failed to rename task");
    return;
  }

  const updated = await res.json();
  titleElement.textContent = updated.title;
}

// Delete
async function deleteTodo(id) {
  if (!window.confirm("Delete this task?")) return;

  const res = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("Failed to delete task");
    return;
  }

  const li = todoListEl.querySelector(`li[data-id="${id}"]`);
  if (li) {
    li.remove();
  }
  updateCounters();
}

// Counter helper
function updateCounters() {
  const items = [...todoListEl.querySelectorAll(".todo-item")];
  let completed = 0;
  let uncompleted = 0;
  items.forEach((item) => {
    const titleP = item.querySelector(".todo-title");
    if (titleP.classList.contains("completed")) {
      completed += 1;
    } else {
      uncompleted += 1;
    }
  });
  completedCountEl.textContent = completed;
  uncompletedCountEl.textContent = uncompleted;
}
