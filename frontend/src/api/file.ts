import request from './request';

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return request.post<{ url: string; filename: string }>('/files/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadMultipleImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  return request.post<{ files: { url: string; filename: string }[] }>('/files/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
