import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NovelView from "@/views/Novel/NovelView.vue";
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
        path: "/novels/:id",
        name: "novel-detail",
        component: NovelView,
    },
    {
        path: "/novels/:id/chapters/:chapterId",
        name: "chapter-view",
        component: () => import("@/views/Chapter/ChapterView.vue"),
    },
    {
        path: "/chapters/:chapterId",
        name: "chapter-view-short",
        component: () => import("@/views/Chapter/ChapterView.vue"),
    },
    // Chapter Management Routes (accessible to all authenticated users)
    {
        path: "/chapters/add",
        name: "chapter-add",
        component: () => import("@/views/Chapter/ChapterAdd.vue"),
    },
    {
        path: "/chapters/edit/:id",
        name: "chapter-edit",
        component: () => import("@/views/Chapter/ChapterEdit.vue"),
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
                path: "users",
                name: "admin-users",
                component: () => import("@/views/Admin/ManageUsers.vue"),
            },
            {
                path: "genres",
                name: "admin-genres",
                component: () => import("@/views/Admin/ManageGenres.vue"),
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
    // Favorites Route
    {
        path: "/favorites",
        name: "favorites",
        component: () => import("@/views/Favorite.vue"),
    },
    // Genre Routes
    {
        path: "/genres",
        name: "genres",
        component: () => import("@/views/Genre.vue"),
    },
    {
        path: "/genres/:slug",
        name: "genre-detail",
        component: () => import("@/views/Genre/GenreDetailView.vue"),
    },
    // Reading History Route
    {
        path: "/reading-history",
        name: "reading-history",
        component: () => import("@/views/ReadingHistory.vue"),
    },
    // TODO: Thêm các route sau khi tạo file view tương ứng
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
