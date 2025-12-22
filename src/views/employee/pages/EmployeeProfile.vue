<script setup lang="ts">
import employeeApi from "@/api/employee/employeeApi.ts"
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const employee = ref<any>(null)
const loading = ref(true)
const errorMsg = ref("")

async function getEmployee() {
  loading.value = true
  errorMsg.value = ""
  try {
    const res = await employeeApi.getEmployee()
    employee.value = res.data.data
    console.log(res.data.data)
  } catch (error) {
    console.error(error)
    errorMsg.value = "Unable to load profile. Please try again."
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
  return employee.value?.name?.charAt(0).toUpperCase() || "?"
})

onMounted(getEmployee)
</script>

<template>
  <div class="profile-page-wrapper py-5">
    <div class="container" style="max-width: 700px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="fw-bold text-dark mb-0">My Profile</h3>
        <button class="btn btn-light shadow-sm btn-sm px-3 rounded-pill" @click="backToHome">
          <i class="bi bi-arrow-left me-2"></i> Back
        </button>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm p-5 text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div class="text-muted">Loading profile...</div>
      </div>

      <div v-else-if="errorMsg" class="alert alert-custom-danger shadow-sm border-0 d-flex align-items-center">
        <i class="bi bi-exclamation-circle-fill me-3 fs-4"></i>
        <div>{{ errorMsg }}</div>
      </div>

      <div v-else-if="employee" class="profile-card bg-white shadow-lg overflow-hidden">
        <div class="profile-banner"></div>

        <div class="card-body p-4 pt-0">
          <div class="profile-header-main text-center text-md-start d-md-flex align-items-end mb-4">
            <div class="avatar-container shadow-lg">
              <img v-if="employee.avatar_url" :src="employee.avatar_url" class="img-fluid rounded-circle"  alt=""/>
              <div v-else class="avatar-text text-white bg-primary">{{ avatarPlaceholder }}</div>
            </div>

            <div class="ms-md-4 mt-3 mt-md-0 flex-grow-1">
              <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <h2 class="fw-bold mb-0 text-dark">{{ employee.name }}</h2>
                <span class="badge rounded-pill text-bg-primary-soft text-uppercase px-3">
                  {{ employee.user?.role || "Employee" }}
                </span>
              </div>

              <p class="text-muted mb-0">
                <i class="bi bi-envelope me-1"></i> {{ employee.user?.email || "N/A" }}
              </p>
            </div>
          </div>

          <hr class="opacity-10 my-4" />

          <div class="row g-4">
            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box"><i class="bi bi-hash"></i></div>
                <div>
                  <label>Employee ID</label>
                  <p>{{ employee.id }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box"><i class="bi bi-telephone"></i></div>
                <div>
                  <label>Phone Number</label>
                  <p>{{ employee.phone || "Not provided" }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box"><i class="bi bi-person-badge"></i></div>
                <div>
                  <label>Direct Manager</label>
                  <p>{{ employee.manager ? employee.manager.name : "N/A" }}</p>
                </div>
              </div>
            </div>

            <div class="col-sm-6">
              <div class="info-item">
                <div class="icon-box"><i class="bi bi-calendar-check"></i></div>
                <div>
                  <label>Joined Date</label>
                  <p>{{ formatDate(employee.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <p class="mt-3">No data found.</p>
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

.profile-banner {
  height: 120px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
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

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 16px;
  transition: all 0.2s;
}

.info-item:hover {
  background-color: #f1f5f9;
}

.icon-box {
  width: 42px;
  height: 42px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.2rem;
}

.info-item label {
  display: block;
  font-size: 0.75rem;
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

.text-bg-primary-soft {
  background-color: #e0e7ff;
  color: #4338ca;
  font-size: 0.7rem;
}

.alert-custom-danger {
  background-color: #fef2f2;
  color: #b91c1c;
}
</style>
