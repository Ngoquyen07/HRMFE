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
      redirect: _to => {
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
  //  Lấy thông tin user .
  try {
    if (!user.value) {
      const res = await auth.getUser();
      user.value = res.data;
    }
  } catch (error) {
    user.value = null;
  }

  // Không lấy được ( Chưa đăng nhập ) -> Chuyển về trang login
  if (!user.value) {
    if (to.name === "login") {
      return next();
    }
    return next({ name: "login" });
  }

  // Đã đăng nhập -> Check role
  const role = user.value.role;
  const homeRouteName = role === 'manager' ? 'manager.home' : 'employee.home';

  // Tự điều hướng ở trang login hoặc '/'
  if (to.name === "login" || to.path === "/") {
    return next({ name: homeRouteName });
  }
  // Sai role ( cố truy cập sang trang của role khác ) -> chuyển về trang chủ .
  if (to.meta.role && to.meta.role !== role) {
    return next({ name: homeRouteName });
  }
  next();
});

export default router;