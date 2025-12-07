<template>
    <div class="manage-genres">
        <!-- Page Header -->
        <PageHeader
            title="Quản lý Thể loại"
            subtitle="Quản lý tất cả thể loại tiểu thuyết trong hệ thống"
            icon="fas fa-tags"
        >
            <template #actions>
                <button @click="openAddModal" class="btn-add">
                    <i class="fas fa-plus"></i>
                    Thêm thể loại
                </button>
            </template>
        </PageHeader>

        <!-- Stats Cards -->
        <StatsCards :stats="statsData" />

        <!-- Search Filter -->
        <SearchFilter
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên thể loại..."
            @reset="searchQuery = ''"
        />

        <!-- Error Message -->
        <div v-if="genreStore.error" class="error">
            <i class="fas fa-exclamation-circle"></i>
            {{ genreStore.error }}
        </div>

        <!-- Genres Table -->
        <div class="table-container">
            <LoadingSpinner v-if="genreStore.loading" />

            <EmptyState
                v-else-if="filteredGenres.length === 0"
                icon="fa-tags"
                :title="searchQuery ? 'Không tìm thấy thể loại' : 'Chưa có thể loại nào'"
                :message="searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm thể loại mới'"
            />

            <table v-else class="data-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">STT</th>
                        <th>Tên Thể loại</th>
                        <th>Mô tả</th>
                        <th style="width: 100px;">Số Tiểu thuyết</th>
                        <th style="width: 150px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(genre, index) in filteredGenres" :key="genre._id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="genre-name">
                                <i class="fas fa-tag"></i>
                                {{ genre.name }}
                            </div>
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

    <!-- Modal Thêm/Sửa -->
    <GenreForm
        v-if="showAdd || showEdit"
        :initial="formInitial()"
        :mode="showAdd ? 'add' : 'edit'"
        :title="showAdd ? 'Thêm thể loại' : 'Sửa thể loại'"
        :submitting="submitting"
        @save="onSave"
        @cancel="closeModal"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteModal
        :show="confirmVisible"
        :item-name="deleteTargetName"
        message="Khi xóa thể loại, hệ thống sẽ bỏ thể loại khỏi các tiểu thuyết liên quan. Bạn có chắc muốn tiếp tục?"
        @confirm="onConfirmDelete"
        @cancel="confirmVisible = false"
    />
</template>

<script>
import { useGenreStore } from '@/stores/genre';
import { ref, computed } from 'vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import GenreForm from '@/components/Genre/GenreForm.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import PageHeader from '@/components/Admin/PageHeader.vue';
import StatsCards from '@/components/Admin/StatsCards.vue';
import SearchFilter from '@/components/Admin/SearchFilter.vue';

export default {
    name: 'ManageGenres',
    emits: ['update-title'],
    components: { 
        LoadingSpinner, 
        EmptyState,
        GenreForm,
        DeleteModal,
        PageHeader,
        StatsCards,
        SearchFilter
    },
    setup() {
        const genreStore = useGenreStore();
        const showAdd = ref(false);
        const showEdit = ref(false);
        const editId = ref(null);
        const form = ref({ name: '', slug: '', description: '' });
        const confirmVisible = ref(false);
        const deleteTargetId = ref(null);
        const deleteTargetName = ref('');
        const searchQuery = ref('');
        const submitting = ref(false);

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

        // Stats data for StatsCards component
        const statsData = computed(() => [
            {
                icon: 'fas fa-tags',
                value: genreStore.genres.length,
                label: 'Tổng Thể loại',
                color: 'purple'
            },
            {
                icon: 'fas fa-star',
                value: popularGenre.value,
                label: 'Thể loại phổ biến',
                color: 'cyan'
            }
        ]);

        // Filter genres based on search
        const filteredGenres = computed(() => {
            if (!searchQuery.value) return genreStore.genres;
            const query = searchQuery.value.toLowerCase();
            return genreStore.genres.filter(genre => 
                genre.name.toLowerCase().includes(query) ||
                (genre.description && genre.description.toLowerCase().includes(query))
            );
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
            try {
                submitting.value = true;
                if (showAdd.value) {
                    await genreStore.addGenre(data);
                    await genreStore.fetchGenres();
                } else if (showEdit.value && editId.value) {
                    await genreStore.updateGenre(editId.value, data);
                    await genreStore.fetchGenres();
                }
                closeModal();
            } catch (error) {
                console.error('Error saving genre:', error);
            } finally {
                submitting.value = false;
            }
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
            const genre = genreStore.genres.find(g => g._id === id);
            deleteTargetId.value = id;
            deleteTargetName.value = genre?.name || 'thể loại này';
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
            statsData,
            searchQuery,
            filteredGenres,
            submitting,
            deleteTargetName
        };
    }
};
</script>

<style scoped>
.manage-genres {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

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

.description-text {
    color: #7f8c8d;
    max-width: 400px;
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

    .table-container {
        overflow-x: auto;
    }

    .data-table {
        min-width: 700px;
    }

    .description-text {
        max-width: 150px;
    }
}
</style>