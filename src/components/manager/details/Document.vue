<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  projectInfo : any;
  handleDownload : (doc : any) => void;
  handleUpload : (files: FileList , model : any) => void;
  handleDelete : (docId: number) => void;
  isUploading: boolean;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = (e: any) => {
  if (e.target.files.length > 0) {
    props.handleUpload(e.target.files , {type : 'project' , id : props.projectInfo.id});
    e.target.value = ''; // Reset input
  }
};
</script>

<template>
  <div class="card border-0 shadow-sm mt-4" v-if="projectInfo">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h6 class="mb-0 fw-bold"><i class="bi bi-paperclip me-2"></i>Project Documents</h6>

      <button @click="triggerFileInput" class="btn btn-sm btn-primary" :disabled="isUploading">
        <span v-if="isUploading" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="bi bi-plus-lg me-1"></i> Add File
      </button>
      <input type="file" ref="fileInput" class="d-none" multiple @change="onFileChange" />
    </div>

    <div class="card-body">
      <div v-if="projectInfo.documents.length === 0" class="text-center py-4 text-muted">
        No documents attached to this project.
      </div>

      <div class="row g-3">
        <div v-for="doc in projectInfo.documents" :key="doc.id" class="col-md-6 col-lg-4">
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
              <button @click="handleDelete(doc.id)" class="btn btn-sm btn-outline-danger border" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-bg:hover {
  background-color: #f8f9fa;
  transition: 0.2s;
}
</style>