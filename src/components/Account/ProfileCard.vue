<template>
    <div class="profile-card">
        <div class="profile-header">
            <div class="avatar-section">
                <img
                    :src="userAvatar"
                    :alt="username"
                    class="profile-avatar"
                    @error="handleAvatarError"
                />
                <button class="btn-change-avatar" @click="$emit('change-avatar')">
                    <i class="fas fa-camera"></i>
                </button>
            </div>
            <div class="profile-info">
                <div class="username-edit-section">
                    <h2 v-if="!editingUsername" class="username-display">
                        {{ username }}
                        <button class="btn-edit-username" @click="startEditUsername" title="Chỉnh sửa tên">
                            <i class="fas fa-pen"></i>
                        </button>
                    </h2>
                    <div v-else class="username-edit-form">
                        <input
                            ref="usernameInput"
                            v-model="tempUsername"
                            type="text"
                            class="username-input"
                            @keyup.enter="saveUsername"
                            @keyup.esc="cancelEditUsername"
                        />
                        <button class="btn-save-username" @click="saveUsername" title="Lưu">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-cancel-username" @click="cancelEditUsername" title="Hủy">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <span class="role-badge" :class="role?.toLowerCase()">
                    {{ roleText }}
                </span>
            </div>
        </div>

        <div class="profile-details">
            <div class="detail-item">
                <i class="fas fa-envelope"></i>
                <div>
                    <label>Email</label>
                    <span>{{ email || 'Chưa cập nhật' }}</span>
                </div>
            </div>
            <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <label>Ngày tham gia</label>
                    <span>{{ formatDate(createdAt) }}</span>
                </div>
            </div>
        </div>

        <div class="profile-actions">
            <button class="btn-action" @click="$emit('edit-email')">
                <i class="fas fa-envelope"></i>
                Cập nhật Email
            </button>
            <button class="btn-action" @click="$emit('change-password')">
                <i class="fas fa-key"></i>
                Đổi mật khẩu
            </button>
        </div>
    
    </div>
</template>

<script>
import { useNotificationStore } from '@/stores'

export default {
    name: 'ProfileCard',
    props: {
        username: { type: String, required: true },
        email: { type: String, default: '' },
        userAvatar: { type: String, required: true },
        role: { type: String, required: true },
        roleText: { type: String, required: true },
        createdAt: { type: String, default: '' }
    },
    emits: ['change-avatar', 'edit-email', 'change-password', 'update-username'],
    data() {
        return {
            editingUsername: false,
            tempUsername: '',
            
        };
    },
    methods: {
        handleAvatarError(event) {
            event.target.src = '/assets/default-avatar.svg';
        },
        startEditUsername() {
            this.tempUsername = this.username;
            this.editingUsername = true;
            this.$nextTick(() => {
                this.$refs.usernameInput?.focus();
            });
        },
        cancelEditUsername() {
            this.editingUsername = false;
            this.tempUsername = '';
        },
        saveUsername() {
            const notifier = useNotificationStore();
            if (!this.tempUsername || this.tempUsername.trim() === '') {
                notifier.showNotification('Tên người dùng không được để trống!', 'error', false);
                return;
            }
            if (this.tempUsername === this.username) {
                this.cancelEditUsername();
                return;
            }
            this.$emit('update-username', this.tempUsername.trim());
            this.cancelEditUsername();
        },
        formatDate(date) {
            if (!date) return 'Không rõ';
            return new Date(date).toLocaleDateString('vi-VN');
        }
    }
};
</script>


<style scoped>
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

.username-edit-section {
    margin-bottom: 0.5rem;
}

.username-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    font-size: 2rem;
}

.btn-edit-username {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(201, 169, 166, 0.1);
    border: none;
    color: #c9a9a6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    opacity: 0.6;
}

.btn-edit-username:hover {
    background: #c9a9a6;
    color: white;
    opacity: 1;
    transform: scale(1.1);
}

.username-edit-form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.username-input {
    font-size: 2rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border: 2px solid #c9a9a6;
    border-radius: 6px;
    outline: none;
    font-family: inherit;
}

.username-input:focus {
    border-color: #b8a39e;
    box-shadow: 0 0 0 3px rgba(201, 169, 166, 0.1);
}

.btn-save-username,
.btn-cancel-username {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    font-size: 0.9rem;
}

.btn-save-username {
    background: #27ae60;
    color: white;
}

.btn-save-username:hover {
    background: #229954;
    transform: scale(1.1);
}

.btn-cancel-username {
    background: #e74c3c;
    color: white;
}

.btn-cancel-username:hover {
    background: #c0392b;
    transform: scale(1.1);
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

@media (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
    }

    .profile-actions {
        flex-direction: column;
    }
}
</style>
