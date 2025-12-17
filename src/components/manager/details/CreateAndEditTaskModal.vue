<script setup lang="ts">
import { computed, inject, watch } from 'vue'
import type { Employee } from '@/interfaces/Employee.ts'

const props = defineProps<{
  isModalOpen: boolean
  isEditMode: boolean
  closeTaskModal: () => void
  errors: any
  employees: Employee[]
  projectInfo: any
  formatDateForInput: (date: any) => any
  handleDeleteTask : () => void,
  handleCreateTask: () => void,
  handleUpdateTask : () => void,

}>()
const currentTaskForm = inject<any>('currentTaskForm')
const minTaskStart = computed(() => {
  return props.projectInfo.value?.start_date
    ? props.formatDateForInput(props.projectInfo.value.start_date)
    : undefined
})

const maxTaskStart = computed(() => {
  return props.projectInfo.value?.end_date ? props.formatDateForInput(props.projectInfo.value.end_date) : undefined
})
const minTaskEnd = computed(() => {
  const projectStart = props.projectInfo.value?.start_date
    ? props.formatDateForInput(props.projectInfo.value.start_date)
    : ''
  const taskStart = currentTaskForm.start_date
  if (taskStart) {
    return taskStart > <any>projectStart ? taskStart : projectStart
  }
  return projectStart
})

const maxTaskEnd = computed(() => {
  return props.projectInfo.value?.end_date ? props.formatDateForInput(props.projectInfo.value.end_date) : undefined
})

// 3. Watcher: Tự động Reset ngày kết thúc nếu nó không còn hợp lệ
watch(
  () => currentTaskForm.start_date,
  (newStartDate) => {
    if (newStartDate && currentTaskForm.end_date) {
      if (currentTaskForm.end_date < newStartDate) {
        currentTaskForm.end_date = ''
      }
    }
  },
)
</script>

<template>
  <div
    class="modal fade show"
    v-if="isModalOpen"
    style="display: block; background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h5>
          <button type="button" class="btn-close" @click="closeTaskModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Task Name </label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  v-model="currentTaskForm.name"
                  :readonly="isEditMode"
                  placeholder="Enter task name ..."
                />
                <div class="invalid-feedback" v-if="errors.name">{{ errors.name[0] }}</div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Assign Employee</label>
                <select
                  class="form-select"
                  :class="{ 'is-invalid': errors.employee_id }"
                  v-model="currentTaskForm.employee_id"
                  :disabled="isEditMode"
                >
                  <option :value="null">Select an employee...</option>
                  <option v-for="emp in employees" :value="emp.id" :key="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.employee_id">
                  {{ errors.employee_id[0] }}
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Start Date</label>
                <input
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': errors.start_date }"
                  v-model="currentTaskForm.start_date"
                  :min="minTaskStart"
                  :max="maxTaskStart"
                />
                <div class="invalid-feedback" v-if="errors.start_date">
                  {{ errors.start_date[0] }}
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">End Date</label>
                <input
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': errors.end_date }"
                  v-model="currentTaskForm.end_date"
                  :min="minTaskEnd"
                  :max="maxTaskEnd"
                />
                <div class="invalid-feedback" v-if="errors.end_date">
                  {{ errors.end_date[0] }}
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="currentTaskForm.status">
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between">
                  <label class="form-label">Progress</label>
                  <span class="fw-bold text-primary">{{ currentTaskForm.progress || 0 }}%</span>
                </div>
                <input
                  type="range"
                  class="form-range"
                  :class="{ 'is-invalid': errors.progress }"
                  v-model.number="currentTaskForm.progress"
                  min="0"
                  max="100"
                  step="5"
                  :disabled="isEditMode"
                />
                <div class="invalid-feedback d-block" v-if="errors.progress">
                  {{ errors.progress[0] }}
                </div>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="currentTaskForm.description"
                ></textarea>
                <div class="invalid-feedback d-block" v-if="errors.description">
                  {{ errors.description[0] }}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer justify-content-between">
          <div>
            <button v-if="isEditMode" class="btn btn-outline-danger" @click="handleDeleteTask">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>

          <div>
            <button type="button" class="btn btn-secondary me-2" @click="closeTaskModal">
              Cancel
            </button>
            <button
              v-if="!isEditMode"
              type="button"
              class="btn btn-primary"
              @click="handleCreateTask"
            >
              Create Task
            </button>
            <button v-else type="button" class="btn btn-success" @click="handleUpdateTask">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal.show {
  display: block;
}
/* Hiệu ứng hover cho bảng */
tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
