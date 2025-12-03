<template>
    <div class="manage-genres">
        <h1>Quản lý Thể loại</h1>
        <div class="actions">
            <button @click="openAddModal" class="btn btn-primary">Thêm thể loại</button>
        </div>
        <LoadingSpinner v-if="genreStore.loading" />
        <div v-if="genreStore.error" class="error">{{ genreStore.error }}</div>
        <table v-if="!genreStore.loading && genreStore.genres.length" class="genre-table">
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="genre in genreStore.genres" :key="genre._id">
                    <td>{{ genre.name }}</td>
                    <td>{{ genre.description }}</td>
                    <td>
                        <button @click="editGenre(genre)" class="btn btn-sm btn-warning">Sửa</button>
                        <button @click="deleteGenre(genre._id)" class="btn btn-sm btn-danger">Xóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <EmptyState
            v-else-if="!genreStore.loading"
            icon="fa-tags"
            title="Chưa có thể loại nào"
            message="Bắt đầu bằng cách thêm thể loại mới"
        />
    </div>

    <!-- Modal Thêm/Sửa (componentized) -->
    <Teleport to="body">
        <div v-if="showAdd || showEdit" class="genre-modal-overlay" @click.self="closeModal">
            <div class="genre-modal">
                <h2>{{ showAdd ? 'Thêm thể loại' : 'Sửa thể loại' }}</h2>
                <GenreForm
                    :initial="formInitial()"
                    :mode="showAdd ? 'add' : 'edit'"
                    @save="onSave"
                    @cancel="closeModal"
                />
            </div>
        </div>
    </Teleport>

    <ConfirmModal
        :show="confirmVisible"
        title="Xóa thể loại"
        message="Khi xóa thể loại, hệ thống sẽ bỏ thể loại khỏi các truyện liên quan. Bạn có chắc muốn tiếp tục?"
        confirmText="Xóa"
        cancelText="Hủy"
        confirmType="danger"
        @confirm="onConfirmDelete"
        @update:show="(v) => (confirmVisible = v)"
    />
</template>

<script>
import { useGenreStore } from '@/stores/genre';
import { ref } from 'vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import GenreForm from '@/components/Genre/GenreForm.vue';
import ConfirmModal from '@/components/Common/ConfirmModal.vue';

export default {
    name: 'ManageGenres',
    emits: ['update-title'],
    components: { 
        LoadingSpinner, 
        EmptyState,
        GenreForm,
        ConfirmModal
    },
    setup() {
        const genreStore = useGenreStore();
        const showAdd = ref(false);
        const showEdit = ref(false);
        const editId = ref(null);
        const form = ref({ name: '', slug: '', description: '' });
        const confirmVisible = ref(false);
        const deleteTargetId = ref(null);

        // Mở modal thêm mới và reset form
        function openAddModal() {
            resetForm();
            showAdd.value = true;
        }

        const resetForm = () => {
            form.value = { name: '', slug: '', description: '' };
            editId.value = null;
        };

        // Hàm tự động sinh slug từ tên
        function autoSlug() {
            form.value.slug = slugify(form.value.name);
        }

        // Chuyển tiếng Việt có dấu sang không dấu, lower-case, thay space bằng '-'
        function slugify(str) {
            return str
                .toLowerCase()
                .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        }

        const closeModal = () => {
            showAdd.value = false;
            showEdit.value = false;
            resetForm();
        };

        const formInitial = () => {
            if (showEdit.value && editId.value) {
                return form.value;
            }
            return { name: '', slug: '', description: '' };
        };

        const onSave = async (data) => {
            if (showAdd.value) {
                await genreStore.addGenre(data);
                await genreStore.fetchGenres();
            } else if (showEdit.value && editId.value) {
                await genreStore.updateGenre(editId.value, data);
                await genreStore.fetchGenres();
            }
            closeModal();
        };

        const submitForm = async () => {
            if (showAdd.value) {
                await genreStore.addGenre(form.value);
                await genreStore.fetchGenres(); // Đảm bảo luôn đồng bộ dữ liệu mới nhất
            } else if (showEdit.value && editId.value) {
                await genreStore.updateGenre(editId.value, form.value);
                await genreStore.fetchGenres();
            }
            closeModal();
        };

        const editGenre = (genre) => {
            form.value = { name: genre.name, slug: genre.slug, description: genre.description };
            editId.value = genre._id;
            showEdit.value = true;
        };

        const deleteGenre = (id) => {
            deleteTargetId.value = id;
            confirmVisible.value = true;
        };

        const onConfirmDelete = async () => {
            if (deleteTargetId.value) {
                await genreStore.deleteGenre(deleteTargetId.value);
                deleteTargetId.value = null;
            }
            confirmVisible.value = false;
        };

        genreStore.fetchGenres();

        return {
            genreStore,
            showAdd,
            showEdit,
            form,
            confirmVisible,
            closeModal,
            submitForm,
            editGenre,
            deleteGenre,
            onConfirmDelete,
            autoSlug,
            openAddModal,
            formInitial,
            onSave
        };
    }
};
</script>

<style scoped>
.manage-genres {
    max-width: 900px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    padding: 2rem;
}
.actions {
    margin-bottom: 1rem;
    text-align: right;
}
.genre-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}
.genre-table th, .genre-table td {
    border: 1px solid #e9ecef;
    padding: 0.75rem;
    text-align: left;
}
.genre-table th {
    background: #f8f9fa;
}
/* Utility styles moved to utilities.css */
.btn {
    padding: 0.5rem 1.2rem;
    border: none;
    border-radius: 6px;
    background: #e9ecef;
    color: #2c3e50;
    cursor: pointer;
    margin-right: 0.5rem;
    font-size: 1rem;
}
/* Button styles moved to buttons.css */
.btn-sm {
    font-size: 0.9rem;
    padding: 0.3rem 0.8rem;
}
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999 !important;
    opacity: 1 !important;
}
.modal {
    background: #fff;
    border-radius: 10px;
    padding: 2rem;
    min-width: 350px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    border: 3px solid red !important;
}
.form-group {
    margin-bottom: 1rem;
}
.form-group label {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
}
.form-group input, .form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
}
.modal-actions {
    text-align: right;
}
</style>

<style>
/* Modal styles - không scoped để tránh bị AdminLayout ghi đè */
.genre-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
}

.genre-modal {
    background: #fff;
    border-radius: 10px;
    padding: 2rem;
    min-width: 400px;
    max-width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.genre-modal h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    color: #2c3e50;
}
</style>
