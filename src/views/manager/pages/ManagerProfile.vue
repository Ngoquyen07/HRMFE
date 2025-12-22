<script setup lang="ts">
import managerApi from '@/api/manager/managerApi.ts'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const manager = ref<any>(null)
const loading = ref(true)
const errorMsg = ref("")

async function getManager() {
  loading.value = true
  errorMsg.value = ""
  try {
    const res = await managerApi.getManager()
    manager.value = res.data.data
  } catch (err) {
    console.error(err)
    errorMsg.value = "Not Found"
  } finally {
    loading.value = false
  }
}

const backToHome = () => router.push("/")

const formatDate = (iso: string) => {
  if (!iso) return "N/A"
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const avatarPlaceholder = computed(() => {
  return manager.value?.name?.charAt(0).toUpperCase() || "M"
})

onMounted(getManager)
</script>

<template>
  <div class="profile-page-wrapper py-5">
    <div class="container" style="max-width: 700px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-dark mb-0">My Profile</h3>
        <button class="btn btn-white shadow-sm btn-sm px-3 rounded-pill border" @click="backToHome">
          <i class="bi bi-arrow-left me-2"></i> Back
        </button>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm p-5 text-center rounded-4">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div class="text-muted">Loading manager data...</div>
      </div>

      <div v-else-if="errorMsg" class="alert alert-custom-danger shadow-sm border-0 d-flex align-items-center rounded-4">
        <i class="bi bi-exclamation-circle-fill me-3 fs-4"></i>
        <div>{{ errorMsg }}</div>
      </div>

      <div v-else-if="manager" class="profile-card bg-white shadow-lg overflow-hidden">
        <div class="profile-banner"></div>

        <div class="card-body p-4 pt-0">
          <div class="profile-header-main text-center text-md-start d-md-flex align-items-end mb-4">
            <div class="avatar-container shadow-lg">
              <img v-if="manager.avatar_url" :src="manager.avatar_url" class="img-fluid rounded-circle" alt="Avatar"/>
              <div v-else class="avatar-text text-white bg-manager-gradient">{{ avatarPlaceholder }}</div>
            </div>

            <div class="ms-md-4 mt-3 mt-md-0 flex-grow-1">
              <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <h2 class="fw-bold mb-0 text-dark">{{ manager.name }}</h2>
                <span class="badge rounded-pill text-bg-warning-soft text-uppercase px-3">
                  {{ "Manager" }}
                </span>
              </div>

              <p class="text-muted mb-0">
                <i class="bi bi-envelope me-1"></i> {{ manager.user?.email || "N/A" }}
              </p>
            </div>
          </div>

          <hr class="opacity-10 my-4" />

          <div class="row g-4">
            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box-manager"><i class="bi bi-shield-lock"></i></div>
                <div>
                  <label>Manager ID</label>
                  <p>{{ manager.id }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box-manager"><i class="bi bi-telephone"></i></div>
                <div>
                  <label>Phone Number</label>
                  <p>{{ manager.phone || "Not provided" }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box-manager"><i class="bi bi-briefcase"></i></div>
                <div>
                  <label>Job Position</label>
                  <p class="text-primary fw-bold">{{ manager.position }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box-manager"><i class="bi bi-calendar-check"></i></div>
                <div>
                  <label>System Joined</label>
                  <p>{{ formatDate(manager.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <p class="mt-3">No manager data found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
}

.profile-card {
  border-radius: 24px;
  border: none;
  position: relative;
}

/* Banner màu Cam/Vàng đặc trưng cho Manager */
.profile-banner {
  height: 130px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.avatar-container {
  width: 120px;
  height: 120px;
  background: white;
  padding: 5px;
  border-radius: 30px;
  margin-top: -60px;
  position: relative;
  z-index: 2;
}

.avatar-text {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.bg-manager-gradient {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 18px;
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.info-item:hover {
  background-color: #fffbeb;
  border-color: #fef3c7;
  transform: translateY(-2px);
}

.icon-box-manager {
  width: 44px;
  height: 44px;
  background: #fffbeb;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.25rem;
}

.info-item label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.info-item p {
  margin-bottom: 0;
  font-weight: 600;
  color: #334155;
}

/* Badge màu vàng nhạt */
.text-bg-warning-soft {
  background-color: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  font-weight: 600;
}

.alert-custom-danger {
  background-color: #fef2f2;
  color: #b91c1c;
}

.btn-white {
  background: white;
  color: #334155;
}
</style>