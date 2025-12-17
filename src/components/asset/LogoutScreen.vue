<script setup lang="ts">
const props = defineProps<{
  isLogout : boolean;
}>();
</script>

<template>
  <div v-if="isLogout" class="logout-overlay">
    <div class="text-center">
      <div class="spinner-border text-light mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
      <h5 class="text-white">Logging out...</h5>
    </div>
  </div>
</template>

<style scoped>
.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(125, 155, 238, 0.7); /* Màu đen mờ */
  z-index: 9999; /* Đảm bảo nằm trên cùng, che cả Sidebar/Modal */
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px); /* Hiệu ứng làm mờ background phía sau (Optional) */
}
</style>
