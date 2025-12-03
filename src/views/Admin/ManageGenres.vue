<template>
    <div class="manage-genres">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-tags"></i>
                    Quản lý Thể loại
                </h1>
                <p>Quản lý tất cả thể loại truyện trong hệ thống</p>
            </div>
            <button @click="openAddModal" class="btn-add">
                <i class="fas fa-plus"></i>
                Thêm thể loại
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon purple">
                    <i class="fas fa-tags"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ genreStore.genres.length }}</h3>
                    <p>Tổng Thể loại</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ totalNovels }}</h3>
                    <p>Tổng Truyện</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ popularGenre }}</h3>
                    <p>Thể loại phổ biến</p>
                </div>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="genreStore.error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ genreStore.error }}
        </div>

        <!-- Genres Table -->
        <div class="table-container">
            <div class="table-header">
                <h2>Danh sách Thể loại ({{ genreStore.genres.length }})</h2>
            </div>

            <LoadingSpinner v-if="genreStore.loading" />

            <EmptyState
                v-else-if="genreStore.genres.length === 0"
                icon="fa-tags"
                title="Chưa có thể loại nào"
                message="Bắt đầu bằng cách thêm thể loại mới"
            />

            <table v-else class="data-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">STT</th>
                        <th>Tên Thể loại</th>
                        <th>Slug</th>
                        <th>Mô tả</th>
                        <th style="width: 100px;">Số Truyện</th>
                        <th style="width: 150px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(genre, index) in genreStore.genres" :key="genre._id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="genre-name">
                                <i class="fas fa-tag"></i>
                                {{ genre.name }}
                            </div>
                        </td>
                        <td>
                            <span class="slug-badge">{{ genre.slug }}</span>
                        </td>
                        <td>
                            <div class="description-text">
                                {{ genre.description || 'Chưa có mô tả' }}
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="novel-count">{{ genre.novelCount || 0 }}</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button @click="editGenre(genre)" class="btn-action btn-edit" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="deleteGenre(genre._id)" class="btn-action btn-delete" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Modal Thêm/Sửa (componentized) -->
    <Teleport to="body">
        <div v-if="showAdd || showEdit" class="modal-overlay" @click.self="closeModal">
            <div class="modal-dialog modal-sm">
                <div class="modal-header">
                    <h2>
                        <i class="fas fa-tags"></i>
                        {{ showAdd ? 'Thêm thể loại' : 'Sửa thể loại' }}
                    </h2>
                </div>
                <div class="modal-body">
                    <GenreForm
                        :initial="formInitial()"
                        :mode="showAdd ? 'add' : 'edit'"
                        @save="onSave"
                        @cancel="closeModal"
                    />
                </div>
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
import { ref, computed } from 'vue';
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

        // Computed properties for stats
        const totalNovels = computed(() => {
            return genreStore.genres.reduce((sum, genre) => sum + (genre.novelCount || 0), 0);
        });

        const popularGenre = computed(() => {
            if (genreStore.genres.length === 0) return 'N/A';
            const maxGenre = genreStore.genres.reduce((max, genre) => 
                (genre.novelCount || 0) > (max.novelCount || 0) ? genre : max
            );
            return maxGenre.name || 'N/A';
        });

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
            onSave,
            totalNovels,
            popularGenre
        };
    }
};
</script>

<style scoped>
.manage-genres {
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content h1 {
    color: white;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
}

.header-content p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 1.1rem;
}

.btn-add {
    background: white;
    color: #667eea;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Stats Cards */
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-icon.purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.blue { background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%); }

.stat-info h3 {
    margin: 0;
    font-size: 2rem;
    color: #2c3e50;
}

.stat-info p {
    margin: 0.25rem 0 0 0;
    color: #7f8c8d;
    font-size: 0.9rem;
}

/* Error Message */
.error-message {
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Table styles moved to tables.css */

/* Custom genre table styles */
.genre-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
}

.genre-name i {
    color: #667eea;
}

.slug-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
}

.description-text {
    color: #7f8c8d;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.novel-count {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
}

.text-center {
    text-align: center;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.btn-action {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
    font-size: 0.9rem;
}

.btn-edit {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.btn-edit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.btn-delete {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.btn-delete:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(250, 112, 154, 0.4);
}

/* Modal styles moved to modals.css */

/* Custom modal header for genres */
.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header h2 {
    color: white;
}

.modal-header i {
    color: white;
}

/* Responsive */
@media (max-width: 768px) {
    .manage-genres {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .stats-cards {
        grid-template-columns: 1fr;
    }

    .table-container {
        overflow-x: auto;
    }

    .data-table {
        min-width: 800px;
    }

    .description-text {
        max-width: 150px;
    }
}
</style>

