import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NovelView from "@/views/NovelView.vue";
import AdminLayout from "@/views/Admin/AdminLayout.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    {
        path: "/novels/add",
        name: "novel-add",
        component: () => import("@/views/Novel/NovelAdd.vue"),
    },
    {
        path: "/novels/:id/edit",
        name: "novel-edit",
        component: () => import("@/views/Novel/NovelEdit.vue"),
    },
    {
        path: "/novels/:id",
        name: "novel-detail",
        component: NovelView,
    },
    // Admin Routes
    {
        path: "/admin",
        component: AdminLayout,
        children: [
            {
                path: "",
                name: "admin-dashboard",
                component: () => import("@/views/Admin/Dashboard.vue"),
            },
            {
                path: "novels",
                name: "admin-novels",
                component: () => import("@/views/Admin/ManageNovels.vue"),
            },
            {
                path: "chapters",
                name: "admin-chapters",
                component: () => import("@/views/Admin/ManageChapters.vue"),
            },
            {
                path: "users",
                name: "admin-users",
                component: () => import("@/views/Admin/ManageUsers.vue"),
            },
            {
                path: "comments",
                name: "admin-comments",
                component: () => import("@/views/Admin/ManageComments.vue"),
            },
        ]
    },
    // Auth Routes
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/Auth/Login.vue"),
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@/views/Auth/Register.vue"),
    },
    // TODO: Thêm các route sau khi tạo file view tương ứng
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
    //     path: "/profile",
    //     name: "profile",
    //     component: () => import("@/views/Profile.vue"),
    // },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/views/NotFound.vue"),
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
