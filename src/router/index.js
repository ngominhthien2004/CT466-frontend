import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    // TODO: Thêm các route sau khi tạo file view tương ứng
    // {
    //     path: "/novels/:id",
    //     name: "novel-detail",
    //     component: () => import("@/views/NovelDetail.vue"),
    // },
    // {
    //     path: "/favorites",
    //     name: "favorites",
    //     component: () => import("@/views/Favorites.vue"),
    // },
    // {
    //     path: "/history",
    //     name: "history",
    //     component: () => import("@/views/History.vue"),
    // },
    // {
    //     path: "/categories",
    //     name: "categories",
    //     component: () => import("@/views/Categories.vue"),
    // },
    // {
    //     path: "/login",
    //     name: "login",
    //     component: () => import("@/views/Login.vue"),
    // },
    // {
    //     path: "/register",
    //     name: "register",
    //     component: () => import("@/views/Register.vue"),
    // },
    // {
    //     path: "/profile",
    //     name: "profile",
    //     component: () => import("@/views/Profile.vue"),
    // },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
