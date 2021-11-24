<template>
  <div class="comments">
    <timeline>
      <timeline-item v-for="comment in comments_list" :key="comment.uuid" bg-color="#9dd8e0">
        <Comment :comment="comment" :deleteAction="deleteComment"/>
      </timeline-item>
    </timeline>
    <CRow>
      <CCol>
        <CCardBody>
          <CTextarea
            v-model="comment_text"
            rows="5"
            placeholder="Enter your comment here...Markdown format is supported"
          ></CTextarea>
          <CButton color="primary" @click="leaveComment()" v-bind:disabled="comment_text.length == 0">Comment</CButton>
        </CCardBody>
      </CCol>
    </CRow>
    <CModal title="Delete Comment" color="danger" :centered="true" :show.sync="delete_modal">
      <CForm id="deleteCommentForm" @submit.prevent="deleteComment(target_comment.uuid)">
        Are you sure you want to delete this comment?
      </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">No</CButton>
        <CButton type="submit" form="deleteCommentForm" color="danger">Yes</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { vSelect } from "vue-select";
import { Timeline, TimelineItem, TimelineTitle } from "vue-cute-timeline";
import 'vue-cute-timeline/dist/index.css'
import { mapState } from 'vuex';
import { loadOptions } from '@babel/core';
import Comment from './Comment'
export default {
  name: "Comments",
  components: {
    Comment,
    Timeline,
    TimelineItem,
    TimelineTitle,
  },
  props: {
    comments: Array,
    comment_type: "",
    uuid: "",
  },
  data() {
    return {
      comments_list: [],
      comment_text: "",
      delete_modal: false,
      target_comment: {}
    };
  },
  watch: {
    comments: function() {
      this.comments_list = this.comments
    }
  },
  created() {
    this.comments_list = this.comments    
  },
  computed: mapState(['current_user','settings']),
  methods: {
    deleteCommentModal(uuid) {
      this.target_comment = this.comments_list.find(comment => comment.uuid === uuid)
      this.delete_modal = true
    },
    deleteComment(uuid) {
      this.$store.dispatch('deleteCaseComment', uuid).then(resp => {
        this.comments_list = this.comments_list.filter(comment => comment.uuid !== uuid)
      })
      this.delete_modal = false
    },
    leaveComment() {
        let data = {'message': this.comment_text, 'case_uuid': this.uuid}
        this.$store.dispatch('createCaseComment', data).then(resp => {
            this.comments_list = this.$store.getters.comments
        })
        this.comment_text = "";
    }
  },
};
</script>