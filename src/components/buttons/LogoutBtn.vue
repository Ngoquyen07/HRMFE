<script setup lang="ts">
import { useRouter } from "vue-router";
import auth from "@/api/auth/auth.ts";
import { user } from '@/stores/user.ts'

const router = useRouter();

async function handleLogout() {
  try {
    await auth.logout();  // gọi API logout Laravel
  } catch (e) {
    console.error(e);
  } finally {
    user.value = null;
    router.push("/login");
  }
}
</script>

<template>
  <button class="btn btn-danger" @click="handleLogout">
    Logout
  </button>
</template>

<style scoped>
</style>
