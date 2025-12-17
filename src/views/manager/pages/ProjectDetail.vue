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
import type { Project } from '@/interfaces/Project.ts'
import type { Task } from '@/interfaces/Task.ts'
import CreateAndEditTaskModal from '@/components/manager/details/CreateAndEditTaskModal.vue'

const route = useRoute()
const id = Number(route.params.id)

// Data
const employees = ref<Employee[]>([])
const projectInfo = ref<Project | null>(null)
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
const defaultTaskState: Task = {
  name: '',
  description: '',
  status: 'todo',
  start_date: '',
  end_date: '',
  progress: 0,
  employee_id: null,
}
const currentTaskForm = reactive<Task>({ ...defaultTaskState })
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

function openEditModal(task: Task) {
  isEditMode.value = true
  currentTaskId.value = task.id!
  errors.value = {}

  // Fill dữ liệu vào form
  Object.assign(currentTaskForm, {
    name: task.name,
    description: task.description,
    status: task.status,
    progress: task.progress,
    employee_id: task.employee_id,
    start_date: formatDateForInput(task.start_date), // Xử lý ngày tháng cho input
    end_date: formatDateForInput(task.end_date),
  })

  isModalOpen.value = true
}

function closeTaskModal() {
  isModalOpen.value = false
}

// --- TASK CRUD OPERATIONS ---

// 1. Create Task
async function handleCreateTask() {
  errors.value = {}
  try {
    const payload = { project_id: id, ...currentTaskForm }
    const res = await taskApi.creatTask(payload)
    toastRef.value?.show(res.data.message || 'Task created successfully', 'success')
    closeTaskModal()
    await loadInfo()
  } catch (err: any) {
    handleApiErrors(err)
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

// Error Handler helper
function handleApiErrors(err: any) {
  if (err.response?.status === 422) {
    errors.value = err.response.data.errors
    toastRef.value?.show('Validation Error. Please check inputs.', 'danger')
  } else {
    toastRef.value?.show(err.response?.data?.message || 'Server Error', 'danger')
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
      :handle-update-task="handleUpdateTask"/>
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