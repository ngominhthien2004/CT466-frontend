<template>
    <div class="manage-comments">
        <PageHeader
            title="Quản lý báo cáo"
            subtitle="Xem và xử lý các bình luận bị báo cáo"
            icon="fas fa-flag"
        />

        <!-- Stats Cards -->
        <StatsCards :stats="statsData" />

        <!-- Loading State -->
        <LoadingSpinner v-if="loading" />

        <!-- Empty State -->
        <EmptyState
            v-else-if="reportedComments.length === 0"
            icon="fa-check-circle"
            title="Không có báo cáo nào"
            message="Hệ thống không có bình luận bị báo cáo"
        />

        <!-- Data Table -->
        <div v-else class="table-container">
            <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 30%;">Nội dung</th>
                                <th style="width: 15%;">Người viết</th>
                                <th style="width: 15%;">Novel</th>
                                <th style="width: 10%;">Báo cáo</th>
                                <th style="width: 15%;">Lý do</th>
                                <th style="width: 15%;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="comment in reportedComments" :key="comment._id">
                                <td>
                                    <div class="comment-content">{{ comment.content }}</div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img :src="getUserAvatar(comment)" :alt="comment.userName" />
                                        <span>{{ comment.userName }}</span>
                                    </div>
                                </td>
                                <td>
                                    <a class="novel-link" @click="viewNovel(comment.novelId)">
                                        <i class="fas fa-external-link-alt"></i>
                                        Xem novel
                                    </a>
                                </td>
                                <td>
                                    <span class="badge badge-danger">
                                        {{ comment.reports?.length || 0 }}
                                    </span>
                                </td>
                                <td>
                                    <div class="report-reasons">
                                        <div v-for="(report, idx) in comment.reports?.slice(0, 2)" :key="idx" class="reason-item">
                                            • {{ report.reason }}
                                        </div>
                                        <span v-if="comment.reports?.length > 2" class="more-text">
                                            +{{ comment.reports.length - 2 }} lý do khác
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button 
                                            @click="confirmUnreport(comment)" 
                                            class="btn-action btn-edit"
                                            title="Gỡ báo cáo"
                                        >
                                            <i class="fas fa-undo"></i>
                                        </button>
                                        <button 
                                            @click="deleteComment(comment._id)" 
                                            class="btn-action btn-delete"
                                            title="Xóa bình luận"
                                        >
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
    </div>

    <!-- Delete Comment Modal -->
    <DeleteModal
        :show="showDeleteModal"
        :item-name="deleteTarget?.content?.substring(0, 50) + '...'"
        message="Bạn có chắc chắn muốn XÓA bình luận này? Hành động này không thể hoàn tác!"
        @confirm="handleDelete"
        @cancel="closeDeleteModal"
    />

    <!-- Unreport Comment Modal -->
    <ConfirmModal
        :show="showUnreportModal"
        title="Gỡ báo cáo"
        :message="`Bạn có chắc muốn gỡ báo cáo cho bình luận này?`"
        confirmText="Gỡ báo cáo"
        cancelText="Hủy"
        @confirm="handleUnreport"
        @update:show="(v) => showUnreportModal = v"
    />
    <!-- Notification Modal -->
    <NotificationModal
        :show="showNotification"
        :type="notificationType"
        :message="notificationMessage"
        @close="showNotification = false"
    />
</template>

<script>
import PageHeader from '@/components/Admin/PageHeader.vue';
import StatsCards from '@/components/Admin/StatsCards.vue';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import ConfirmModal from '@/components/Common/ConfirmModal.vue';
import NotificationModal from '@/components/Common/NotificationModal.vue';
import CommentService from '@/services/comment.service';

export default {
    name: 'ManageComments',
    components: {
        PageHeader,
        StatsCards,
        LoadingSpinner,
        EmptyState,
        DeleteModal,
        ConfirmModal,
        NotificationModal
    },
    data() {
        return {
            reportedComments: [],
            loading: false,
            showDeleteModal: false,
            deleteTarget: null,
            showUnreportModal: false,
            unreportTarget: null,
            // Notification state
            showNotification: false,
            notificationMessage: '',
            notificationType: 'info'
        };
    },
    computed: {
        statsData() {
            return [
                {
                    title: 'Tổng báo cáo',
                    value: this.reportedComments.length,
                    icon: 'fa-flag',
                    color: 'gradient-pink',
                    label: 'Bình luận bị báo cáo'
                }
            ];
        }
    },
    async mounted() {
        await this.loadReportedComments();
    },
    methods: {
        async loadReportedComments() {
            this.loading = true;
            try {
                this.reportedComments = await CommentService.getReportedComments();
            } catch (error) {
                console.error('Error loading reported comments:', error);
                this.notificationMessage = 'Không thể tải danh sách bình luận bị báo cáo';
                this.notificationType = 'error';
                this.showNotification = true;
            } finally {
                this.loading = false;
            }
        },

        async unreportComment(commentId) {
            // Use confirm modal flow instead of browser confirm
            this.unreportTarget = this.reportedComments.find(c => c._id === commentId);
            this.showUnreportModal = true;
        },

        confirmUnreport(comment) {
            this.unreportTarget = comment;
            this.showUnreportModal = true;
        },

        async handleUnreport() {
            if (!this.unreportTarget) return;

            try {
                await CommentService.unreportComment(this.unreportTarget._id);
                this.notificationMessage = 'Đã gỡ báo cáo thành công';
                this.notificationType = 'success';
                this.showNotification = true;
                await this.loadReportedComments();
                this.showUnreportModal = false;
                this.unreportTarget = null;
            } catch (error) {
                console.error('Error unreporting comment:', error);
                this.notificationMessage = 'Không thể gỡ báo cáo';
                this.notificationType = 'error';
                this.showNotification = true;
            }
        },

        async deleteComment(commentId) {
            const comment = this.reportedComments.find(c => c._id === commentId);
            this.deleteTarget = comment;
            this.showDeleteModal = true;
        },

        closeDeleteModal() {
            this.showDeleteModal = false;
            this.deleteTarget = null;
        },

        async handleDelete() {
            if (!this.deleteTarget) return;

            try {
                await CommentService.delete(this.deleteTarget._id);
                this.notificationMessage = 'Đã xóa bình luận thành công';
                this.notificationType = 'success';
                this.showNotification = true;
                await this.loadReportedComments();
                this.closeDeleteModal();
            } catch (error) {
                console.error('Error deleting comment:', error);
                this.notificationMessage = 'Không thể xóa bình luận';
                this.notificationType = 'error';
                this.showNotification = true;
            }
        },

        getUserAvatar(comment) {
            if (!comment.userAvatar) {
                return '/assets/default-avatar.svg';
            }
            if (comment.userAvatar.startsWith('http')) {
                return comment.userAvatar;
            }
            return `/assets/user/${comment.userId}/${comment.userAvatar}`;
        },

        viewNovel(novelId) {
            if (novelId) {
                this.$router.push(`/novels/${novelId}`);
            }
        }
    }
};
</script>

<style scoped>
.manage-comments {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.comment-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    color: #2c3e50;
    line-height: 1.5;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-cell img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.novel-link {
    color: #c9a9a6;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    transition: color 0.3s;
}

.novel-link:hover {
    color: #b8a39e;
    text-decoration: underline;
}

.report-reasons {
    font-size: 0.85rem;
}

.reason-item {
    color: #7f8c8d;
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.more-text {
    color: #95a5a6;
    font-style: italic;
    font-size: 0.8rem;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
}

.btn-action.btn-edit {
    background: #3498db;
}

.btn-action.btn-edit:hover {
    background: #2980b9;
}


</style>
