const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://taskflow-website-4i4m.onrender.com";

const TOKEN_KEY = "taskflow_token";
const LEGACY_TOKEN_KEY = "token";

// ================= TOKEN HANDLING =================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function logout() {
  clearToken();
  window.location.href = "/login";
}

// ================= CORE REQUEST =================

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const message =
      (data && (data.error || data.message)) || `Request failed (${res.status})`;

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ================= AUTH =================

export async function login({ usernameOrEmail, password }) {
  const response = await request("/api/auth/login", {
    method: "POST",
    body: { username_or_email: usernameOrEmail, password },
  });

  const data = response?.data ?? response;
  if (data?.access_token) setToken(data.access_token);

  return data;
}

export async function register({ username, email, password }) {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: { username, email, password },
  });

  return response?.data ?? response;
}

export async function getCurrentUser() {
  const response = await request("/api/auth/me", { auth: true });
  return response?.data ?? response;
}

// ================= STATS =================

export async function getStats() {
  const response = await request("/api/stats", { auth: true });
  return response?.data ?? response;
}

// ================= PROJECTS =================

export async function getProjects() {
  const response = await request("/api/projects", { auth: true });
  return response?.data ?? response;
}

export async function createProject(name) {
  const response = await request("/api/projects", {
    method: "POST",
    body: { name },
    auth: true,
  });
  return response?.data ?? response;
}

export async function updateProject(id, updates) {
  const response = await request(`/api/projects/${id}`, {
    method: "PUT",
    body: updates,
    auth: true,
  });
  return response?.data ?? response;
}

export async function deleteProject(id) {
  const response = await request(`/api/projects/${id}`, {
    method: "DELETE",
    auth: true,
  });
  return response?.data ?? response;
}

// ================= TASKS =================

export async function getTasks(projectId) {
  const response = await request(`/api/tasks/${projectId}`, { auth: true });
  return response?.data ?? response;
}

export async function createTask({ title, project_id, due_date, priority, notes }) {
  const response = await request("/api/tasks", {
    method: "POST",
    body: { title, project_id, due_date, priority, notes },
    auth: true,
  });
  return response?.data ?? response;
}

export async function updateTask(taskId, updates) {
  const response = await request(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: updates,
    auth: true,
  });
  return response?.data ?? response;
}

export async function toggleTask(taskId, completed) {
  const response = await request(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: { completed },
    auth: true,
  });
  return response?.data ?? response;
}

export async function deleteTask(taskId) {
  const response = await request(`/api/tasks/${taskId}`, {
    method: "DELETE",
    auth: true,
  });
  return response?.data ?? response;
}

// ================= SUBSCRIPTION =================

export async function subscribeToPlan(planId) {
  return await request("/api/subscription", {
    method: "POST",
    body: { plan_id: planId },
    auth: true,
  });
}

export async function getMySubscription() {
  return await request("/api/subscription/me", { auth: true });
}