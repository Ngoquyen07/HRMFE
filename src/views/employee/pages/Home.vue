<script setup lang="ts">
import employeeApi from '@/api/employee/employeeApi.ts'
import { onMounted, ref, computed, reactive, provide } from 'vue'
import taskApi from '@/api/employee/taskApi.ts'
import SideBar from '@/components/asset/SideBar.vue'
import SuccessToast from '@/components/asset/SuccessToast.vue'
import EmployeeHomeHeader from '@/components/employee/home/EmployeeHomeHeader.vue'
import DashBoardCard from '@/components/manager/home/DashBoardCard.vue'
import TaskList from '@/components/employee/home/TaskList.vue'
import UpdateTaskModal from '@/components/employee/home/UpdateTaskModal.vue'
import documentApi from '@/api/document/documentApi.ts'

// --- Data ---
const employee = ref<any>(null)
const manager = ref<string>('')
const tasks = ref<any[]>([])
const loading = ref(false)

// Modal State
const isModalOpen = ref(false)
const updateLoading = ref(false)

// Quản lý trạng thái của Toast
const toastRef = ref<{
  show: (message: string, type?: "success" | "danger", duration?: number) => void
  hide: () => void
} | null>(null)

// Form Data
const currentTaskForm = reactive({
  id: 0,
  name: '',
  description: '',
  project_name: '',
  start_date: '',
  end_date: '',
  status: 'todo',
  progress: 0,
  documents : []
})
provide('currentTaskForm',currentTaskForm);

// Tinh toan chi so
const stats = computed(() => {
  if (!tasks.value) return { total: 0, todo: 0, doing: 0, done: 0 }
  return {
    total: tasks.value.length,
    todo: tasks.value.filter(t => t.status === 'todo').length,
    doing: tasks.value.filter(t => t.status === 'doing').length,
    done: tasks.value.filter(t => t.status === 'done').length
  }
})
// --- Tải dữ liệu gốc ---
async function loadAllData() {
  loading.value = true
  try {
    const [empRes, manRes, taskRes] = await Promise.all([
      employeeApi.getEmployee(),
      employeeApi.getManager(),
      employeeApi.getTasks()
    ])
    employee.value = empRes.data.data
    manager.value = manRes.data.data
    tasks.value = taskRes.data.data
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error)
  } finally {
    loading.value = false
  }
}


// Mở modal và fill dữ liệu
function openUpdateModal(task: any) {
  // Copy dữ liệu vào form
  currentTaskForm.id = task.id
  currentTaskForm.name = task.name
  currentTaskForm.description = task.description
  currentTaskForm.project_name = task.project.name
  currentTaskForm.start_date = task.start_date
  currentTaskForm.end_date = task.end_date
  currentTaskForm.status = task.status
  currentTaskForm.progress = task.progress
  currentTaskForm.documents = task.documents
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

// Xử lý lưu cập nhật
async function handleUpdateTask() {
  updateLoading.value = true
  try {
    // Employee chỉ được cập nhật 2 trường
    const payload = {
      status: currentTaskForm.status,
      progress: currentTaskForm.progress
    }
    await taskApi.updateTask(currentTaskForm.id, payload)
    toastRef.value?.show('Update task successfully', 'success')
    closeModal()
    await loadAllData()

  } catch (error) {
    console.error("Update failed:", error)
    toastRef.value?.show('Failed to update task. Please try again.', 'danger')
  } finally {
    updateLoading.value = false
  }
}

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
    await loadAllData()
     const updatedTask = tasks.value.find((t: any) => t.id === model.id)
    currentTaskForm.documents = updatedTask.documents;
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
    if (currentTaskForm.documents) {
      currentTaskForm.documents = currentTaskForm.documents.filter(
        (doc: any) => doc.id !== docId
      );
    }

    const taskIndex = tasks.value.findIndex(t => t.id === currentTaskForm.id);
    if (taskIndex !== -1) {
      tasks.value[taskIndex].documents = tasks.value[taskIndex].documents.filter(
        (doc: any) => doc.id !== docId
      );
    }
  } catch (err: any) {
    toastRef.value?.show('Failed to delete document', 'danger');
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="container py-4 position-relative">
    <SideBar />
    <SuccessToast ref="toastRef" />
    <EmployeeHomeHeader :employee="employee" :manager="manager"/>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else>
      <div class="row g-3 mb-4">
        <DashBoardCard title="Total Tasks" color="bg-primary" :count="stats.total"/>
        <DashBoardCard title="To Do" color="bg-info" :count="stats.todo"/>
        <DashBoardCard title="In Progress" color="bg-danger" :count="stats.doing"/>
        <DashBoardCard title="Completed" color="bg-success" :count="stats.done"/>
      </div>
      <div class="card shadow-sm border-0">
        <TaskList :tasks="tasks" :open-update-modal="openUpdateModal" />
      </div>
    </div>
    <UpdateTaskModal
      :is-modal-open="isModalOpen"
      :close-modal="closeModal"
      :handle-update-task="handleUpdateTask"
      :update-loading="updateLoading"
      :handle-upload="handleUploadFiles"
      :handle-delete-doc="handleDeleteDocument"
      :handle-download="handleDownload"
      :is-uploading="isUploading"
    />
  </div>
</template>
<style scoped>
</style>