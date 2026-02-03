const API_URL = "http://localhost:3000";

function getAuthToken() {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find(c => c.startsWith("authToken="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

// Logout
function logout() {
  document.cookie = "authToken=; Max-Age=0; path=/";
  document.getElementById("todoList").innerHTML = "";
  showMessage("Logged out", "success");
}

function showMessage(msg, type="info") {
  let div = document.getElementById("messageBox");
  if(!div) {
    div = document.createElement("div");
    div.id = "messageBox";
    div.style.marginBottom = "20px";
    div.style.padding = "10px";
    div.style.borderRadius = "6px";
    div.style.textAlign = "center";
    document.querySelector(".container").prepend(div);
  }

  div.textContent = msg;
  if(type==="success") div.style.backgroundColor="#4CAF50";
  else if(type==="error") div.style.backgroundColor="#e74c3c";
  else div.style.backgroundColor="#3498db";

  div.style.color="white";
}

// -------- Todos --------
async function loadTodos() {
  const token = getAuthToken();
  if (!token) return;

  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
  },
    body: JSON.stringify({ title, description }),
});

  const todos = await response.json();
  renderTodos(todos);
}

function renderTodos(todos) {
  const ul = document.getElementById("todoList");
  ul.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""}
        onchange="updateTodo('${todo.id}', this.checked)">
      <div class="todo-content">
        <div class="todo-title">${todo.title}</div>
        <div class="todo-description">${todo.description}</div>
      </div>
      <button onclick="deleteTodo('${todo.id}')">Delete</button>
    `;
    ul.appendChild(li);
  });
}

async function updateTodo(id, completed) {
  const token = getAuthToken();
  await fetch(`${API_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": token },
    body: JSON.stringify({ completed })
  });
  loadTodos();
}

async function deleteTodo(id) {
  const token = getAuthToken();
  await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
    headers: { "Authorization": token }
  });
  loadTodos();
}

// -------- Register --------
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if(data.error) showMessage(data.error, "error");
  else {
    showMessage("User registered successfully!", "success");
    document.getElementById("registerForm").reset();
  }
});

// -------- Login --------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if(data.token){
    document.cookie = `authToken=${data.token}; path=/`;
    showMessage("Login successful!", "success");
    document.getElementById("loginForm").reset();
    loadTodos();
  } else {
    showMessage(data.error || "Login failed", "error");
  }
});

// -------- Create Todo --------
document.getElementById("todoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAuthToken();
  if (!token) {
    showMessage("Please login first", "error");
    return;
  }

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": token },
    body: JSON.stringify({ title, description })
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  showMessage("Todo added successfully!", "success");
  loadTodos();
});

window.onload = () => {
  if(getAuthToken()) loadTodos();
};
