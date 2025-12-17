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
  progress: 0
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
    <UpdateTaskModal :is-modal-open="isModalOpen" :close-modal="closeModal" :handle-update-task="handleUpdateTask" :update-loading="updateLoading"/>
  </div>
</template>
<style scoped>
</style>