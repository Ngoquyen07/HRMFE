<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import type { Employee } from '@/interfaces/Employee.ts'

const props = defineProps<{
  isModalOpen: boolean
  isEditMode: boolean
  isUploading: boolean
  closeTaskModal: () => void
  errors: any
  employees: Employee[]
  projectInfo: any
  formatDateForInput: (date: any) => any
  handleDeleteTask: () => void
  handleCreateTask: (files: File[]) => void
  handleUpdateTask: () => void
  handleDownload: (doc: any) => void
  handleDeleteDoc: (id: any) => void
  handleUpload : (files: FileList , model : any) => void;
}>()
const currentTaskForm = inject<any>('currentTaskForm')
const minTaskStart = computed(() => {
  return props.projectInfo.value?.start_date
    ? props.formatDateForInput(props.projectInfo.value.start_date)
    : undefined
})

const maxTaskStart = computed(() => {
  return props.projectInfo.value?.end_date
    ? props.formatDateForInput(props.projectInfo.value.end_date)
    : undefined
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
  return props.projectInfo.value?.end_date
    ? props.formatDateForInput(props.projectInfo.value.end_date)
    : undefined
})

const selectedTaskFiles = ref<File[]>([])

const handleTaskFileChange = (e: any) => {
  const files = Array.from(e.target.files) as File[]
  selectedTaskFiles.value = [...selectedTaskFiles.value, ...files]
  e.target.value = ''
}

const removeTaskFile = (index: number) => {
  selectedTaskFiles.value.splice(index, 1)
}

// Khi nhấn Create/Save, ta gửi kèm cả files
const submitWithFiles = () => {
  if (props.isEditMode) {
    props.handleUpdateTask()
  } else {
    props.handleCreateTask(selectedTaskFiles.value)
  }
  selectedTaskFiles.value = [] // Reset sau khi gửi
}

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

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = (e: any) => {
  if (e.target.files.length > 0) {
    props.handleUpload(e.target.files , {type :'task' , id: currentTaskForm.id});
    e.target.value = ''; // Reset input
  }
};
</script>
<template>
  <div v-if="isModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">

        <div class="modal-header bg-light">
          <h5 class="modal-title fw-bold text-primary">
            <i class="bi" :class="isEditMode ? 'bi-pencil-square' : 'bi-plus-circle-dotted'"></i>
            {{ isEditMode ? 'Edit Task Details' : 'Create New Task' }}
          </h5>
          <button type="button" class="btn-close" @click="closeTaskModal"></button>
        </div>

        <div class="modal-body p-4">
          <form @submit.prevent>
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small fw-bold text-muted text-uppercase">Task Name</label>
                <input type="text" class="form-control" :class="{ 'is-invalid': errors.name }" v-model="currentTaskForm.name" :readonly="isEditMode" />
                <div class="invalid-feedback" v-if="errors.name">{{ errors.name[0] }}</div>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold text-muted text-uppercase">Status</label>
                <select class="form-select" v-model="currentTaskForm.status">
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted text-uppercase">Assignee</label>
                <select class="form-select" :class="{ 'is-invalid': errors.employee_id }" v-model="currentTaskForm.employee_id" :disabled="isEditMode">
                  <option :value="null">Select employee...</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
                </select>
                <div class="invalid-feedback" v-if="errors.employee_id">{{ errors.employee_id[0] }}</div>
              </div>

              <div class="col-md-6">
                <div class="d-flex justify-content-between">
                  <label class="form-label small fw-bold text-muted text-uppercase">Progress</label>
                  <span class="badge bg-primary-subtle text-primary">{{ currentTaskForm.progress || 0 }}%</span>
                </div>
                <input type="range" class="form-range" v-model.number="currentTaskForm.progress" min="0" max="100" step="5" />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted text-uppercase">Start Date</label>
                <input type="date" class="form-control" :class="{ 'is-invalid': errors.start_date }" v-model="currentTaskForm.start_date" :min="minTaskStart" :max="maxTaskStart" />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-muted text-uppercase">End Date</label>
                <input type="date" class="form-control" :class="{ 'is-invalid': errors.end_date }" v-model="currentTaskForm.end_date" :min="minTaskEnd" :max="maxTaskEnd" />
              </div>

              <div class="col-12">
                <label class="form-label small fw-bold text-muted text-uppercase">Description</label>
                <textarea class="form-control" rows="2" v-model="currentTaskForm.description" placeholder="Describe the task objective..."></textarea>
              </div>
            </div>

            <hr class="my-4 text-muted opacity-25">

            <div class="document-section">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label small fw-bold text-muted text-uppercase mb-0">
                  <i class="bi bi-paperclip me-1"></i> Task Documents
                </label>

                <div v-if="isEditMode">
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="btn btn-sm btn-primary shadow-sm d-flex align-items-center"
                    :disabled="isUploading"
                  >
                    <span v-if="isUploading" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-plus-lg me-1"></i>
                    <span>Add File</span>
                  </button>

                  <input
                    type="file"
                    ref="fileInput"
                    class="d-none"
                    multiple
                    @change="onFileChange"
                  />
                </div>
              </div>

              <div class="upload-box border-dashed rounded-3 p-3 mb-3 bg-light text-center" v-if="!isEditMode">
                <input type="file" multiple class="form-control form-control-sm" @change="handleTaskFileChange" id="taskFile" hidden />
                <label for="taskFile" class="btn btn-sm btn-outline-primary mb-2">
                  <i class="bi bi-cloud-upload me-2"></i>Choose files to upload
                </label>

                <div v-if="selectedTaskFiles.length > 0" class="mt-2 text-start">
                  <div v-for="(file, index) in selectedTaskFiles" :key="index" class="file-tag d-inline-flex align-items-center bg-white border rounded-pill px-2 py-1 me-2 mb-2 shadow-sm">
                    <i class="bi bi-file-earmark-plus text-primary me-2"></i>
                    <span class="small text-truncate" style="max-width: 150px">{{ file.name }}</span>
                    <i class="bi bi-x-circle-fill text-danger ms-2 pointer" @click="removeTaskFile(index)"></i>
                  </div>
                </div>
              </div>

              <div v-if="isEditMode && currentTaskForm.documents?.length > 0" class="mt-4">
                <div class="row g-3">
                  <div v-for="doc in currentTaskForm.documents" :key="doc.id" class="col-12">
                    <div class="d-flex align-items-center p-3 border rounded shadow-sm hover-bg position-relative bg-white">
                      <div class="flex-shrink-0 me-3">
                        <i class="bi bi-file-earmark-pdf-fill fs-2 text-danger" v-if="doc.name.endsWith('.pdf')"></i>
                        <i class="bi bi-file-earmark-image-fill fs-2 text-success" v-else-if="doc.name.match(/\.(jpg|jpeg|png)$/i)"></i>
                        <i class="bi bi-file-earmark-text-fill fs-2 text-primary" v-else></i>
                      </div>

                      <div class="flex-grow-1 m-0 overflow-hidden">
                        <p class="mb-0 text-truncate fw-medium" :title="doc.name" style="max-width: 100%;">
                          {{ doc.name }}
                        </p>
                        <small class="text-muted d-block text-truncate">
                          By: {{ doc.user?.manager?.name || 'Unknown' }}
                        </small>
                      </div>

                      <div class="d-flex gap-1 flex-shrink-0 ms-2">
                        <button @click="handleDownload(doc)" class="btn btn-sm btn-outline-primary border" title="Download">
                          <i class="bi bi-download"></i>
                        </button>
                        <button @click="handleDeleteDoc(doc.id)" class="btn btn-sm btn-outline-danger border" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer bg-light border-top-0">
          <button v-if="isEditMode" type="button" class="btn btn-link text-danger text-decoration-none me-auto" @click="handleDeleteTask">
            <i class="bi bi-trash me-1"></i> Delete Task
          </button>
          <button type="button" class="btn btn-secondary px-4" @click="closeTaskModal">Cancel</button>
          <button type="button" class="btn btn-primary px-4 shadow-sm" @click="submitWithFiles">
            <i class="bi bi-check2-circle me-1"></i>
            {{ isEditMode ? 'Update Task' : 'Create Task' }}
          </button>
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
.border-dashed {
 border: 2px dashed #dee2e6 !important;
 transition: border-color 0.2s;
}
.border-dashed:hover {
  border-color: #0d6efd !important;
}
.bg-primary-subtle {
  background-color: #e7f1ff;
}
</style>
