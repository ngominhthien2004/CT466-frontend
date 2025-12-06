<template>
    <div class="comments-list">
        <div v-if="comments.length === 0" class="no-comments">
            <i class="far fa-comment"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
        <CommentItem
            v-for="comment in comments"
            :key="comment._id"
            :comment="comment"
            :current-user-id="currentUserId"
            :reload-trigger="reloadTrigger"
            @like="$emit('like', $event)"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
        />
    </div>
</template>

<script>
import CommentItem from './CommentItem.vue';

export default {
    name: 'CommentList',
    components: {
        CommentItem
    },
    props: {
        comments: {
            type: Array,
            default: () => []
        },
        currentUserId: {
            type: String,
            default: null
        },
        reloadTrigger: {
            type: Number,
            default: 0
        }
    },
    emits: ['like', 'reply', 'delete']
};
</script>

<style scoped>
.comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.no-comments {
    background: white;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    color: #95a5a6;
}

.no-comments i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-comments p {
    margin: 0;
    font-size: 1.1rem;
}
</style>
