<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import auth from "@/api/auth/auth.ts";
import SuccessToast from "@/components/toasts/SuccessToast.vue";

const router = useRouter();

const form = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const message = ref("");      // popup success
const errors = ref<any>({});  // chứa lỗi 422

async function handleLogin() {
  loading.value = true;
  errors.value = {};
  message.value = "";

  try {
    const res = await auth.login(form.value);
    console.log(res);

    // SUCCESS
    message.value = "Login successfully!";
    const user = res.data.user;

    // Redirect theo role
    if (user.role === "employee") {
      router.push("/employee/home");
    } else if (user.role === "manager") {
      router.push("/manager/home");
    }

  } catch (error: any) {

    if (error.response?.status === 422) {
      // Lỗi validate từ backend
      errors.value = error.response.data.errors;
    } else {
      // Lỗi khác (401 hoặc server)
      message.value = error.response?.data?.message ?? "Login failed!";
    }

  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <SuccessToast :message="message" />

  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-lg p-4" style="width: 100%; max-width: 420px;">

      <h3 class="text-center mb-4 fw-bold">Login</h3>

      <form @submit.prevent="handleLogin">

        <!-- EMAIL -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            v-model="form.email"
            placeholder="Enter your email"
          />
          <!-- ERROR email -->
          <div class="invalid-feedback" v-if="errors.email">
            {{ errors.email[0] }}
          </div>
        </div>

        <!-- PASSWORD -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Password</label>
          <input
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            v-model="form.password"
            placeholder="Enter your password"
          />

          <!-- ERROR password -->
          <div class="invalid-feedback" v-if="errors.password">
            {{ errors.password[0] }}
          </div>
        </div>

        <!-- BUTTON -->
        <button
          type="submit"
          class="btn btn-primary w-100 mt-2"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Login
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
</style>
