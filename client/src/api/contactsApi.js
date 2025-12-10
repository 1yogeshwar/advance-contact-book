import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contacts';

export const getContacts = (params) => {
  return axios.get(API_URL, { params });
};

export const getContactById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const createContact = (data) => {
  return axios.post(API_URL, data);
};

export const updateContact = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

export const deleteContact = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const deleteContactsBatch = (ids) => {
  return axios.post(`${API_URL}/batch-delete`, { ids });
};

export const uploadContacts = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const exportContacts = (params) => {
  return axios.get(`${API_URL}/export`, {
    params,
    responseType: 'blob'
  });
};

export const startEdit = (id, userId) => {
  return axios.post(`${API_URL}/${id}/start-edit`, { userId });
};

export const endEdit = (id, userId) => {
  return axios.post(`${API_URL}/${id}/end-edit`, { userId });
};