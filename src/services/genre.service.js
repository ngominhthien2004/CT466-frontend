import api from './api';

const GenreService = {
    async getAll() {
        const res = await api.get('/genres');
        return res.data;
    },
    async getBySlug(slug) {
        const res = await api.get(`/genres/slug/${slug}`);
        return res.data;
    },
    async getById(id) {
        const res = await api.get(`/genres/${id}`);
        return res.data;
    },
    async create(data) {
        const res = await api.post('/genres', data);
        return res.data;
    },
    async update(id, data) {
        const res = await api.put(`/genres/${id}`, data);
        return res.data;
    },
    async delete(id) {
        const res = await api.delete(`/genres/${id}`);
        return res.data;
    }
};

export default GenreService;
