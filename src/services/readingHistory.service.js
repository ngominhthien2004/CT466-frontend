import createApiClient from "./api.service";

class ReadingHistoryService {
    constructor(baseUrl = "/api/reading-history") {
        this.api = createApiClient(baseUrl);
    }

    // Get user's reading history
    async getUserHistory(userId) {
        return (await this.api.get(`/${userId}`)).data;
    }

    // Add to reading history
    async addToHistory(userId, data) {
        return (await this.api.post(`/${userId}/add`, data)).data;
    }

    // Remove from reading history
    async removeFromHistory(userId, novelId) {
        return (await this.api.delete(`/${userId}/remove/${novelId}`)).data;
    }

    // Clear all reading history
    async clearHistory(userId) {
        return (await this.api.delete(`/${userId}/clear`)).data;
    }
}

export default new ReadingHistoryService();
