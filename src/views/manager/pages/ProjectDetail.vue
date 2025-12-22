<script setup lang="ts">
import { onMounted, ref, computed, reactive, provide } from 'vue'
import { useRoute } from 'vue-router'
import projectApi from '@/api/manager/projectApi.ts'
import managerApi from '@/api/manager/managerApi.ts'
import taskApi from '@/api/manager/taskApi.ts'
import router from '@/router'
import SuccessToast from '@/components/asset/SuccessToast.vue'
import ProjectDetailHeader from '@/components/manager/details/ProjectDetailHeader.vue'
import ProjectDetailForm from '@/components/manager/details/ProjectDetailForm.vue'
import TaskList from '@/components/manager/details/TaskList.vue'
import type { Employee } from '@/interfaces/Employee.ts'
import CreateAndEditTaskModal from '@/components/manager/details/CreateAndEditTaskModal.vue'
import Document from '@/components/manager/details/Document.vue'
import documentApi from '@/api/document/documentApi.ts'

const route = useRoute()
const id = Number(route.params.id)

// Data
const employees = ref<Employee[]>([])
const projectInfo = ref<any | null>(null)
const originalProjectState = ref<{ status: string; progress: number ; description : string } | null>(null)

// Modal State
const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentTaskId = ref<number | null>(null)

// Validation & Toast State
const errors = ref<Record<string, string[]>>({})
const projectErrors = ref<Record<string, string[]>>({})

// Quản lý trạng thái của Toast
const toastRef = ref<{
  show: (message: string, type?: "success" | "danger", duration?: number) => void
  hide: () => void
} | null>(null)

// Form Data (Dùng chung cho Create và Edit)
const defaultTaskState: any = {
  id : null,
  name: '',
  description: '',
  status: 'todo',
  start_date: '',
  end_date: '',
  progress: 0,
  employee_id: null,
  documents : null
}
const currentTaskForm = reactive<any>({ ...defaultTaskState })
provide('currentTaskForm',currentTaskForm);

// ====================== 3. HELPER FUNCTIONS ======================

// Format Date hiển thị (VD: 25/12/2025)
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-GB').format(new Date(dateString))
}

// Format Date cho Input
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

// Load Project Info
async function loadInfo() {
  try {
    const res = await projectApi.getProjectById(id)
    projectInfo.value = res.data.data

    // Lưu trạng thái gốc để so sánh thay đổi
    if (projectInfo.value) {
      originalProjectState.value = {
        status: projectInfo.value.status,
        progress: projectInfo.value.progress,
        description : projectInfo.value.description
      }
    }
  } catch (err : any) {
    if(err.response.status === 404) {
      router.replace({
        name: '404',
        params: { pathMatch: route.path.substring(1).split('/') }
      });
    }
    toastRef.value?.show('Failed to load project data', 'danger')
  }
}

// Load Employees List
async function loadEmployees() {
  try {
    const res = await managerApi.getEmployees()
    employees.value = res.data.data
  } catch (err) {
    console.error('Failed to load employees', err)
  }
}
// Kiểm tra thng tin thay đổi hay chưa
const hasProjectChanged = computed(() => {
  if (!projectInfo.value || !originalProjectState.value) return false
  return (
    projectInfo.value.status !== originalProjectState.value.status ||
    projectInfo.value.progress !== originalProjectState.value.progress||
    projectInfo.value.description !== originalProjectState.value.description
  )
})

async function handleUpdateProject() {
  if (!projectInfo.value) return
  projectErrors.value = {} // reset lỗi cũ
  try {
    await projectApi.updateProject(projectInfo.value)
    originalProjectState.value = {
      status: projectInfo.value.status,
      progress: projectInfo.value.progress,
      description : projectInfo.value.description
    }
    toastRef.value?.show('Project information updated successfully', 'success')
  } catch (err: any) {
    if (err.response?.status === 422) {
      projectErrors.value = err.response.data.errors
      toastRef.value?.show('Validation error. Please check your input.', 'danger')
    } else {
      toastRef.value?.show(err.response?.data?.message || 'Failed to update project', 'danger')
    }
  }
}
async function handleDeleteProject() {
  try{
    await projectApi.deleteProject(id);
    toastRef.value?.show('Project deleted successfully', 'success')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }
  catch(err: any) {
    toastRef.value?.show(err.response?.data?.message || 'Failed to delete project', 'danger')
  }
}

// --- MODAL & TASK LOGIC ---

function openCreateModal() {
  isEditMode.value = false
  currentTaskId.value = null
  Object.assign(currentTaskForm, defaultTaskState) // Reset form
  errors.value = {}
  isModalOpen.value = true
}

function openEditModal(task: any) {
  isEditMode.value = true
  currentTaskId.value = task.id!
  errors.value = {}

  // Fill dữ liệu vào form
  Object.assign(currentTaskForm, {
    id : task.id,
    name: task.name,
    description: task.description,
    status: task.status,
    progress: task.progress,
    employee_id: task.employee_id,
    start_date: formatDateForInput(task.start_date), // Xử lý ngày tháng cho input
    end_date: formatDateForInput(task.end_date),
    documents: task.documents || []
  })
  isModalOpen.value = true
}

function closeTaskModal() {
  isModalOpen.value = false
}

// --- TASK CRUD ---

async function handleCreateTask(files: File[]) {
  errors.value = {};
  const payload = { project_id: id, ...currentTaskForm }
  //Khởi tạo FormData
  const formData = new FormData();

  // Ném dữ liệu từ form vào formdata
  Object.keys(payload).forEach(key => {
    const value = (payload as any)[key];
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  // Ném các file vào formdata
  files.forEach((file) => {
    formData.append('files[]', file);
  });

  try {
    const res = await taskApi.createTask(formData)
    console.log(res);
    toastRef.value?.show("Created task successfully.", "success");
    closeTaskModal()
    await loadInfo()
  } catch (err: any) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors;
    } else {
      toastRef.value?.show("An error occurred.", "danger");
    }
  } finally {
    uploadProgress.value = 0;
  }
}

// 2. Update Task
async function handleUpdateTask() {
  if (!currentTaskId.value) return
  errors.value = {} // reset lỗi cũ

  try {
    const payload = {
      project_id: id,
      start_date: currentTaskForm.start_date,
      end_date: currentTaskForm.end_date,
      status: currentTaskForm.status,
      description: currentTaskForm.description,
    }

    await taskApi.updateTask(currentTaskId.value, payload)

    toastRef.value?.show('Task updated successfully', 'success')
    closeTaskModal()
    await loadInfo()
  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
      toastRef.value?.show('Update failed: Validation error!', 'danger')
    }
    else {
      toastRef.value?.show(err.response?.data?.message || 'Failed to update task', 'danger')
    }
  }
}

// 3. Delete Task
async function handleDeleteTask() {
  if (!currentTaskId.value) return
  try {
    await taskApi.deleteTask(currentTaskId.value)
    toastRef.value?.show('Task deleted successfully', 'success')
    closeTaskModal()
    await loadInfo()
  } catch (err: any) {
    toastRef.value?.show(err.response?.data?.message || 'Delete failed', 'danger')
  }
}

// Thêm vào phần <script setup> của bạn
async function handleDownload(doc: any) {
  try {
    const res = await documentApi.downloadDocument(doc.id);
    // Tạo một URL tạm thời từ dữ liệu Blob
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    // Đặt tên file khi tải về
    link.setAttribute('download', doc.name);
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp bộ nhớ
    link.remove();
    window.URL.revokeObjectURL(url);

    // toastRef.value?.show('Downloading started...', 'success');
  } catch (err) {
    console.error('Download error:', err);
    toastRef.value?.show('Failed to download file', 'danger');
  }
}
// --- Logic Thêm File ---
const isUploading = ref(false);
const uploadProgress = ref(0);
async function handleUploadFiles(fileList: FileList , model : any) {
  isUploading.value = true;
  uploadProgress.value = 0;
  const formData = new FormData();

  // Gửi ID project để BE biết gắn vào project nào
  formData.append('documentable_id', model.id.toString());
  formData.append('documentable_type', model.type);
  Array.from(fileList).forEach(file => {
    formData.append('files[]', file);
  });

  try {
    await documentApi.uploadDocument(formData , (percent : number) => {
      uploadProgress.value = percent;
    });
    toastRef.value?.show('Files uploaded successfully', 'success');
    await loadInfo();
    if (model.type === 'task') {
      // Tìm task vừa được upload trong danh sách task mới tải về
      const updatedTask = projectInfo.value?.tasks?.find((t: any) => t.id === model.id);
      if (updatedTask) {
        // Cập nhật lại danh sách documents của form
        currentTaskForm.documents = updatedTask.documents;
      }
    }
  } catch (err: any) {
    toastRef.value?.show(err.response?.data?.message || 'Upload failed', 'danger');
  } finally {
    isUploading.value = false;
  }
}

// --- Logic Xóa File ---
async function handleDeleteDocument(docId: number) {

  try {
    const res = await documentApi.deleteDocument(docId);
    console.log(res)
    toastRef.value?.show('Document deleted', 'success');

    // Cập nhật UI local
    if (projectInfo.value) {
      projectInfo.value.documents = projectInfo.value.documents.filter((d : any ) => d.id !== docId);
    }
    if (projectInfo.value?.tasks) {
      projectInfo.value.tasks.forEach((task: any) => {
        if (task.documents) {
          task.documents = task.documents.filter((d: any) => d.id !== docId);
        }
      });
    }
    if (currentTaskForm.documents) {
      currentTaskForm.documents = currentTaskForm.documents.filter(
        (d: any) => d.id !== docId
      );
    }
  } catch (err: any) {
    toastRef.value?.show('Failed to delete document', 'danger');
  }
}

// Lifecycle Hook
onMounted(() => {
  loadInfo()
  loadEmployees()
})
</script>

<template>
  <div class="container mt-4 mb-4 position-relative" v-if="projectInfo">
<!--    Thông báo -->
    <SuccessToast ref="toastRef" />
<!--      Header -->
    <ProjectDetailHeader :name="projectInfo.name" />

    <ProjectDetailForm
      :project-info="projectInfo"
      :format-date="formatDate"
      :project-errors="projectErrors"
      :has-project-changed="hasProjectChanged"
      :handle-update-project="handleUpdateProject"
      :handle-delete-project="handleDeleteProject"/>
    <Document
      :project-info="projectInfo"
      :handle-download="handleDownload"
      :is-uploading="isUploading"
      :handle-upload="handleUploadFiles"
      :handle-delete="handleDeleteDocument" />
    <TaskList
      :project-info="projectInfo"
      :open-create-modal="openCreateModal"
      :open-edit-modal="openEditModal"
      :format-date="formatDate"/>
    <CreateAndEditTaskModal
      :is-modal-open="isModalOpen"
      :is-edit-mode="isEditMode"
      :close-task-modal="closeTaskModal"
      :errors="errors"
      :employees="employees"
      :project-info="projectInfo"
      :format-date-for-input="formatDateForInput"
      :handle-delete-task="handleDeleteTask"
      :handle-create-task="handleCreateTask"
      :handle-update-task="handleUpdateTask"
      :handle-download="handleDownload"
      :handle-delete-doc="handleDeleteDocument"
      :handle-upload="handleUploadFiles"
      :is-uploading="isUploading"
    />
  </div>

  <div v-else class="d-flex justify-content-center align-items-center" style="height: 50vh">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
/* Hiệu ứng hover cho bảng */
tbody tr:hover {
  background-color: #f8f9fa;
}
</style>