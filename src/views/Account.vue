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
                    <ProfileCard
                        :username="authStore.username"
                        :email="authStore.user?.email"
                        :user-avatar="authStore.userAvatar"
                        :role="authStore.user?.role"
                        :role-text="authStore.userRole"
                        :created-at="authStore.user?.createdAt"
                        @change-avatar="showAvatarUpload = true"
                        @edit-email="openEditEmail"
                        @change-password="showChangePassword = true"
                        @update-username="handleUpdateUsername"
                    />
                    <StatsCards :stats="stats" />
                </div>

                <!-- My Novels Tab -->
                <div v-if="activeTab === 'novels'">
                    <MyNovelsList
                        :novels="filteredMyNovels"
                        :total-novels="myNovels.length"
                        @filter="filterNovels"
                        @edit="openEditNovel"
                        @delete="confirmDeleteNovel"
                    />
                </div>
            </div>
        </div>

        <!-- Edit Novel Modal -->
        <NovelForm
            v-if="showEditNovel"
            :isModal="true"
            :novel="editNovelTarget"
            @close="closeEditNovel"
            @submit-form="handleEditNovelSubmit"
        />

        <!-- Edit Email Modal -->
        <EditEmailModal
            :show="showEditProfile"
            :current-email="authStore.user?.email"
            :error="profileError"
            :submitting="submitting"
            @close="closeEditProfile"
            @submit="saveProfile"
        />

        <!-- Change Password Modal -->
        <ChangePasswordModal
            :show="showChangePassword"
            :error="passwordError"
            :submitting="submitting"
            @close="closeChangePassword"
            @submit="changePassword"
        />

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
import { useAuthStore } from '@/stores';
import { NovelService, UserService, ReadingHistoryService } from '@/services';
import NovelForm from '@/components/Novel/NovelForm.vue';
import ProfileCard from '@/components/Account/ProfileCard.vue';
import StatsCards from '@/components/Account/StatsCards.vue';
import MyNovelsList from '@/components/Account/MyNovelsList.vue';
import EditEmailModal from '@/components/Account/EditEmailModal.vue';
import ChangePasswordModal from '@/components/Account/ChangePasswordModal.vue';
import { useNotificationStore } from '@/stores';

export default {
    name: 'AccountPage',
    components: {
        NovelForm,
        ProfileCard,
        StatsCards,
        MyNovelsList,
        EditEmailModal,
        ChangePasswordModal,
        NotificationModal
    },
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
            showEditProfile: false,
            showChangePassword: false,
                showAvatarUpload: false,
                showEditNovel: false,
                editNovelTarget: null,
                submitting: false,
                passwordError: '',
                profileError: '',
                selectedAvatar: null,
                avatarPreview: null
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        }
    },
    async mounted() {
        // Check if tab query parameter exists
        const tab = this.$route.query.tab;
        if (tab === 'novels') {
            this.activeTab = 'novels';
        }
        
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
        filterNovels({ search, status }) {
            let result = [...this.myNovels];

            if (search) {
                const query = search.toLowerCase();
                result = result.filter(novel =>
                    novel.title?.toLowerCase().includes(query) ||
                    novel.author?.toLowerCase().includes(query)
                );
            }

            if (status) {
                result = result.filter(novel => novel.status === status);
            }

            this.filteredMyNovels = result;
        },
        async confirmDeleteNovel(novel) {
            const confirmed = confirm(`Bạn có chắc muốn xóa tiểu thuyết "${novel.title}"?`);
            if (!confirmed) return;

            try {
                    await NovelService.delete(novel._id);
                    const notifier = useNotificationStore();
                    notifier.showNotification('Xóa tiểu thuyết thành công!', 'success', true);
                    await this.loadMyNovels();
                    await this.loadStats();
                } catch (error) {
                    console.error('Error deleting novel:', error);
                    const notifier = useNotificationStore();
                    notifier.showNotification('Không thể xóa tiểu thuyết!', 'error', false);
                }
        },
        openEditNovel(novel) {
            this.editNovelTarget = { ...novel };
            this.showEditNovel = true;
        },
        closeEditNovel() {
            this.showEditNovel = false;
            this.editNovelTarget = null;
        },
        async handleEditNovelSubmit(formData) {
            if (!this.editNovelTarget) return;
            
            this.submitting = true;
            try {
                await NovelService.update(this.editNovelTarget._id, formData);
                const notifier = useNotificationStore();
                notifier.showNotification('Cập nhật tiểu thuyết thành công!', 'success', true);
                this.closeEditNovel();
                await this.loadMyNovels();
            } catch (error) {
                console.error('Error updating novel:', error);
                const notifier = useNotificationStore();
                notifier.showNotification('Không thể cập nhật tiểu thuyết!', 'error', false);
            } finally {
                this.submitting = false;
            }
        },
        openEditEmail() {
            this.showEditProfile = true;
            this.profileError = '';
        },
        closeEditProfile() {
            this.showEditProfile = false;
            this.profileError = '';
        },
        async handleUpdateUsername(username) {
            this.submitting = true;
            try {
                const userId = this.authStore.user?._id;
                const response = await UserService.updateProfile(userId, { username });
                this.authStore.updateUser(response);
            } catch (error) {
                console.error('Error updating username:', error);
                const notifier = useNotificationStore();
                notifier.showNotification(error.response?.data?.message || 'Không thể cập nhật tên người dùng!', 'error', false);
            } finally {
                this.submitting = false;
            }
        },
        validatePassword(password) {
            if (!password) return 'Mật khẩu không được để trống';
            
            if (password.length < 8) {
                return 'Mật khẩu phải có ít nhất 8 ký tự';
            }
            
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            if (!hasUpperCase || !hasLowerCase) {
                return 'Mật khẩu phải có cả chữ hoa và chữ thường';
            }
            
            if (!hasNumbers) {
                return 'Mật khẩu phải có ít nhất 1 số';
            }
            
            if (!hasSpecialChar) {
                return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)';
            }
            
            return null;
        },
        async saveProfile(email) {
            this.submitting = true;
            this.profileError = '';
            
            try {
                const userId = this.authStore.user?._id;
                const response = await UserService.updateProfile(userId, { email });
                
                // Update from API response
                this.authStore.updateUser(response);
                const notifier = useNotificationStore();
                notifier.showNotification('Cập nhật email thành công!', 'success', true);
                this.closeEditProfile();
            } catch (error) {
                console.error('Error updating email:', error);
                this.profileError = error.response?.data?.message || 'Không thể cập nhật email!';
                const notifier = useNotificationStore();
                notifier.showNotification(this.profileError, 'error', false);
            } finally {
                this.submitting = false;
            }
        },
        closeChangePassword() {
            this.showChangePassword = false;
            this.passwordError = '';
        },
        async changePassword({ currentPassword, newPassword, confirmPassword }) {
            this.passwordError = '';
            
            // Validate new password strength
            const validationError = this.validatePassword(newPassword);
            if (validationError) {
                this.passwordError = validationError;
                const notifier = useNotificationStore();
                notifier.showNotification(validationError, 'error', false);
                return;
            }
            
            if (newPassword !== confirmPassword) {
                this.passwordError = 'Mật khẩu xác nhận không khớp!';
                const notifier = useNotificationStore();
                notifier.showNotification(this.passwordError, 'error', false);
                return;
            }

            this.submitting = true;
            try {
                const userId = this.authStore.user?._id;
                await UserService.changePassword(userId, {
                    currentPassword,
                    newPassword
                });
                
                const notifier = useNotificationStore();
                notifier.showNotification('Đổi mật khẩu thành công!', 'success', true);
                this.closeChangePassword();
            } catch (error) {
                console.error('Error changing password:', error);
                this.passwordError = error.response?.data?.message || 'Không thể đổi mật khẩu!';
                const notifier = useNotificationStore();
                notifier.showNotification(this.passwordError, 'error', false);
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
                const notifier = useNotificationStore();
                notifier.showNotification('Vui lòng chọn file ảnh!', 'error', false);
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                const notifier = useNotificationStore();
                notifier.showNotification('Kích thước ảnh không được vượt quá 5MB!', 'error', false);
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
                
                const notifier = useNotificationStore();
                notifier.showNotification('Cập nhật ảnh đại diện thành công!', 'success', true);
                this.closeAvatarUpload();
            } catch (error) {
                console.error('Error uploading avatar:', error);
                const notifier = useNotificationStore();
                notifier.showNotification(error.response?.data?.message || 'Không thể tải lên ảnh đại diện!', 'error', false);
            } finally {
                this.submitting = false;
            }
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';
@import '@/assets/utilities.css';

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

/* Custom button for login */
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
}
</style>
