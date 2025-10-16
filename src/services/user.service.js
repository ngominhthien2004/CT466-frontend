import createApiClient from "./api.service";

class UserService {
    constructor(baseUrl = "/api/users") {
        this.api = createApiClient(baseUrl);
    }

    // Get all users
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Get user by ID
    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    // Get user profile
    async getProfile(id) {
        return (await this.api.get(`/profile/${id}`)).data;
    }

    // Get users by role
    async getByRole(role) {
        return (await this.api.get(`/role/${role}`)).data;
    }

    // Get active users
    async getActive() {
        return (await this.api.get("/active")).data;
    }

    // Update user
    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    // Update user profile
    async updateProfile(id, data) {
        return (await this.api.put(`/profile/${id}`, data)).data;
    }

    // Change password
    async changePassword(id, data) {
        return (await this.api.put(`/change-password/${id}`, data)).data;
    }

    // Delete user
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Delete all users
    async deleteAll() {
        return (await this.api.delete("/")).data;
    }
}

export default new UserService();
