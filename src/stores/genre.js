import { defineStore } from 'pinia';
import GenreService from '@/services/genre.service';

export const useGenreStore = defineStore('genre', {
    state: () => ({
        genres: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchGenres() {
            this.loading = true;
            this.error = null;
            try {
                this.genres = await GenreService.getAll();
            } catch (err) {
                this.error = 'Không thể tải danh sách thể loại';
            } finally {
                this.loading = false;
            }
        },
        async addGenre(data) {
            this.loading = true;
            try {
                const newGenre = await GenreService.create(data);
                this.genres.push(newGenre);
            } catch (err) {
                this.error = 'Không thể thêm thể loại';
            } finally {
                this.loading = false;
            }
        },
        async updateGenre(id, data) {
            this.loading = true;
            try {
                const updated = await GenreService.update(id, data);
                const idx = this.genres.findIndex(g => g._id === id);
                if (idx !== -1) this.genres[idx] = updated;
            } catch (err) {
                this.error = 'Không thể cập nhật thể loại';
            } finally {
                this.loading = false;
            }
        },
        async deleteGenre(id) {
            this.loading = true;
            try {
                await GenreService.delete(id);
                this.genres = this.genres.filter(g => g._id !== id);
            } catch (err) {
                this.error = 'Không thể xóa thể loại';
            } finally {
                this.loading = false;
            }
        }
    }
});
