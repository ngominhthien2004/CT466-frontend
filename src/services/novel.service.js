import createApiClient from "./api.service";

class NovelService {
    constructor(baseUrl = "/api/novels") {
        this.api = createApiClient(baseUrl);
    }

    // Get all novels
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Get novel by ID
    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    // Create new novel
    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    // Update novel
    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    // Delete novel
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Delete all novels
    async deleteAll() {
        return (await this.api.delete("/")).data;
    }

    // Get favorite novels
    async getFavorites() {
        return (await this.api.get("/favorite")).data;
    }
}

export default new NovelService();
