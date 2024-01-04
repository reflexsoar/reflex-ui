<template>
    <div>
    <CommentBox :event_uuid="event_uuid"/>
        <div style="height: 80%; overflow-y: auto; overflow-x: hidden;">
            <timeline>
                <timeline-item bg-color="#9dd8e0" style="padding-bottom:5px;" v-for="comment in event_comments" :hollow="true" :key="comment.uuid">
                    <Comment :key="comment.uuid" :comment="comment"/>
                </timeline-item>
            </timeline>
        </div>
        
    </div>
</template>

<script>

import { mapState } from "vuex";
import Comment from "./Comment.vue";
import CommentBox from "./CommentBox.vue";
import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
import 'vue-cute-timeline/dist/index.css'

export default {
    name: "CommentList",
    components: {
        Comment,
        CommentBox,
        Timeline,
        TimelineItem
    },
    computed: {
        ...mapState(["current_user", "settings", "event_comments"])
    },
    props: {
        event_uuid: String
    }
}
</script>