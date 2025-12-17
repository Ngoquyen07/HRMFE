<script setup lang="ts">
import { ref } from 'vue'
import auth from '@/api/auth/auth.ts'
import { user } from '@/stores/user.ts'
import router from '@/router'

const isLogout = ref(false)

async function logout() {
  isLogout.value = true
  try {
    await auth.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    user.value = null;
    setTimeout(() => {
      router.push("/login");
    }, 500);
  }
}
</script>

<template>
  <div v-if="isLogout" class="logout-overlay-wrapper">
    <div class="card logout-card shadow-lg border-0">
      <div class="card-body text-center p-4">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
        <h5 class="card-title text-dark fw-bold">Logging out...</h5>
        <p class="card-text text-muted small">Please wait a moment</p>
      </div>
    </div>
  </div>

  <button
    class="btn btn-outline-secondary mb-3"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#sidebar"
  >
    ☰
  </button>
  <div
    class="offcanvas offcanvas-start text-bg-dark"
    tabindex="-1"
    id="sidebar"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Menu</h5>
      <button
        type="button"
        class="btn-close btn-close-white"
        data-bs-dismiss="offcanvas"
      ></button>
    </div>

    <div class="offcanvas-body">
      <RouterLink to="#" class="btn btn-outline-light w-100 mb-3">
        <i class="bi bi-person-circle me-2"></i> Profile
      </RouterLink>

      <button class="btn btn-danger w-100" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i> Logout
      </button>
    </div>
  </div>
</template>

<style scoped>
.logout-overlay-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;

  backdrop-filter: blur(2px);
}

.logout-card {
  width: 300px;
  background-color: white;
  border-radius: 12px;
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>