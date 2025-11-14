import createApiClient from "./api.service";

class CommentService {
    constructor(baseUrl = "/api/comments") {
        this.api = createApiClient(baseUrl);
    }

    // Get all comments
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Get comment by ID
    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    // Get comments by novel ID
    async getByNovelId(novelId) {
        return (await this.api.get(`/novel/${novelId}`)).data;
    }

    // Get comments by chapter ID
    async getByChapterId(chapterId) {
        return await this.api.get(`/chapter/${chapterId}`);
    }

    // Get comments by user ID
    async getByUserId(userId) {
        return (await this.api.get(`/user/${userId}`)).data;
    }

    // Create new comment
    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    // Update comment
    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    // Delete comment
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Delete all comments
    async deleteAll() {
        return (await this.api.delete("/")).data;
    }

    // Delete all comments of a novel
    async deleteByNovelId(novelId) {
        return (await this.api.delete(`/novel/${novelId}`)).data;
    }

    // Delete all comments of a user
    async deleteByUserId(userId) {
        return (await this.api.delete(`/user/${userId}`)).data;
    }
}

export default new CommentService();
