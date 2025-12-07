<template>
    <div v-if="show" class="form-overlay" @click="$emit('close')">
        <div class="form-container" @click.stop>
            <div class="form-header">
                <h3>
                    <i class="fas fa-envelope"></i>
                    Cập nhật Email
                </h3>
                <button @click="$emit('close')" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form @submit.prevent="handleSubmit" class="form-body">
                <div v-if="error" class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ error }}
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input
                        v-model="email"
                        type="email"
                        placeholder="Nhập email"
                        required
                    />
                </div>
                <div class="form-actions">
                    <button type="button" @click="$emit('close')" class="btn-cancel">
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
</template>

<script>
export default {
    name: 'EditEmailModal',
    props: {
        show: { type: Boolean, required: true },
        currentEmail: { type: String, default: '' },
        error: { type: String, default: '' },
        submitting: { type: Boolean, default: false }
    },
    emits: ['close', 'submit'],
    data() {
        return {
            email: ''
        };
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.email = this.currentEmail;
            }
        }
    },
    methods: {
        handleSubmit() {
            this.$emit('submit', this.email);
        }
    }
};
</script>

<style scoped>
@import '@/assets/form.css';

/* Use global .error utility from utilities.css for boxed alert */
</style>
