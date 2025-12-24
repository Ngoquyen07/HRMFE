<script setup lang="ts">
import { inject, ref } from 'vue'

const props = defineProps<{
  isModalOpen: boolean
  closeModal: () => void
  handleUpdateTask: () => void
  updateLoading: boolean
  handleDownload: (doc: any) => void
  handleDeleteDoc: (id: any) => void
  handleUpload : (files: FileList , model : any) => void
  isUploading : boolean
}>()
const currentTaskForm = inject<any>('currentTaskForm')
const fileInput = ref<HTMLInputElement | null>(null)
const triggerFileInput = () => {
  fileInput.value?.click()
}
const onFileChange = (e: any) => {
  if (e.target.files.length > 0) {
    props.handleUpload(e.target.files , {type :'task' , id: currentTaskForm.id});
    e.target.value = ''; // Reset input
  }
};
</script>

<template>
  <div
    class="modal fade show"
    v-if="props.isModalOpen"
    style="display: block; background: rgba(0, 0, 0, 0.5)"
    @click.self="props.closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-pencil-square me-2"></i> Update Task Progress
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="props.closeModal"
          ></button>
        </div>

        <div class="modal-body p-4">
          <form @submit.prevent="props.handleUpdateTask">
            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="text-uppercase text-muted fw-bold small mb-1"
                  >Project / Job Name</label
                >
                <div
                  class="d-flex align-items-center p-2 bg-light rounded border-start border-4 border-primary"
                >
                  <i class="bi bi-briefcase-fill text-primary me-2 fs-5"></i>
                  <span class="fw-bold fs-5 text-dark">{{ currentTaskForm.project_name }}</span>
                </div>
              </div>

              <div class="col-md-12">
                <label class="text-uppercase text-muted fw-bold small mb-1">Task Name</label>
                <div class="border-bottom pb-2 fs-5 fw-bold text-dark">
                  {{ currentTaskForm.name }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="text-uppercase text-muted fw-bold small mb-1">Start Date</label>
                <div class="text-dark fw-medium">
                  <i class="bi bi-calendar-check me-1 text-success"></i>
                  {{ currentTaskForm.start_date }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="text-uppercase text-muted fw-bold small mb-1">Due Date</label>
                <div class="text-dark fw-medium">
                  <i class="bi bi-calendar-x me-1 text-danger"></i> {{ currentTaskForm.end_date }}
                </div>
              </div>

              <div class="col-12">
                <label class="text-uppercase text-muted fw-bold small mb-1">Description</label>
                <div
                  class="p-3 bg-light rounded border text-secondary"
                  style="min-height: 80px; white-space: pre-line"
                >
                  {{ currentTaskForm.description || 'No description provided.' }}
                </div>
              </div>
            </div>

            <hr class="my-4" />
            <h6 class="fw-bold text-primary mb-3">Your Progress Update</h6>

            <div class="row g-3">
              <div class="col-md-5">
                <label class="form-label fw-bold">Status</label>
                <select class="form-select" v-model="currentTaskForm.status">
                  <option value="todo">To Do</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div class="col-md-7">
                <label class="form-label fw-bold d-flex justify-content-between">
                  <span>Current Progress</span>
                  <span class="badge bg-primary">{{ currentTaskForm.progress }}%</span>
                </label>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-circle small text-muted"></i>
                  <input
                    type="range"
                    class="form-range"
                    v-model.number="currentTaskForm.progress"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <i class="bi bi-check-circle-fill small text-success"></i>
                </div>
              </div>
            </div>

            <div class="document-section">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label small fw-bold text-muted text-uppercase mb-0">
                  <i class="bi bi-paperclip me-1"></i> Task Documents
                </label>

                <div>
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

              <div v-if="currentTaskForm.documents?.length > 0" class="mt-4">
                <div class="row g-3">
                  <div v-for="doc in currentTaskForm.documents" :key="doc.id" class="col-12">
                    <div class="d-flex align-items-center p-3 border rounded shadow-sm hover-bg position-relative bg-white">
                      <div class="flex-shrink-0 me-3">
                        <i class="bi bi-file-earmark-pdf-fill fs-2 text-danger" v-if="doc.name.endsWith('.pdf') "></i>
                        <i class="bi bi-file-earmark-image-fill fs-2 text-success" v-else-if="doc.name.match(/\.(jpg|jpeg|png)$/i)"></i>
                        <i class="bi bi-file-earmark-text-fill fs-2 text-primary" v-else></i>
                      </div>

                      <div class="flex-grow-1 m-0 overflow-hidden">
                        <p class="mb-0 text-truncate fw-medium" :title="doc.name" style="max-width: 100%;">
                          {{ doc.name }}
                        </p>
                        <small class="text-muted d-block text-truncate">
                          By: {{ doc.user?.manager?.name || doc.user?.employee?.name }}
                        </small>
                      </div>

                      <div class="d-flex gap-1 flex-shrink-0 ms-2">
                        <button type="button" @click="handleDownload(doc)" class="btn btn-sm btn-outline-primary border" title="Download">
                          <i class="bi bi-download"></i>
                        </button>
                        <button v-if="doc.user.employee" @click="handleDeleteDoc(doc.id)" type="button" class="btn btn-sm btn-outline-danger border" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
              <button type="button" class="btn btn-outline-secondary px-4" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary px-4" :disabled="props.updateLoading">
                <span
                  v-if="props.updateLoading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6c757d;
}
tbody tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.005);
  transition: all 0.1s;
}

.form-range::-webkit-slider-thumb {
  background: #0d6efd;
}
</style>
