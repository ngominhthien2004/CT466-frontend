<template>
    <div class="manage-chapters">
        <PageHeader
            title="Quản lý Chapters"
            subtitle="Quản lý tất cả các chương truyện trong hệ thống"
            icon="fas fa-book-open"
        />

        <!-- Filters -->
        <SearchFilter
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên chương, nội dung..."
            @update:modelValue="applyFilters"
            @reset="resetFilters"
        >
            <select v-model="filterNovel" @change="applyFilters" class="filter-select">
                <option value="">Tất cả tiểu thuyết</option>
                <option v-for="novel in novels" :key="novel._id" :value="novel._id">
                    {{ novel.title }}
                </option>
            </select>

            <select v-model="sortBy" @change="applyFilters" class="filter-select">
                <option value="createdAt">Mới nhất</option>
                <option value="chapterNumber">Số chương</option>
                <option value="views">Lượt xem</option>
            </select>
        </SearchFilter>

        <!-- Stats Cards -->
        <StatsCards :stats="statsData" />

        <!-- Chapters Table -->
        <div class="table-container">
            <LoadingSpinner v-if="loading" />

            <EmptyState
                v-else-if="paginatedChapters.length === 0"
                icon="fa-inbox"
                title="Không tìm thấy chapter nào"
            />

            <table v-else class="data-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tiểu thuyết</th>
                        <th>Tên Chapter</th>
                        <th>Số Chương</th>
                        <th>Lượt Xem</th>
                        <th>Ngày Tạo</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(chapter, index) in paginatedChapters" :key="chapter._id">
                        <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td>
                            <div class="novel-info">
                                <span class="novel-title">{{ getNovelTitle(chapter.novelId) }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="chapter-title">{{ chapter.title }}</div>
                        </td>
                        <td>
                            <span class="badge badge-primary">Chương {{ chapter.chapterNumber }}</span>
                        </td>
                        <td>
                            <div class="views-count">
                                <i class="fas fa-eye"></i>
                                {{ chapter.views || 0 }}
                            </div>
                        </td>
                        <td>{{ formatDate(chapter.createdAt) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="viewChapter(chapter)" class="btn-action btn-view" title="Xem">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button @click="editChapter(chapter)" class="btn-action btn-edit" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="confirmDelete(chapter)" class="btn-action btn-delete" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button
                    @click="currentPage--"
                    :disabled="currentPage === 1"
                    class="btn-page"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">
                    Trang {{ currentPage }} / {{ totalPages }}
                </span>
                <button
                    @click="currentPage++"
                    :disabled="currentPage === totalPages"
                    class="btn-page"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-exclamation-triangle"></i>
                        Xác nhận xóa
                    </h3>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa chapter này?</p>
                    <div class="chapter-info">
                        <strong>{{ chapterToDelete?.title }}</strong>
                        <span>Chương {{ chapterToDelete?.chapterNumber }}</span>
                    </div>
                    <p class="warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn-cancel">
                        Hủy
                    </button>
                    <button @click="deleteChapter" class="btn-confirm-delete">
                        <i class="fas fa-trash"></i>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ChapterService, NovelService } from '@/services';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import PageHeader from '@/components/Admin/PageHeader.vue';
import StatsCards from '@/components/Admin/StatsCards.vue';
import SearchFilter from '@/components/Admin/SearchFilter.vue';

export default {
    name: 'ManageChapters',
    components: { 
        LoadingSpinner, 
        EmptyState,
        PageHeader,
        StatsCards,
        SearchFilter
    },
    data() {
        return {
            chapters: [],
            novels: [],
            filteredChapters: [],
            loading: false,
            searchQuery: '',
            filterNovel: '',
            sortBy: 'createdAt',
            currentPage: 1,
            itemsPerPage: 10,
            showDeleteModal: false,
            chapterToDelete: null
        };
    },
    computed: {
        totalChapters() {
            return this.chapters.length;
        },
        totalViews() {
            return this.chapters.reduce((sum, chapter) => sum + (chapter.views || 0), 0);
        },
        statsData() {
            return [
                {
                    icon: 'fas fa-book',
                    value: this.totalChapters,
                    label: 'Tổng Chapters',
                    color: 'blue'
                },
                {
                    icon: 'fas fa-eye',
                    value: this.totalViews,
                    label: 'Tổng Lượt Xem',
                    color: 'green'
                },
                {
                    icon: 'fas fa-book-reader',
                    value: this.novels.length,
                    label: 'Số tiểu thuyết',
                    color: 'purple'
                }
            ];
        },
        paginatedChapters() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredChapters.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredChapters.length / this.itemsPerPage);
        }
    },
    async mounted() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            this.loading = true;
            try {
                // Fetch novels first
                this.novels = await NovelService.getAll();
                
                // Fetch all chapters
                const allChapters = [];
                for (const novel of this.novels) {
                    const chapters = await ChapterService.getByNovelId(novel._id);
                    allChapters.push(...chapters);
                }
                
                this.chapters = allChapters;
                this.applyFilters();
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Không thể tải dữ liệu chapters');
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let filtered = [...this.chapters];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(chapter =>
                    chapter.title?.toLowerCase().includes(query) ||
                    chapter.content?.toLowerCase().includes(query)
                );
            }

            // Novel filter
            if (this.filterNovel) {
                filtered = filtered.filter(chapter => chapter.novelId === this.filterNovel);
            }

            // Sort
            filtered.sort((a, b) => {
                if (this.sortBy === 'createdAt') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                } else if (this.sortBy === 'chapterNumber') {
                    return a.chapterNumber - b.chapterNumber;
                } else if (this.sortBy === 'views') {
                    return (b.views || 0) - (a.views || 0);
                }
                return 0;
            });

            this.filteredChapters = filtered;
            this.currentPage = 1;
        },
        resetFilters() {
            this.searchQuery = '';
            this.filterNovel = '';
            this.sortBy = 'createdAt';
            this.applyFilters();
        },
        getNovelTitle(novelId) {
            const novel = this.novels.find(n => n._id === novelId);
            return novel?.title || 'Unknown';
        },
        viewChapter(chapter) {
            this.$router.push(`/novels/${chapter.novelId}/chapters/${chapter._id}`);
        },
        editChapter(chapter) {
            this.$router.push(`/novels/${chapter.novelId}/chapters/${chapter._id}/edit`);
        },
        confirmDelete(chapter) {
            this.chapterToDelete = chapter;
            this.showDeleteModal = true;
        },
        closeDeleteModal() {
            this.showDeleteModal = false;
            this.chapterToDelete = null;
        },
        async deleteChapter() {
            if (!this.chapterToDelete) return;

            try {
                await ChapterService.delete(this.chapterToDelete._id);
                
                // Remove from local array
                this.chapters = this.chapters.filter(c => c._id !== this.chapterToDelete._id);
                this.applyFilters();
                
                this.closeDeleteModal();
                alert('Đã xóa chapter thành công!');
            } catch (error) {
                console.error('Error deleting chapter:', error);
                alert('Không thể xóa chapter');
            }
        },
        formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        }
    }
};
</script>

<style scoped>
.manage-chapters {
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

/* Filters Section */
.filters-section {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
}

.search-box input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #c9a9a6;
    box-shadow: 0 0 0 4px rgba(201, 169, 166, 0.1);
}

.filter-select {
    padding: 0.875rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
}

.filter-select:focus {
    outline: none;
    border-color: #c9a9a6;
}

/* Page Header, Filters, Stats Cards - moved to reusable components */

/* Table styles moved to tables.css */

/* Custom styles for chapters table */
.novel-info {
    display: flex;
    flex-direction: column;
}

.novel-title {
    font-weight: 600;
    color: #2c3e50;
}

.chapter-title {
    font-weight: 500;
    color: #2c3e50;
}

.badge-primary {
    background: #e3f2fd;
    color: #1976d2;
}

.views-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #7f8c8d;
}

.btn-view {
    background: #3498db;
}

/* Button styles moved to buttons.css */

/* Modal styles moved to modals.css */

/* Custom chapter info styling */
.chapter-info {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .manage-chapters {
        padding: 1rem;
    }

    .filter-group {
        flex-direction: column;
    }

    .search-box {
        min-width: 100%;
    }

    .data-table {
        font-size: 0.85rem;
    }

    .data-table th,
    .data-table td {
        padding: 0.75rem 0.5rem;
    }
}
</style>
