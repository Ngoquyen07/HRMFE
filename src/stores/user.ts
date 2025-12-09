import { ref } from "vue";
import type { User } from "../interfaces/User";

export const user = ref<User | null>(null);