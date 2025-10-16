import createApiClient from "./api.service";

class ChapterService {
    constructor(baseUrl = "/api/chapters") {
        this.api = createApiClient(baseUrl);
    }

    // Get all chapters
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Get chapter by ID
    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    // Get chapters by novel ID
    async getByNovelId(novelId) {
        return (await this.api.get(`/novel/${novelId}`)).data;
    }

    // Create new chapter
    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    // Update chapter
    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    // Delete chapter
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Delete all chapters
    async deleteAll() {
        return (await this.api.delete("/")).data;
    }

    // Delete all chapters of a novel
    async deleteByNovelId(novelId) {
        return (await this.api.delete(`/novel/${novelId}`)).data;
    }
}

export default new ChapterService();
