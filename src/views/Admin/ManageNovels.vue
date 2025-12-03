<template>
    <div class="manage-novels">
        <!-- Header Actions -->
        <div class="page-actions">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Tìm kiếm theo tên, tác giả..."
                    @input="handleSearch"
                />
            </div>
               <router-link to="/novels/add" class="btn-add">
                   <i class="fas fa-plus"></i>
                   Thêm Novel mới
               </router-link>
        </div>

        <!-- Filters -->
        <div class="filters">
            <select v-model="filterStatus" @change="applyFilters" class="filter-select">
                <option value="">Tất cả trạng thái</option>
                <option value="ongoing">Đang ra</option>
                <option value="completed">Hoàn thành</option>
                <option value="paused">Tạm dừng</option>
                <option value="dropped">Ngưng</option>
            </select>
            
            <select v-model="sortBy" @change="applySorting" class="filter-select">
                <option value="createdAt">Mới nhất</option>
                <option value="views">Lượt xem</option>
                <option value="likes">Lượt thích</option>
                <option value="title">Tên A-Z</option>
            </select>
            
            <button @click="resetFilters" class="btn-reset">
                <i class="fas fa-redo"></i>
                Đặt lại
            </button>
        </div>
        
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="paginatedNovels.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>Không tìm thấy tiểu thuyết nào</h3>
            <p v-if="searchQuery">Thử tìm kiếm với từ khóa khác</p>
            <p v-else>Bắt đầu bằng cách thêm tiểu thuyết mới</p>
               <router-link to="/novels/add" class="btn-add-empty">
                   <i class="fas fa-plus-circle"></i>
                   Thêm Novel
               </router-link>
        </div>

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
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-exclamation-triangle"></i>
                        Xác nhận xóa
                    </h3>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa tiểu thuyết này?</p>
                    <p class="novel-name">{{ deleteTarget?.title }}</p>
                    <p class="warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-actions">
                    <button @click="closeDeleteModal" class="btn-cancel">
                        <i class="fas fa-times"></i>
                        Hủy
                    </button>
                    <button @click="handleDelete" class="btn-confirm-delete" :disabled="deleting">
                        <i class="fas" :class="deleting ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                        {{ deleting ? 'Đang xóa...' : 'Xóa' }}
                    </button>
                </div>
            </div>
        </div>

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

export default {
    name: 'ManageNovels',
    components: { NovelForm },
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
            deleting: false
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
            this.deleteTarget = novel;
            this.showDeleteModal = true;
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

.search-box {
    flex: 1;
    position: relative;
    max-width: 500px;
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
}

.btn-add {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    white-space: nowrap;
}

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

/* Filters */
.filters {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-select:focus {
    outline: none;
    border-color: #c9a9a6;
}

.btn-reset {
    background: white;
    border: 2px solid #dfe6e9;
    color: #7f8c8d;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-reset:hover {
    background: #f8f9fa;
    border-color: #bdc3c7;
}

/* Loading */
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #c9a9a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
}

.empty-state i {
    font-size: 4rem;
    color: #bdc3c7;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.empty-state p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
}

.btn-add-empty {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-add-empty:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

/* Table */
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

.btn-edit {
    background: #f39c12;
    color: white;
}

.btn-edit:hover {
    background: #e67e22;
    transform: scale(1.1);
}

.btn-delete {
    background: #e74c3c;
    color: white;
}

.btn-delete:hover {
    background: #c0392b;
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

/* Delete Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 2px solid #ecf0f1;
}

.modal-header h3 {
    margin: 0;
    color: #e74c3c;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
}

.modal-body {
    padding: 2rem 1.5rem;
}

.modal-body p {
    margin: 0 0 1rem 0;
    color: #2c3e50;
}

.novel-name {
    font-weight: 700;
    font-size: 1.1rem;
    color: #c9a9a6;
}

.warning {
    color: #e74c3c;
    font-size: 0.9rem;
    font-style: italic;
}

.modal-actions {
    padding: 1.5rem;
    border-top: 2px solid #ecf0f1;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-cancel {
    background: white;
    border: 2px solid #dfe6e9;
    color: #7f8c8d;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-cancel:hover {
    background: #f8f9fa;
}

.btn-confirm-delete {
    background: #e74c3c;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.btn-confirm-delete:hover:not(:disabled) {
    background: #c0392b;
}

.btn-confirm-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    
    .search-box {
        max-width: 100%;
    }
    
    .filters {
        flex-wrap: wrap;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    .data-table {
        min-width: 1000px;
    }
}
</style>
