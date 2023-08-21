<template>
    <div>
        <div style="height: 80%; max-height: 425px; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
            <Comment v-for="comment in event_comments" :key="comment.uuid" :comment="comment"/>
        </div>
        <CommentBox :event_uuid="event_uuid"/>
    </div>
</template>

<script>

import { mapState } from "vuex";
import Comment from "./Comment.vue";
import CommentBox from "./CommentBox.vue";

export default {
    name: "CommentList",
    components: {
        Comment,
        CommentBox
    },
    computed: {
        ...mapState(["current_user", "settings", "event_comments"])
    },
    props: {
        event_uuid: String
    }
}
</script>