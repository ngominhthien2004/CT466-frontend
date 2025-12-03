<template>
    <div class="manage-users">
        <PageHeader
            title="Quản lý Users"
            subtitle="Quản lý tất cả người dùng trong hệ thống"
            icon="fas fa-users"
        />

        <!-- Filters -->
        <SearchFilter
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên, email..."
            @update:modelValue="applyFilters"
            @reset="resetFilters"
        >
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
        </SearchFilter>

        <!-- Stats Cards -->
        <StatsCards :stats="statsData" />

        <!-- Users Table -->
        <div class="table-container">
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
                            <div class="table-user-info">
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
                                {{ user.isActive ? 'Hoạt động' : 'Ngưng hoạt động' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="editUser(user)" class="btn-action btn-edit" title="Sửa">
                                    <i class="fas fa-edit"></i>
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
        <DeleteModal
            :show="showDeleteModal"
            title="Xóa User"
            :item-name="userToDelete?.username"
            :loading="deleting"
            @confirm="deleteUser"
            @cancel="closeDeleteModal"
        >
            <template #message>
                <p>Bạn có chắc chắn muốn xóa user này?</p>
                <div class="user-details">
                    <strong>{{ userToDelete?.username }}</strong>
                    <span>{{ userToDelete?.email }}</span>
                </div>
            </template>
        </DeleteModal>

        <!-- Edit User Modal -->
        <UserForm
            v-if="showEditModal && editTarget"
            :user="editTarget"
            @close="closeEditModal"
            @submit="handleEditUser"
        />
    </div>
</template>

<script>
import UserService from '@/services/user.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner.vue';
import EmptyState from '@/components/Common/EmptyState.vue';
import DeleteModal from '@/components/Common/DeleteModal.vue';
import UserForm from '@/components/User/UserForm.vue';
import PageHeader from '@/components/Admin/PageHeader.vue';
import StatsCards from '@/components/Admin/StatsCards.vue';
import SearchFilter from '@/components/Admin/SearchFilter.vue';
import { useAuthStore } from '@/stores';

export default {
    name: 'ManageUsers',
    components: { 
        LoadingSpinner, 
        EmptyState, 
        DeleteModal, 
        UserForm,
        PageHeader,
        StatsCards,
        SearchFilter
    },
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
            showEditModal: false,
            userToDelete: null,
            editTarget: null,
            deleting: false,
            submitting: false,
            authStore: useAuthStore()
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
        statsData() {
            return [
                {
                    icon: 'fas fa-users',
                    value: this.totalUsers,
                    label: 'Tổng Users',
                    color: 'blue'
                },
                {
                    icon: 'fas fa-user-check',
                    value: this.activeUsers,
                    label: 'Đang Hoạt Động',
                    color: 'green'
                },
                {
                    icon: 'fas fa-user-shield',
                    value: this.adminUsers,
                    label: 'Admins',
                    color: 'orange'
                }
            ];
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
            this.editTarget = user;
            this.showEditModal = true;
        },
        closeEditModal() {
            this.showEditModal = false;
            this.editTarget = null;
        },
        async handleEditUser(formData) {
            if (!this.editTarget || this.submitting) return;
            
            this.submitting = true;
            const userId = this.editTarget._id;
            const oldRole = this.editTarget.role;
            
            try {
                await UserService.update(userId, formData);
                
                // Update local user data
                const index = this.users.findIndex(u => u._id === userId);
                if (index !== -1) {
                    this.users[index] = { 
                        ...this.users[index], 
                        role: formData.role,
                        isActive: formData.isActive
                    };
                }
                this.applyFilters();
                
                // Check if role changed for currently logged-in user
                const currentUser = this.authStore.user;
                if (currentUser && currentUser._id === userId && oldRole !== formData.role) {
                    alert('Vai trò của bạn đã được thay đổi. Vui lòng đăng nhập lại!');
                    // Force logout
                    this.authStore.logout();
                    this.$router.push('/login');
                } else {
                    alert('Đã cập nhật user thành công!');
                }
            } catch (error) {
                console.error('Error updating user:', error);
                alert(error.response?.data?.message || 'Không thể cập nhật user');
            } finally {
                this.submitting = false;
                this.closeEditModal();
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

            this.deleting = true;
            try {
                await UserService.delete(this.userToDelete._id);
                
                this.users = this.users.filter(u => u._id !== this.userToDelete._id);
                this.applyFilters();
                
                this.closeDeleteModal();
                alert('Đã xóa user thành công!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Không thể xóa user');
            } finally {
                this.deleting = false;
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

/* Table styles moved to tables.css */

/* Button styles */
.btn-action {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    color: white;
}

/* User Details for Delete Modal */
.user-details {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.user-details strong {
    color: #2c3e50;
}

.user-details span {
    color: #7f8c8d;
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
    .manage-users {
        padding: 1rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-row {
        flex-direction: column;
    }
    
    .search-box {
        min-width: 100%;
    }
}
</style>
