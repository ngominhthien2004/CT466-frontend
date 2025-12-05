<template>
    <div class="account-page">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>
                    <i class="fas fa-user-circle"></i>
                    Tài khoản của tôi
                </h1>
                <p class="subtitle">Quản lý thông tin cá nhân và hoạt động</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Đang tải thông tin...</p>
        </div>

        <!-- Not Logged In -->
        <div v-else-if="!isAuthenticated" class="empty-state">
            <i class="fas fa-user-lock"></i>
            <h3>Bạn chưa đăng nhập</h3>
            <p>Vui lòng đăng nhập để xem trang này</p>
            <router-link to="/login" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                Đăng nhập ngay
            </router-link>
        </div>

        <!-- Account Content -->
        <div v-else class="account-container">
            <!-- Tabs -->
            <div class="tabs-container">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="['tab-btn', { active: activeTab === tab.id }]"
                >
                    <i :class="tab.icon"></i>
                    <span>{{ tab.label }}</span>
                </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Profile Tab -->
                <div v-if="activeTab === 'profile'" class="profile-section">
                    <div class="profile-card">
                        <div class="profile-header">
                            <div class="avatar-section">
                                <img
                                    :src="authStore.userAvatar"
                                    :alt="authStore.username"
                                    class="profile-avatar"
                                    @error="handleAvatarError"
                                />
                                <button class="btn-change-avatar" @click="showAvatarUpload = true">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                            <div class="profile-info">
                                <h2>{{ authStore.username }}</h2>
                                <span class="role-badge" :class="authStore.user?.role?.toLowerCase()">
                                    {{ authStore.userRole }}
                                </span>
                            </div>
                        </div>

                        <div class="profile-details">
                            <div class="detail-item">
                                <i class="fas fa-envelope"></i>
                                <div>
                                    <label>Email</label>
                                    <span>{{ authStore.user?.email || 'Chưa cập nhật' }}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i>
                                <div>
                                    <label>Ngày tham gia</label>
                                    <span>{{ formatDate(authStore.user?.createdAt) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="profile-actions">
                            <button class="btn-action" @click="showEditProfile = true">
                                <i class="fas fa-edit"></i>
                                Chỉnh sửa thông tin
                            </button>
                            <button class="btn-action" @click="showChangePassword = true">
                                <i class="fas fa-key"></i>
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-heart"></i>
                            <div class="stat-info">
                                <span class="stat-value">{{ stats.favorites }}</span>
                                <span class="stat-label">Yêu thích</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-history"></i>
                            <div class="stat-info">
                                <span class="stat-value">{{ stats.reading }}</span>
                                <span class="stat-label">Đang đọc</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-book"></i>
                            <div class="stat-info">
                                <span class="stat-value">{{ stats.novels }}</span>
                                <span class="stat-label">Đã đăng</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- My Novels Tab -->
                <div v-if="activeTab === 'novels'" class="novels-section">
                    <div class="section-header">
                        <h3>
                            <i class="fas fa-book"></i>
                            Tiểu thuyết đã đăng
                        </h3>
                        <router-link to="/novels/add" class="btn-add">
                            <i class="fas fa-plus"></i>
                            Thêm tiểu thuyết mới
                        </router-link>
                    </div>

                    <!-- Search & Filter -->
                    <div class="filters-section">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input
                                v-model="novelSearch"
                                type="text"
                                placeholder="Tìm kiếm tiểu thuyết..."
                                @input="filterNovels"
                            />
                        </div>
                        <select v-model="novelStatusFilter" @change="filterNovels" class="filter-select">
                            <option value="">Tất cả trạng thái</option>
                            <option value="ongoing">Đang ra</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="paused">Tạm dừng</option>
                        </select>
                    </div>

                    <!-- Empty State -->
                    <div v-if="filteredMyNovels.length === 0" class="empty-state-small">
                        <i class="fas fa-book-open"></i>
                        <p v-if="myNovels.length === 0">Bạn chưa đăng tiểu thuyết nào</p>
                        <p v-else>Không tìm thấy kết quả phù hợp</p>
                    </div>

                    <!-- Novels List -->
                    <div v-else class="novels-list">
                        <div v-for="novel in filteredMyNovels" :key="novel._id" class="novel-item">
                            <img
                                :src="novel.coverImage || '/assets/default-book.png'"
                                :alt="novel.title"
                                class="novel-cover"
                            />
                            <div class="novel-info">
                                <div class="novel-header">
                                    <router-link :to="`/novels/${novel._id}`" class="novel-title">
                                        {{ novel.title }}
                                    </router-link>
                                    <span class="status-badge" :class="novel.status">
                                        {{ getStatusText(novel.status) }}
                                    </span>
                                </div>
                                <p class="novel-author">
                                    <i class="fas fa-user"></i>
                                    {{ novel.author || 'Chưa rõ' }}
                                </p>
                                <div class="novel-genres">
                                    <span v-for="genre in novel.genres?.slice(0, 5)" :key="genre" class="genre-tag">
                                        {{ genre }}
                                    </span>
                                </div>
                                <div class="novel-stats">
                                    <span><i class="fas fa-eye"></i> {{ formatNumber(novel.views || 0) }}</span>
                                    <span><i class="fas fa-heart"></i> {{ formatNumber(novel.likes || 0) }}</span>
                                    <span><i class="fas fa-book"></i> {{ novel.chapterCount || 0 }} chương</span>
                                </div>
                            </div>
                            <div class="novel-actions">
                                <router-link :to="`/novels/${novel._id}`" class="btn-icon" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </router-link>
                                <router-link :to="`/novels/${novel._id}/edit`" class="btn-icon" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                                <router-link :to="`/admin/novels/${novel._id}/chapters`" class="btn-icon" title="Quản lý chương">
                                    <i class="fas fa-list"></i>
                                </router-link>
                                <button @click="confirmDeleteNovel(novel)" class="btn-icon btn-delete" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Profile Modal -->
        <div v-if="showEditProfile" class="form-overlay" @click="closeEditProfile">
            <div class="form-container" @click.stop>
                <div class="form-header">
                    <h3>
                        <i class="fas fa-user-edit"></i>
                        Chỉnh sửa thông tin
                    </h3>
                    <button @click="closeEditProfile" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form @submit.prevent="saveProfile" class="form-body">
                    <div class="form-group">
                        <label>Tên người dùng</label>
                        <input
                            v-model="editForm.username"
                            type="text"
                            placeholder="Nhập tên người dùng"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input
                            v-model="editForm.email"
                            type="email"
                            placeholder="Nhập email"
                        />
                    </div>
                    <div class="form-actions">
                        <button type="button" @click="closeEditProfile" class="btn-cancel">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button type="submit" class="btn-submit" :disabled="submitting">
                            <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                            {{ submitting ? 'Đang lưu...' : 'Lưu' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Change Password Modal -->
        <div v-if="showChangePassword" class="form-overlay" @click="closeChangePassword">
            <div class="form-container" @click.stop>
                <div class="form-header">
                    <h3>
                        <i class="fas fa-key"></i>
                        Đổi mật khẩu
                    </h3>
                    <button @click="closeChangePassword" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form @submit.prevent="changePassword" class="form-body">
                    <div class="form-group">
                        <label>Mật khẩu hiện tại</label>
                        <input
                            v-model="passwordForm.currentPassword"
                            type="password"
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label>Mật khẩu mới</label>
                        <input
                            v-model="passwordForm.newPassword"
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            required
                            minlength="6"
                        />
                    </div>
                    <div class="form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            v-model="passwordForm.confirmPassword"
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            required
                        />
                    </div>
                    <div class="form-actions">
                        <button type="button" @click="closeChangePassword" class="btn-cancel">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button type="submit" class="btn-submit" :disabled="submitting">
                            <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                            {{ submitting ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Upload Avatar Modal -->
        <div v-if="showAvatarUpload" class="form-overlay" @click="closeAvatarUpload">
            <div class="form-container" @click.stop>
                <div class="form-header">
                    <h3>
                        <i class="fas fa-camera"></i>
                        Thay đổi ảnh đại diện
                    </h3>
                    <button @click="closeAvatarUpload" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="form-body">
                    <div class="avatar-preview-section">
                        <img
                            :src="avatarPreview || authStore.userAvatar"
                            alt="Preview"
                            class="avatar-preview"
                        />
                    </div>
                    <div class="form-group">
                        <label class="file-input-label">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Chọn ảnh từ máy tính</span>
                            <input
                                type="file"
                                accept="image/*"
                                @change="handleAvatarSelect"
                                class="file-input"
                            />
                        </label>
                        <p class="file-hint">Định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" @click="closeAvatarUpload" class="btn-cancel">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button
                            type="button"
                            @click="uploadAvatar"
                            class="btn-submit"
                            :disabled="!selectedAvatar || submitting"
                        >
                            <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>
                            {{ submitting ? 'Đang tải...' : 'Tải lên' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores';
import { NovelService, UserService, ReadingHistoryService } from '@/services';

export default {
    name: 'AccountPage',
    data() {
        return {
            authStore: useAuthStore(),
            loading: false,
            activeTab: 'profile',
            tabs: [
                { id: 'profile', label: 'Thông tin', icon: 'fas fa-user' },
                { id: 'novels', label: 'Tiểu thuyết', icon: 'fas fa-book' }
            ],
            stats: {
                favorites: 0,
                reading: 0,
                novels: 0
            },
            myNovels: [],
            filteredMyNovels: [],
            novelSearch: '',
            novelStatusFilter: '',
            showEditProfile: false,
            showChangePassword: false,
            showAvatarUpload: false,
            submitting: false,
            editForm: {
                username: '',
                email: ''
            },
            passwordForm: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            selectedAvatar: null,
            avatarPreview: null,
            uploadingAvatar: false
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        }
    },
    async mounted() {
        if (this.isAuthenticated) {
            await this.loadAccountData();
        }
    },
    methods: {
        async loadAccountData() {
            this.loading = true;
            try {
                await Promise.all([
                    this.loadStats(),
                    this.loadMyNovels()
                ]);
            } catch (error) {
                console.error('Error loading account data:', error);
            } finally {
                this.loading = false;
            }
        },
        async loadStats() {
            try {
                const userId = this.authStore.user?._id;
                if (!userId) return;

                // Get favorites count
                try {
                    const favorites = await NovelService.getFavoritesByUserId(userId);
                    console.log('Favorites response:', favorites);
                    // Handle both array and object responses
                    this.stats.favorites = Array.isArray(favorites) ? favorites.length : (favorites.data?.length || 0);
                } catch (error) {
                    console.error('Error loading favorites:', error);
                    this.stats.favorites = 0;
                }

                // Get novels count using createdBy field
                try {
                    const myNovels = await NovelService.getNovelsByCreator(userId);
                    console.log('My novels response:', myNovels);
                    this.stats.novels = Array.isArray(myNovels) ? myNovels.length : (myNovels.data?.length || 0);
                } catch (error) {
                    console.error('Error loading my novels:', error);
                    this.stats.novels = 0;
                }

                // Get reading history count
                try {
                    const history = await ReadingHistoryService.getUserHistory(userId);
                    console.log('Reading history response:', history);
                    this.stats.reading = history.data?.length || history?.length || 0;
                } catch (error) {
                    console.error('Error loading reading history:', error);
                    this.stats.reading = 0;
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        },
        async loadMyNovels() {
            try {
                const userId = this.authStore.user?._id;
                if (!userId) {
                    this.myNovels = [];
                    return;
                }
                
                // Use new API to get novels by creator
                const novels = await NovelService.getNovelsByCreator(userId);
                console.log('Loaded my novels:', novels);
                this.myNovels = Array.isArray(novels) ? novels : (novels.data || []);
                this.filteredMyNovels = [...this.myNovels];
            } catch (error) {
                console.error('Error loading my novels:', error);
                this.myNovels = [];
            }
        },
        filterNovels() {
            let result = [...this.myNovels];

            if (this.novelSearch) {
                const query = this.novelSearch.toLowerCase();
                result = result.filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query)
                );
            }

            if (this.novelStatusFilter) {
                result = result.filter(novel => novel.status === this.novelStatusFilter);
            }

            this.filteredMyNovels = result;
        },
        async confirmDeleteNovel(novel) {
            const confirmed = confirm(`Bạn có chắc muốn xóa tiểu thuyết "${novel.title}"?`);
            if (!confirmed) return;

            try {
                await NovelService.delete(novel._id);
                alert('Xóa tiểu thuyết thành công!');
                await this.loadMyNovels();
                await this.loadStats();
            } catch (error) {
                console.error('Error deleting novel:', error);
                alert('Không thể xóa tiểu thuyết!');
            }
        },
        closeEditProfile() {
            this.showEditProfile = false;
            this.editForm = {
                username: '',
                email: ''
            };
        },
        async saveProfile() {
            this.submitting = true;
            try {
                const userId = this.authStore.user?._id;
                await UserService.updateProfile(userId, this.editForm);
                
                // Update auth store
                this.authStore.updateUser(this.editForm);
                
                alert('Cập nhật thông tin thành công!');
                this.closeEditProfile();
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Không thể cập nhật thông tin!');
            } finally {
                this.submitting = false;
            }
        },
        closeChangePassword() {
            this.showChangePassword = false;
            this.passwordForm = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        },
        async changePassword() {
            if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            this.submitting = true;
            try {
                const userId = this.authStore.user?._id;
                await UserService.changePassword(userId, {
                    currentPassword: this.passwordForm.currentPassword,
                    newPassword: this.passwordForm.newPassword
                });
                
                alert('Đổi mật khẩu thành công!');
                this.closeChangePassword();
            } catch (error) {
                console.error('Error changing password:', error);
                alert(error.response?.data?.message || 'Không thể đổi mật khẩu!');
            } finally {
                this.submitting = false;
            }
        },
        handleAvatarError(event) {
            event.target.src = '/assets/default-avatar.svg';
        },
        handleAvatarSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }

            this.selectedAvatar = file;
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.avatarPreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        closeAvatarUpload() {
            this.showAvatarUpload = false;
            this.selectedAvatar = null;
            this.avatarPreview = null;
        },
        async uploadAvatar() {
            if (!this.selectedAvatar) return;

            this.submitting = true;
            try {
                const userId = this.authStore.user?._id;
                const formData = new FormData();
                formData.append('avatar', this.selectedAvatar);

                const response = await UserService.uploadAvatar(userId, formData);
                
                // Update auth store with new avatar
                this.authStore.updateUser({ avatar: response.avatar });
                
                alert('Cập nhật ảnh đại diện thành công!');
                this.closeAvatarUpload();
            } catch (error) {
                console.error('Error uploading avatar:', error);
                alert(error.response?.data?.message || 'Không thể tải lên ảnh đại diện!');
            } finally {
                this.submitting = false;
            }
        },
        formatDate(date) {
            if (!date) return 'Không rõ';
            return new Date(date).toLocaleDateString('vi-VN');
        },
        formatRelativeTime(date) {
            if (!date) return '';
            const now = new Date();
            const diff = now - new Date(date);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            
            if (days > 0) return `${days} ngày trước`;
            if (hours > 0) return `${hours} giờ trước`;
            return 'Vừa xong';
        },
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },
        getStatusText(status) {
            const statusMap = {
                'ongoing': 'Đang ra',
                'completed': 'Hoàn thành',
                'paused': 'Tạm dừng'
            };
            return statusMap[status] || status;
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

.account-page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
    padding: 2rem 0;
}

/* Page Header */
.page-header {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 3rem 0;
    margin-bottom: 2rem;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.header-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.subtitle {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Loading & Empty States */
.loading-container {
    text-align: center;
    padding: 4rem 2rem;
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

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state i {
    font-size: 5rem;
    color: #c9a9a6;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    font-size: 1.75rem;
    margin: 1rem 0;
}

.empty-state p {
    color: #7f8c8d;
    margin-bottom: 2rem;
}

.btn-login {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-login:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.4);
}

/* Account Container */
.account-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
}

/* Tabs */
.tabs-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-btn {
    flex: 1;
    padding: 1rem;
    border: none;
    background: transparent;
    color: #7f8c8d;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.tab-btn:hover {
    background: #f8f9fa;
    color: #c9a9a6;
}

.tab-btn.active {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
}

/* Tab Content */
.tab-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Profile Section */
.profile-section h3 {
    margin: 2rem 0 1rem;
    font-size: 1.5rem;
    color: #2c3e50;
}

.profile-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
}

.avatar-section {
    position: relative;
}

.profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-change-avatar {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #c9a9a6;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.btn-change-avatar:hover {
    background: #b8a39e;
    transform: scale(1.1);
}

.profile-info h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.role-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.role-badge.admin {
    background: #e74c3c;
    color: white;
}

.role-badge.user {
    background: #3498db;
    color: white;
}

.profile-details {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.detail-item > i {
    font-size: 1.5rem;
    color: #c9a9a6;
    width: 30px;
}

.detail-item label {
    display: block;
    font-size: 0.85rem;
    color: #7f8c8d;
    margin-bottom: 0.25rem;
}

.detail-item span {
    font-weight: 600;
    color: #2c3e50;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

.profile-actions {
    display: flex;
    gap: 1rem;
}

.btn-action {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #c9a9a6;
    background: white;
    color: #c9a9a6;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-action:hover {
    background: #c9a9a6;
    color: white;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: linear-gradient(135deg, #c9a9a6 0%, #b8a39e 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(201, 169, 166, 0.4);
}

.stat-card > i {
    font-size: 2.5rem;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 0.25rem;
}

/* Novels Section */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-add {
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

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(201, 169, 166, 0.4);
}

.filters-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.search-box {
    flex: 1;
    position: relative;
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
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #dfe6e9;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    background: white;
}

.empty-state-small {
    text-align: center;
    padding: 3rem 2rem;
    color: #7f8c8d;
}

.empty-state-small i {
    font-size: 3rem;
    color: #c9a9a6;
    margin-bottom: 1rem;
}

.novels-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.novel-item {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;
}

.novel-item:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.novel-cover {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
}

.novel-info {
    flex: 1;
}

.novel-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.novel-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    text-decoration: none;
}

.novel-title:hover {
    color: #c9a9a6;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
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

.novel-author {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.novel-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.genre-tag {
    padding: 0.25rem 0.75rem;
    background: white;
    border: 1px solid #dfe6e9;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #7f8c8d;
}

.novel-stats {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: #95a5a6;
}

.novel-stats span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.novel-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-icon {
    width: 40px;
    height: 40px;
    border: 2px solid #dfe6e9;
    background: white;
    color: #7f8c8d;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.btn-icon:hover {
    border-color: #c9a9a6;
    color: #c9a9a6;
}

.btn-icon.btn-delete:hover {
    border-color: #e74c3c;
    color: #e74c3c;
    background: #fee;
}

/* Avatar Upload Modal */
.avatar-preview-section {
    text-align: center;
    padding: 2rem;
}

.avatar-preview {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #c9a9a6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-input-label {
    display: block;
    padding: 2rem;
    border: 2px dashed #dfe6e9;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #f8f9fa;
}

.file-input-label:hover {
    border-color: #c9a9a6;
    background: white;
}

.file-input-label i {
    font-size: 2rem;
    color: #c9a9a6;
    display: block;
    margin-bottom: 0.5rem;
}

.file-input-label span {
    color: #2c3e50;
    font-weight: 600;
}

.file-input {
    display: none;
}

.file-hint {
    text-align: center;
    font-size: 0.85rem;
    color: #7f8c8d;
    margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .header-content h1 {
        font-size: 2rem;
    }

    .tabs-container {
        flex-direction: column;
    }

    .profile-header {
        flex-direction: column;
        text-align: center;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .profile-actions {
        flex-direction: column;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .filters-section {
        flex-direction: column;
    }

    .novel-item {
        flex-direction: column;
    }

    .novel-cover {
        width: 100%;
        height: 200px;
    }

    .novel-actions {
        flex-direction: row;
    }
}
</style>
