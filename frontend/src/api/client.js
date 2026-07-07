const BASE = '/api';

function getToken() {
  return localStorage.getItem('sprintflow_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.error || (data && Object.values(data)[0]) || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
};

export const sprintApi = {
  list: () => request('/sprints'),
  get: (id) => request(`/sprints/${id}`),
  create: (payload) => request('/sprints', { method: 'POST', body: JSON.stringify(payload) }),
};

export const taskApi = {
  listForSprint: (sprintId) => request(`/tasks?sprintId=${sprintId}`),
  create: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  logHours: (id, hours) => request(`/tasks/${id}/log-hours`, { method: 'POST', body: JSON.stringify({ hours }) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
