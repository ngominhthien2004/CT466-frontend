<template>
    <div class="empty-state">
        <i :class="['fas', icon]"></i>
        <h3 v-if="title">{{ title }}</h3>
        <p v-if="message">{{ message }}</p>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'EmptyState',
    props: {
        icon: {
            type: String,
            default: 'fa-inbox'
        },
        title: {
            type: String,
            default: 'Không có dữ liệu'
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>
