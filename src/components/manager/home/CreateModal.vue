<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  showModal: boolean;
  closeModal: () => void;
  submitProject :any;
  isSubmitting :boolean;
}>();

const form = inject<any>("form");
const errors = inject<any>("errors", {});
</script>

<template>
  <div v-if="props.showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content shadow-lg border-0">

        <div class="modal-header bg-white border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold text-primary">
            <i class="bi bi-rocket-takeoff me-2"></i>New Project
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body pt-4">
          <form @submit.prevent="props.submitProject">

            <div class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label fw-bold small text-uppercase text-muted">Project Name </label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-fonts"></i></span>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors?.name }"
                    placeholder="Enter project title..."
                  >
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
                  <span class="input-group-text bg-light"><i class="bi bi-calendar-check"></i></span>
                  <input
                    v-model="form.start_date"
                    type="date"
                    class="form-control"
                    :class="{ 'is-invalid': errors?.start_date }"
                  >
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
                  >
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

            <div class="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" class="btn btn-light px-4" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary px-4 shadow-sm" :disabled="props.isSubmitting">
                <span v-if="props.isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
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
</style>