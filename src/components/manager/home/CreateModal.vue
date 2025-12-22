<script setup lang="ts">
import { inject, ref, watch } from 'vue'

const props = defineProps<{
  showModal: boolean
  closeModal: () => void
  submitProject: (files: File[]) => void // Thêm tham số files vào hàm submit
  isSubmitting: boolean
  uploadProgress: number // Nhận progress từ component cha
}>()

const form = inject<any>('form')
const errors = inject<any>('errors', {})

// Quản lý file nội bộ trong modal
const selectedFiles = ref<File[]>([])

const handleFileChange = (e: any) => {
  const newFiles = Array.from(e.target.files) as File[]
  // giữ lại file cũ và thêm file mới
  selectedFiles.value = [...selectedFiles.value, ...newFiles]
  //clear
  e.target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// Hàm wrap lại submit để gửi kèm file
const onInternalSubmit = () => {
  props.submitProject(selectedFiles.value)
}

watch(
  () => props.showModal,
  (newVal) => {
    if (!newVal) {
      selectedFiles.value = []
    }
  },
)
</script>

<template>
  <div
    v-if="props.showModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header bg-white border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold text-primary">
            <i class="bi bi-rocket-takeoff me-2"></i>New Project
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body pt-4">
          <form @submit.prevent="onInternalSubmit">
            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold small text-uppercase text-muted"
                  >Project Name
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-fonts"></i></span>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors?.name }"
                    placeholder="Enter project title..."
                  />
                </div>
                <div class="d-block invalid-feedback mt-1" v-if="errors?.name">
                  {{ errors.name[0] }}
                </div>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold small text-uppercase text-muted">Start Date</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"
                    ><i class="bi bi-calendar-check"></i
                  ></span>
                  <input
                    v-model="form.start_date"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors?.start_date }"
                  />
                </div>
                <div class="d-block invalid-feedback mt-1" v-if="errors?.start_date">
                  {{ errors.start_date[0] }}
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold small text-uppercase text-muted">End Date</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-calendar-x"></i></span>
                  <input
                    v-model="form.end_date"
                    type="date"
                    class="form-control"
                    :min="form.start_date"
                    :class="{ 'is-invalid': errors?.end_date }"
                  />
                </div>
                <div class="d-block invalid-feedback mt-1" v-if="errors?.end_date">
                  {{ errors.end_date[0] }}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-bold small text-uppercase text-muted">Description</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="bi bi-card-text"></i></span>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="form-control"
                  :class="{ 'is-invalid': errors?.description }"
                  placeholder="Describe the project goals and requirements..."
                ></textarea>
              </div>
              <div class="d-block invalid-feedback mt-1" v-if="errors?.description">
                {{ errors.description[0] }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold small text-uppercase text-muted"
                >Project Documents</label
              >
              <div class="upload-area border rounded-3 p-3 bg-light">
                <input
                  type="file"
                  multiple
                  class="form-control mb-2"
                  @change="handleFileChange"
                  id="fileInput"
                />

                <div v-if="selectedFiles.length > 0" class="mt-2">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="d-flex align-items-center justify-content-between bg-white p-2 mb-1 rounded border shadow-sm small"
                  >
                    <span class="text-truncate" style="max-width: 80%"
                      ><i class="bi bi-file-earmark-check me-2"></i>{{ file.name }}</span
                    >
                    <button
                      type="button"
                      class="btn-close small"
                      style="font-size: 0.6rem"
                      @click="removeFile(index)"
                    ></button>
                  </div>
                </div>
              </div>
              <div class="d-block invalid-feedback mt-1" v-if="errors?.files">
                {{ errors.files[0] }}
              </div>
            </div>

            <div v-if="props.isSubmitting && props.uploadProgress > 0" class="mb-4">
              <div class="d-flex justify-content-between mb-1 small fw-bold text-primary">
                <span>Uploading files...</span>
                <span>{{ props.uploadProgress }}%</span>
              </div>
              <div class="progress" style="height: 8px">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  :style="{ width: props.uploadProgress + '%' }"
                ></div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" class="btn btn-light px-4" @click="closeModal">Cancel</button>
              <button
                type="submit"
                class="btn btn-primary px-4 shadow-sm"
                :disabled="props.isSubmitting"
              >
                <span
                  v-if="props.isSubmitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <span v-else><i class="bi bi-rocket-takeoff me-1"></i> Create Project</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-group-text {
  border-right: 0;
  background-color: #f8f9fa;
}
/* Style focus đẹp */
.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
  z-index: 0; /* Fix lỗi input đè lên icon khi focus */
}
.form-control {
  border-left: 0;
}
/* Style cho error */
.is-invalid {
  border-color: #dc3545 !important;
  background-image: none !important; /* Tắt icon X mặc định của bootstrap nếu bị chồng chéo */
}
/* Vì input border-left=0 nên khi lỗi cần thêm border left đỏ để dễ nhìn */
.form-control.is-invalid {
  border-left: 1px solid #dc3545;
}
.upload-area {
  border: 2px dashed #dee2e6 !important;
}
</style>