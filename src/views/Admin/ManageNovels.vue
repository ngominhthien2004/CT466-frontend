<template>
    <div class="manage-novels">
        <PageHeader
            title="Quản lý Tiểu thuyết"
            subtitle="Quản lý tất cả tiểu thuyết trong hệ thống"
            icon="fas fa-book"
        />

        <StatsCards :stats="statsData" />

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
                        <th>Đăng bởi</th>
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
                        <td>{{ getCreatorUsername(novel.createdBy) }}</td>
                        <td>
                            <div class="genres-cell">
                                <span
                                    v-for="(genre, idx) in getGenreNames(novel.genres).slice(0, 2)"
                                    :key="idx"
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
        <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="filteredNovels.length"
            @change="goToPage"
        />

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

        <NotificationModal
            :show="showNotification"
            :type="notificationType"
            :message="notificationMessage"
            :autoClose="notificationAutoClose"
            @close="showNotification = false"
        />
    </div>
</template>

<script>
import { useNovelStore } from '@/stores';
import { UserService } from '@/services';
import PageHeader from '@/components/Admin/PageHeader.vue';
import StatsCards from '@/components/Admin/StatsCards.vue';
import NovelForm from '@/components/Novel/NovelForm.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import SearchNovel from '@/components/Novel/SearchNovel.vue';
import FilterBar from '@/components/Common/FilterBar.vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import Pagination from '@/components/Common/Pagination.vue';

export default {
    name: 'ManageNovels',
    components: { PageHeader, StatsCards, NovelForm, DeleteModal, NotificationModal, SearchNovel, FilterBar, LoadingSpinner, EmptyState, Pagination },
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
            creatorUsernames: {}, // Map of userId -> username
            showNotification: false,
            notificationMessage: '',
            notificationType: 'success',
            notificationAutoClose: false,
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
        //  Lấy data từ store
        novels() {
            return this.novelStore.allNovels;
        },
        statsData() {
            const totalViews = this.novels.reduce((sum, novel) => sum + (novel.views || 0), 0);
            const totalLikes = this.novels.reduce((sum, novel) => sum + (novel.likes || 0), 0);
            const avgViews = this.novels.length > 0 ? Math.round(totalViews / this.novels.length) : 0;
            
            return [
                { icon: 'fas fa-book', value: this.novels.length, label: 'Tổng Tiểu thuyết', color: 'blue' },
                { icon: 'fas fa-eye', value: totalViews, label: 'Tổng Lượt xem', color: 'green' },
                { icon: 'fas fa-heart', value: totalLikes, label: 'Tổng Lượt thích', color: 'red' },
                { icon: 'fas fa-chart-line', value: avgViews, label: 'Trung bình Views', color: 'purple' }
            ];
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
        }
    },
    watch: {
        //  Tự động apply filters khi novels trong store thay đổi
        novels() {
            this.applyFilters();
        }
    },
    async mounted() {
        //  Fetch novels vào store
        await this.novelStore.fetchNovels();
        this.applyFilters();
        await this.loadCreatorUsernames();
    },
    methods: {
        async loadCreatorUsernames() {
            // Load all unique creator usernames
            const uniqueCreatorIds = [...new Set(this.novels.map(n => n.createdBy).filter(Boolean))];
            
            for (const userId of uniqueCreatorIds) {
                if (!this.creatorUsernames[userId]) {
                    try {
                        const user = await UserService.get(userId);
                        this.creatorUsernames[userId] = user.username || 'Không rõ';
                    } catch (error) {
                        console.error(`Error fetching user ${userId}:`, error);
                        this.creatorUsernames[userId] = 'N/A';
                    }
                }
            }
        },
        getCreatorUsername(userId) {
            if (!userId) return 'N/A';
            return this.creatorUsernames[userId] || 'N/A';
        },
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
                await this.novelStore.deleteNovel(this.deleteTarget._id);

                // Close modal
                this.closeDeleteModal();

            } catch (error) {
                console.error('Error deleting novel:', error);
                this.notificationMessage = 'Có lỗi xảy ra khi xóa tiểu thuyết!';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
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
                // Show success notification
                this.notificationMessage = 'Đã cập nhật tiểu thuyết thành công!';
                this.notificationType = 'success';
                this.notificationAutoClose = true;
                this.showNotification = true;
            } catch (error) {
                console.error('Error updating novel:', error);
                this.notificationMessage = 'Có lỗi xảy ra khi cập nhật tiểu thuyết!';
                this.notificationType = 'error';
                this.notificationAutoClose = false;
                this.showNotification = true;
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
        },
        getGenreNames(genres) {
            if (!genres || !Array.isArray(genres)) return [];
            // Handle both string and object genres
            return genres.map(genre => {
                if (typeof genre === 'string') return genre;
                if (typeof genre === 'object' && genre.name) return genre.name;
                return '';
            }).filter(Boolean);
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

/* Responsive */
@media (max-width: 1200px) {
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
