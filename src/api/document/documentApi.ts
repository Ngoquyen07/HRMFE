import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
const documentApi = {
  async downloadDocument(docId: number) {
    return axiosClient.get(`/api/documents/${docId}/download`, {
      responseType: 'blob',
    });
  } ,
  async uploadDocument(formData: FormData, onProgress: (percent: number) => void) {
    await auth.getCSRFToken();
    return await axiosClient.post('/api/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  },
  async deleteDocument(docId: number) {
    await auth.getCSRFToken();
    return await axiosClient.delete(`/api/documents/${docId}`)
  }
}
export default documentApi;