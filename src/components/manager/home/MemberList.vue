<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  employees :any,
}>();

const hoveredEmployeeId = ref<number | null>(null);
</script>

<template>
  <div class="col-lg-4">
    <div class="card shadow-sm border-0" style="overflow: visible;">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">Team Members</h5>
        <span class="badge bg-light text-dark border">{{ props.employees.length }}</span>
      </div>

      <ul class="list-group list-group-flush">
        <li
          v-for="emp in props.employees"
          :key="emp.id"
          class="list-group-item position-relative py-3 border-0 border-bottom member-row"
          @mouseenter="hoveredEmployeeId = emp.id"
          @mouseleave="hoveredEmployeeId = null"
        >
          <div class="d-flex align-items-center">
            <div>
              <h6 class="mb-0 text-dark">{{ emp.name }}</h6>
              <small class="text-muted" style="font-size: 0.8rem">{{ emp.user.email }}</small>
            </div>
          </div>

          <div v-if="hoveredEmployeeId === emp.id" class="hover-card shadow-lg p-3 rounded">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-lg bg-light text-primary me-3 d-flex align-items-center justify-content-center rounded-circle">
                <i class="bi bi-person-badge fs-3"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-primary">{{ emp.name }}</h6>
                <small class="text-muted">ID: #{{ emp.id }}</small>
              </div>
            </div>
            <div class="info-row mb-1">
              <i class="bi bi-envelope me-2 text-secondary"></i>
              <span>{{ emp.user.email }}</span>
            </div>
            <div class="info-row mb-1">
              <i class="bi bi-telephone me-2 text-secondary"></i>
              <span>{{ emp.phone || 'N/A' }}</span>
            </div>
          </div>
        </li>

        <li v-if="props.employees.length === 0" class="list-group-item text-center text-muted py-3">
          No employees assigned
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.member-row {
  cursor: pointer;
  transition: background-color 0.2s;
}
.member-row:hover {
  background-color: #f8f9fa;
}
/*Hiển thị ở trên giữa*/
.hover-card {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  width: 280px;
  background-color: white;
  z-index: 1050;
  border: 1px solid rgba(0,0,0,0.1);
  animation: fadeInTop 0.2s ease-in-out;
}

/* Mũi tên chỉ xuống dưới */
.hover-card::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}

.avatar-lg {
  width: 50px;
  height: 50px;
}

.info-row {
  font-size: 0.9rem;
  color: #555;
  display: flex;
  align-items: center;
}

/* Animation */
@keyframes fadeInTop {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>