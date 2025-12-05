import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NovelView from "@/views/Novel/NovelView.vue";
import AdminLayout from "@/views/Admin/AdminLayout.vue";
import AuthService from "@/services/auth.service";

// Route guard to check authentication
const requireAuth = (to, from, next) => {
    if (!AuthService.isLoggedIn()) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    } else {
        next();
    }
};

// Route guard to check admin role
const requireAdmin = (to, from, next) => {
    if (!AuthService.isLoggedIn()) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    } else if (!AuthService.isAdmin()) {
        next({ path: '/' }); // Redirect to home if not admin
    } else {
        next();
    }
};

const routes = [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    {
        path: "/search",
        name: "search",
        component: () => import("@/views/Search.vue"),
    },
    {
        path: "/novels/add",
        name: "novel-add",
        component: () => import("@/views/Novel/NovelAdd.vue"),
        beforeEnter: requireAuth,
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
        beforeEnter: requireAuth,
    },
    {
        path: "/chapters/edit/:id",
        name: "chapter-edit",
        component: () => import("@/views/Chapter/ChapterEdit.vue"),
        beforeEnter: requireAuth,
    },
    // Admin Routes
    {
        path: "/admin",
        component: AdminLayout,
        beforeEnter: requireAdmin,
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
    // Favorites Route
    {
        path: "/favorites",
        name: "favorites",
        component: () => import("@/views/Favorite.vue"),
        beforeEnter: requireAuth,
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
        beforeEnter: requireAuth,
    },
    // Account Route
    {
        path: "/account/:userId?",
        name: "account",
        component: () => import("@/views/Account.vue"),
        beforeEnter: requireAuth,
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("@/views/NotFound.vue"),
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // If there's a saved position (browser back/forward), use it
        if (savedPosition) {
            return savedPosition;
        }
        // If navigating to a hash (anchor), scroll to that element
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            };
        }
        // Otherwise, always scroll to top
        return { top: 0, behavior: 'smooth' };
    }
});

export default router;
