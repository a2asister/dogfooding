const API_BASE = '/api';

export const login = async (phone) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return response.json();
};

export const getBatches = async () => {
  const response = await fetch(`${API_BASE}/batches`);
  return response.json();
};

export const createBatch = async (batch) => {
  const response = await fetch(`${API_BASE}/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch)
  });
  return response.json();
};

export const updateBatch = async (id, batch) => {
  const response = await fetch(`${API_BASE}/batches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch)
  });
  return response.json();
};

export const deleteBatch = async (id) => {
  const response = await fetch(`${API_BASE}/batches/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const draw = async (userId, phone) => {
  const response = await fetch(`${API_BASE}/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, phone })
  });
  return response.json();
};
