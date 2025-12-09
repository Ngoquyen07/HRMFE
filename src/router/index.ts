import { createWebHistory, createRouter } from "vue-router";
import auth from "../api/auth/auth.ts";
import Login from "../views/auth/Login.vue";
import EmployeeHome from '@/views/employee/pages/Home.vue'
import ManagerHome from '@/views/manager/pages/Home.vue'
import NotFound from '@/views/errorNotFound/404.vue'
import { user } from '@/stores/user.ts'
import ProjectDetail from '@/views/manager/pages/ProjectDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    // Route gốc: Sẽ được xử lý điều hướng trong beforeEach
    {
      path: "/",
      name: "root",
      redirect: to => {
        // Redirect tạm thời, logic chính nằm ở beforeEach
        return { name: 'login' };
      }
    },
    {
      path: "/employee/home",
      name: "employee.home",
      component: EmployeeHome,
      meta: { role: "employee" },
    },
    {
      path: "/manager/home",
      name: "manager.home",
      component: ManagerHome,
      meta: { role: "manager" },
    },
    {
      path:"/manager/projects/:id",
      name :"manager.projects.details",
      component : ProjectDetail,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: NotFound,
    }
  ]
});

router.beforeEach(async (to, _from, next) => {
  // 1. LẤY THÔNG TIN USER NẾU CHƯA CÓ (F5 trang)
  try {
    if (!user.value) {
      // Giả sử API trả về structure: { data: { role: '...', ... } }
      const res = await auth.getUser();
      user.value = res.data;
    }
  } catch (error) {
    user.value = null;
  }

  console.log('Log user from router ( index.ts) ', user.value);

  // 2. TRƯỜNG HỢP: CHƯA ĐĂNG NHẬP
  if (!user.value) {
    // Nếu đang cố vào trang login thì cho qua
    if (to.name === "login") {
      return next();
    }
    // Các trang khác -> đá về login
    return next({ name: "login" });
  }

  // 3. TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP
  // Xác định trang chủ dựa trên Role hiện tại
  const role = user.value.role; // 'manager' hoặc 'employee'

  // Mapping role sang route name tương ứng
  const homeRouteName = role === 'manager' ? 'manager.home' : 'employee.home';

  // 3a. Nếu đã login mà cố vào trang Login HOẶC trang gốc (/)
  // -> Chuyển hướng về trang chủ của role đó
  if (to.name === "login" || to.path === "/") {
    return next({ name: homeRouteName });
  }

  // 3b. Kiểm tra quyền truy cập (Role Guard)
  // Nếu route đích có yêu cầu role (meta.role) VÀ role đó khác role của user
  if (to.meta.role && to.meta.role !== role) {
    // Ví dụ: User là 'employee' nhưng cố vào URL '/manager/home'
    // -> Đá về trang chủ đúng của họ (hoặc trang 403 tùy bạn)
    return next({ name: homeRouteName });
  }

  // 4. Các trường hợp hợp lệ -> Cho đi tiếp
  next();
});

export default router;