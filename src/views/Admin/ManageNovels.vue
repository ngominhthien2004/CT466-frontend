<template>
    <div class="manage-novels">
        <!-- Header Actions -->
        <div class="page-actions">
            <SearchNovel
                placeholder="Tìm kiếm theo tên, tác giả..."
                @input="searchQuery = $event"
                @search="handleSearch"
                @clear="searchQuery = ''; handleSearch();"
            />
        </div>

        <!-- Filters -->
        <FilterBar
            :status-filter="filterStatus"
            :sort-by="sortBy"
            :status-options="statusOptions"
            :sort-options="sortOptions"
            @update:statusFilter="filterStatus = $event"
            @update:sortBy="sortBy = $event"
            @filter-change="applyFilters"
            @sort-change="applySorting"
            @reset="resetFilters"
        />
        
        <!-- Loading State -->
        <LoadingSpinner v-if="loading" />

        <!-- Empty State -->
        <EmptyState 
            v-else-if="paginatedNovels.length === 0"
            title="Không tìm thấy tiểu thuyết nào"
            :message="searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách thêm tiểu thuyết mới'"
        />

        <!-- Data Table -->
        <div v-else class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">STT</th>
                        <th style="width: 80px;">Ảnh bìa</th>
                        <th>Tên tiểu thuyết</th>
                        <th>Tác giả</th>
                        <th>Thể loại</th>
                        <th style="width: 120px;">Trạng thái</th>
                        <th style="width: 100px;">Lượt xem</th>
                        <th style="width: 100px;">Lượt thích</th>
                        <th style="width: 180px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(novel, index) in paginatedNovels" :key="novel._id">
                        <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td>
                            <img
                                :src="novel.coverImage || '/assets/default-book.png'"
                                :alt="novel.title"
                                class="table-cover"
                            />
                        </td>
                        <td>
                            <div class="novel-title">
                                {{ novel.title }}
                            </div>
                        </td>
                        <td>{{ novel.author || 'N/A' }}</td>
                        <td>
                            <div class="genres-cell">
                                <span
                                    v-for="genre in novel.genres?.slice(0, 2)"
                                    :key="genre"
                                    class="genre-badge"
                                >
                                    {{ genre }}
                                </span>
                                <span v-if="novel.genres?.length > 2" class="more-badge">
                                    +{{ novel.genres.length - 2 }}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge" :class="novel.status">
                                {{ getStatusText(novel.status) }}
                            </span>
                        </td>
                        <td>
                            <i class="fas fa-eye"></i>
                            {{ formatNumber(novel.views || 0) }}
                        </td>
                        <td>
                            <i class="fas fa-heart"></i>
                            {{ formatNumber(novel.likes || 0) }}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <router-link
                                    :to="{ name: 'novel-detail', params: { id: novel._id } }"
                                    class="btn-action btn-view"
                                    title="Xem"
                                >
                                    <i class="fas fa-eye"></i>
                                </router-link>
                                <button
                                    @click="openEdit(novel)"
                                    class="btn-action btn-edit"
                                    title="Sửa"
                                >
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button
                                    @click="confirmDelete(novel)"
                                    class="btn-action btn-delete"
                                    title="Xóa"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
            >
                <i class="fas fa-chevron-left"></i>
            </button>

            <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="['pagination-btn', { active: page === currentPage }]"
            >
                {{ page }}
            </button>

            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
            >
                <i class="fas fa-chevron-right"></i>
            </button>

            <span class="pagination-info">
                Tổng {{ filteredNovels.length }} novels
            </span>
        </div>

        <!-- Delete Confirmation Modal -->
        <DeleteModal
            :show="showDeleteModal"
            :item-name="deleteTarget?.title"
            :loading="deleting"
            message="Bạn có chắc chắn muốn xóa tiểu thuyết này?"
            @confirm="handleDelete"
            @cancel="closeDeleteModal"
        />

        <!-- Edit Novel Modal (uses NovelForm component) -->
        <NovelForm
            v-if="showEditModal"
            :isModal="true"
            :novel="editTarget"
            @close="closeEditModal"
            @submit-form="handleEditSubmit"
        />
    </div>
</template>

<script>
import { useNovelStore } from '@/stores';
import NovelForm from '@/components/Novel/NovelForm.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import SearchNovel from '@/components/Novel/SearchNovel.vue';
import FilterBar from '@/components/Common/FilterBar.vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';

export default {
    name: 'ManageNovels',
    components: { NovelForm, DeleteModal, SearchNovel, FilterBar, LoadingSpinner, EmptyState },
    data() {
        return {
            novelStore: useNovelStore(),
            filteredNovels: [],
            showEditModal: false,
            editTarget: null,
            searchQuery: '',
            filterStatus: '',
            sortBy: 'createdAt',
            currentPage: 1,
            itemsPerPage: 10,
            showDeleteModal: false,
            deleteTarget: null,
            deleting: false,
            statusOptions: {
                placeholder: 'Tất cả trạng thái',
                options: [
                    { value: 'ongoing', label: 'Đang ra' },
                    { value: 'completed', label: 'Hoàn thành' },
                    { value: 'paused', label: 'Tạm dừng' },
                    { value: 'dropped', label: 'Ngưng' }
                ]
            },
            sortOptions: {
                options: [
                    { value: 'createdAt', label: 'Mới nhất' },
                    { value: 'views', label: 'Lượt xem' },
                    { value: 'likes', label: 'Lượt thích' },
                    { value: 'title', label: 'Tên A-Z' }
                ]
            }
        };
    },
    computed: {
        // 👉 Lấy data từ store
        novels() {
            return this.novelStore.allNovels;
        },
        loading() {
            return this.novelStore.loading;
        },
        paginatedNovels() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredNovels.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredNovels.length / this.itemsPerPage);
        },
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    watch: {
        // 👉 Tự động apply filters khi novels trong store thay đổi
        novels() {
            this.applyFilters();
        }
    },
    async mounted() {
        // 👉 Fetch novels vào store
        await this.novelStore.fetchNovels();
        this.applyFilters();
    },
    methods: {
        // ❌ Không cần loadNovels() nữa - dùng store
        handleSearch() {
            this.currentPage = 1;
            this.applyFilters();
        },
        applyFilters() {
            let result = [...this.novels];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query)
                );
            }

            // Status filter
            if (this.filterStatus) {
                result = result.filter(novel => novel.status === this.filterStatus);
            }

            this.filteredNovels = result;
            this.applySorting();
        },
        applySorting() {
            const sortFunctions = {
                'createdAt': (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
                'views': (a, b) => (b.views || 0) - (a.views || 0),
                'likes': (a, b) => (b.likes || 0) - (a.likes || 0),
                'title': (a, b) => (a.title || '').localeCompare(b.title || '')
            };

            this.filteredNovels.sort(sortFunctions[this.sortBy]);
        },
        resetFilters() {
            this.searchQuery = '';
            this.filterStatus = '';
            this.sortBy = 'createdAt';
            this.currentPage = 1;
            this.applyFilters();
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        confirmDelete(novel) {
            console.log('confirmDelete called', novel);
            this.deleteTarget = novel;
            this.showDeleteModal = true;
            console.log('showDeleteModal set to:', this.showDeleteModal);
        },
        closeDeleteModal() {
            this.showDeleteModal = false;
            this.deleteTarget = null;
        },
        async handleDelete() {
            if (!this.deleteTarget) return;

            this.deleting = true;
            try {
                // 👉 Xóa trong store - tự động cập nhật tất cả components
                await this.novelStore.deleteNovel(this.deleteTarget._id);

                // Close modal
                this.closeDeleteModal();

            } catch (error) {
                console.error('Error deleting novel:', error);
                alert('Có lỗi xảy ra khi xóa tiểu thuyết!');
            } finally {
                this.deleting = false;
            }
        },
        openEdit(novel) {
            this.editTarget = { ...novel };
            this.showEditModal = true;
        },
        closeEditModal() {
            this.showEditModal = false;
            this.editTarget = null;
        },
        async handleEditSubmit(formData) {
            if (!this.editTarget) return;
            try {
                // Use the store action to update and keep global state in sync
                await this.novelStore.updateNovel(this.editTarget._id, formData);
                this.closeEditModal();
                // Re-apply filters so table reflects updated data
                this.applyFilters();
            } catch (error) {
                console.error('Error updating novel:', error);
                alert('Có lỗi xảy ra khi cập nhật tiểu thuyết!');
            }
        },
        getStatusText(status) {
            const statusMap = {
                'ongoing': 'Đang ra',
                'completed': 'Hoàn thành',
                'paused': 'Tạm dừng',
                'dropped': 'Ngưng'
            };
            return statusMap[status] || status;
        },
        formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }
    }
};
</script>

<style scoped>
.manage-novels {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Page Actions */
.page-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

/* Empty State */
.table-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
}

.data-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.95rem;
}

.data-table tbody tr {
    border-bottom: 1px solid #ecf0f1;
    transition: background 0.2s;
}

.data-table tbody tr:hover {
    background: #f8f9fa;
}

.data-table td {
    padding: 1rem;
    vertical-align: middle;
}

.table-cover {
    width: 50px;
    height: 70px;
    object-fit: cover;
    border-radius: 6px;
}

.novel-title {
    font-weight: 600;
    color: #2c3e50;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.genres-cell {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.genre-badge {
    background: #ecf0f1;
    color: #7f8c8d;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.more-badge {
    background: #c9a9a6;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.status-badge {
    padding: 0.4rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: inline-block;
}

.status-badge.ongoing {
    background: #d4edda;
    color: #155724;
}

.status-badge.completed {
    background: #cce5ff;
    color: #004085;
}

.status-badge.paused {
    background: #fff3cd;
    color: #856404;
}

.status-badge.dropped {
    background: #f8d7da;
    color: #721c24;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 35px;
    height: 35px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    text-decoration: none;
}

.btn-view {
    background: #3498db;
    color: white;
}

.btn-view:hover {
    background: #2980b9;
    transform: scale(1.1);
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    padding: 1rem;
    background: white;
    border-radius: 12px;
}

.pagination-btn {
    width: 40px;
    height: 40px;
    border: 2px solid #dfe6e9;
    background: white;
    color: #2c3e50;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #c9a9a6;
    background: #c9a9a6;
    color: white;
}

.pagination-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    border-color: #c9a9a6;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    margin-left: 1rem;
    color: #7f8c8d;
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1200px) {
    .data-table {
        font-size: 0.9rem;
    }
    
    .data-table th,
    .data-table td {
        padding: 0.75rem 0.5rem;
    }
}

@media (max-width: 768px) {
    .page-actions {
        flex-direction: column;
        align-items: stretch;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    .data-table {
        min-width: 1000px;
    }
}
</style>
