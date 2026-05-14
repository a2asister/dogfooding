const API_BASE = '/api';
async function request(endpoint, options) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
}
export const api = {
    saveWork: (name, config, thumbnail) => request('/works', {
        method: 'POST',
        body: JSON.stringify({ name, config, thumbnail }),
    }),
    getWorks: () => request('/works'),
    deleteWork: (id) => request(`/works/${id}`, { method: 'DELETE' }),
    saveTemplate: (name, config, thumbnail, category) => request('/templates', {
        method: 'POST',
        body: JSON.stringify({ name, config, thumbnail, category }),
    }),
    getTemplates: () => request('/templates'),
    getCreationRecords: () => request('/records'),
    addCreationRecord: (workId, action) => request('/records', {
        method: 'POST',
        body: JSON.stringify({ workId, action }),
    }),
};
