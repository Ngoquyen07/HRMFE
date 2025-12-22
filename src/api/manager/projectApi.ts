import axiosClient from "../auth/axios.ts";
import auth from '@/api/auth/auth.ts'
const projectApi = {
  async getProjectById(id : Number): Promise<any> {
    await auth.getCSRFToken();
    return await axiosClient.get(`/api/manager/projects/${id}`)
  },
  async createProject(formData: FormData, onProgress: (percent: number) => void) {
    await auth.getCSRFToken();
    return await axiosClient.post('/api/manager/projects', formData, {
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
  async updateProject(data: any): Promise<any> {
    await auth.getCSRFToken();
    return await axiosClient.put(`/api/manager/projects/${data.id}`, data)
  },
  async deleteProject(id : Number): Promise<any> {
    await auth.getCSRFToken();
    return await axiosClient.delete(`/api/manager/projects/${id}`)
  }
}
export default projectApi ;