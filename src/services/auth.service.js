import createApiClient from "./api.service";

class AuthService {
    constructor(baseUrl = "/api/auth") {
        this.api = createApiClient(baseUrl);
    }

    // Register new user
    async register(data) {
        return (await this.api.post("/register", data)).data;
    }

    // Login user
    async login(data) {
        return (await this.api.post("/login", data)).data;
    }

    // Save user to localStorage
    saveUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    // Get user from localStorage
    getUser() {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getUser();
    }

    // Logout user
    logout() {
        localStorage.removeItem("user");
    }

    // Get current user ID
    getCurrentUserId() {
        const user = this.getUser();
        return user ? user._id : null;
    }

    // Get current user role
    getCurrentUserRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }

    // Check if user is admin
    isAdmin() {
        return this.getCurrentUserRole() === "admin";
    }
}

export default new AuthService();
