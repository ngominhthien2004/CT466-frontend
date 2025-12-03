<template>
    <div class="manage-users">
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-users"></i>
                    Quản lý Users
                </h1>
                <p>Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <button @click="showAddUserModal = true" class="btn-add-user">
                <i class="fas fa-user-plus"></i>
                Thêm User
            </button>
        </div>

        <!-- Filters -->
        <div class="filters-section">
            <div class="filter-group">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm kiếm theo tên, email..."
                        @input="applyFilters"
                    />
                </div>

                <select v-model="filterRole" @change="applyFilters" class="filter-select">
                    <option value="">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>

                <select v-model="filterStatus" @change="applyFilters" class="filter-select">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Đã khóa</option>
                </select>

                <button @click="resetFilters" class="btn-reset">
                    <i class="fas fa-redo"></i>
                    Reset
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ totalUsers }}</h3>
                    <p>Tổng Users</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ activeUsers }}</h3>
                    <p>Đang Hoạt Động</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ adminUsers }}</h3>
                    <p>Admins</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">
                    <i class="fas fa-user-slash"></i>
                </div>
                <div class="stat-info">
                    <h3>{{ inactiveUsers }}</h3>
                    <p>Đã Khóa</p>
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <div class="table-container">
            <div class="table-header">
                <h2>Danh sách Users ({{ filteredUsers.length }})</h2>
            </div>

            <LoadingSpinner v-if="loading" />

            <EmptyState
                v-else-if="paginatedUsers.length === 0"
                icon="fa-user-friends"
                title="Không tìm thấy user nào"
            />

            <table v-else class="data-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Avatar</th>
                        <th>Thông Tin</th>
                        <th>Email</th>
                        <th>Vai Trò</th>
                        <th>Trạng Thái</th>
                        <th>Ngày Tạo</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in paginatedUsers" :key="user._id">
                        <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td>
                            <img :src="getUserAvatar(user)" :alt="user.username" class="user-avatar" />
                        </td>
                        <td>
                            <div class="user-info">
                                <strong>{{ user.username }}</strong>
                                <span v-if="user.fullName" class="full-name">{{ user.fullName }}</span>
                            </div>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>
                            <span class="badge" :class="'badge-' + user.role">
                                {{ user.role === 'admin' ? 'Admin' : 'User' }}
                            </span>
                        </td>
                        <td>
                            <span class="status" :class="user.isActive ? 'status-active' : 'status-inactive'">
                                <i :class="user.isActive ? 'fas fa-check-circle' : 'fas fa-ban'"></i>
                                {{ user.isActive ? 'Hoạt động' : 'Đã khóa' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="editUser(user)" class="btn-action btn-edit" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button
                                    @click="toggleUserStatus(user)"
                                    class="btn-action"
                                    :class="user.isActive ? 'btn-lock' : 'btn-unlock'"
                                    :title="user.isActive ? 'Khóa' : 'Mở khóa'"
                                >
                                    <i :class="user.isActive ? 'fas fa-lock' : 'fas fa-unlock'"></i>
                                </button>
                                <button @click="confirmDelete(user)" class="btn-action btn-delete" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button @click="currentPage--" :disabled="currentPage === 1" class="btn-page">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn-page">
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
                    <p>Bạn có chắc chắn muốn xóa user này?</p>
                    <div class="user-details">
                        <strong>{{ userToDelete?.username }}</strong>
                        <span>{{ userToDelete?.email }}</span>
                    </div>
                    <p class="warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn-cancel">Hủy</button>
                    <button @click="deleteUser" class="btn-confirm-delete">
                        <i class="fas fa-trash"></i>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserService from '@/services/user.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';

export default {
    name: 'ManageUsers',
    components: { LoadingSpinner, EmptyState },
    data() {
        return {
            users: [],
            filteredUsers: [],
            loading: false,
            searchQuery: '',
            filterRole: '',
            filterStatus: '',
            currentPage: 1,
            itemsPerPage: 10,
            showDeleteModal: false,
            showAddUserModal: false,
            userToDelete: null
        };
    },
    computed: {
        totalUsers() {
            return this.users.length;
        },
        activeUsers() {
            return this.users.filter(u => u.isActive).length;
        },
        inactiveUsers() {
            return this.users.filter(u => !u.isActive).length;
        },
        adminUsers() {
            return this.users.filter(u => u.role === 'admin').length;
        },
        paginatedUsers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredUsers.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        }
    },
    async mounted() {
        await this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            this.loading = true;
            try {
                this.users = await UserService.getAll();
                this.applyFilters();
            } catch (error) {
                console.error('Error fetching users:', error);
                alert('Không thể tải danh sách users');
            } finally {
                this.loading = false;
            }
        },
        applyFilters() {
            let filtered = [...this.users];

            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(user =>
                    user.username?.toLowerCase().includes(query) ||
                    user.email?.toLowerCase().includes(query) ||
                    user.fullName?.toLowerCase().includes(query)
                );
            }

            // Role filter
            if (this.filterRole) {
                filtered = filtered.filter(user => user.role === this.filterRole);
            }

            // Status filter
            if (this.filterStatus) {
                const isActive = this.filterStatus === 'active';
                filtered = filtered.filter(user => user.isActive === isActive);
            }

            this.filteredUsers = filtered;
            this.currentPage = 1;
        },
        resetFilters() {
            this.searchQuery = '';
            this.filterRole = '';
            this.filterStatus = '';
            this.applyFilters();
        },
        getUserAvatar(user) {
            if (!user.avatar) return '/assets/default-avatar.svg';
            if (user.avatar.startsWith('http')) return user.avatar;
            return `/assets/user/${user._id}/${user.avatar}`;
        },
        editUser(user) {
            // TODO: Implement edit user modal or route
            console.log('Edit user:', user);
            alert('Chức năng đang được phát triển');
        },
        async toggleUserStatus(user) {
            try {
                const newStatus = !user.isActive;
                await UserService.update(user._id, { isActive: newStatus });
                
                user.isActive = newStatus;
                const action = newStatus ? 'mở khóa' : 'khóa';
                alert(`Đã ${action} user thành công!`);
            } catch (error) {
                console.error('Error toggling user status:', error);
                alert('Không thể thay đổi trạng thái user');
            }
        },
        confirmDelete(user) {
            this.userToDelete = user;
            this.showDeleteModal = true;
        },
        closeDeleteModal() {
            this.showDeleteModal = false;
            this.userToDelete = null;
        },
        async deleteUser() {
            if (!this.userToDelete) return;

            try {
                await UserService.delete(this.userToDelete._id);
                
                this.users = this.users.filter(u => u._id !== this.userToDelete._id);
                this.applyFilters();
                
                this.closeDeleteModal();
                alert('Đã xóa user thành công!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Không thể xóa user');
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
.manage-users {
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

.btn-add-user {
    background: white;
    color: #667eea;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-add-user:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
    border-color: #667eea;
}

.btn-reset {
    padding: 0.875rem 1.5rem;
    background: #e9ecef;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-reset:hover {
    background: #dee2e6;
}

/* Stats Cards */
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.red { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

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

/* Table Container */
.table-container {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
    margin-bottom: 1.5rem;
}

.table-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
}

/* Table */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: #f8f9fa;
}

.data-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid #e9ecef;
}

.data-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f3f5;
    color: #495057;
}

.data-table tbody tr {
    transition: background 0.2s;
}

.data-table tbody tr:hover {
    background: #f8f9fa;
}

.user-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-info strong {
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.full-name {
    font-size: 0.85rem;
    color: #7f8c8d;
}

.badge {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-admin {
    background: #fee;
    color: #c33;
}

.badge-user {
    background: #e3f2fd;
    color: #1976d2;
}

.status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
}

.status-active {
    color: #27ae60;
}

.status-inactive {
    color: #e74c3c;
}

/* Action Buttons */
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

.btn-edit {
    background: #f39c12;
}

.btn-edit:hover {
    background: #e67e22;
}

.btn-lock {
    background: #e74c3c;
}

.btn-lock:hover {
    background: #c0392b;
}

.btn-unlock {
    background: #27ae60;
}

.btn-unlock:hover {
    background: #229954;
}

.btn-delete {
    background: #95a5a6;
}

.btn-delete:hover {
    background: #7f8c8d;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-page {
    padding: 0.5rem 1rem;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-weight: 600;
    color: #2c3e50;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #e74c3c;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-body {
    padding: 1.5rem;
}

.modal-body p {
    margin: 0 0 1rem 0;
    color: #495057;
}

.user-details {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.warning {
    color: #e74c3c;
    font-weight: 600;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn-cancel,
.btn-confirm-delete {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-cancel {
    background: #e9ecef;
    color: #495057;
}

.btn-cancel:hover {
    background: #dee2e6;
}

.btn-confirm-delete {
    background: #e74c3c;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-confirm-delete:hover {
    background: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
    .manage-users {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
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

    .user-avatar {
        width: 35px;
        height: 35px;
    }
}
</style>
