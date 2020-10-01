<template>
  <div class="comments">
    <timeline>
      <timeline-item v-for="comment in comments_list" :key="comment.uuid" bg-color="#9dd8e0">
        <CCard>
          <CCardHeader class="bg-light">
            <CRow>
              <CCol col="6">
              <span v-if="!comment.is_closure_comment"><b>{{comment.created_by.username}}</b> commented {{comment.created_at | moment('from', 'now')}}.</span>
              <span v-else><b>{{comment.created_by.username}}</b> closed the case with the following comment at {{comment.created_at | moment('from', 'now')}}.</span>
              </CCol>
              <CCol col="6" class="text-right">
                <CButton color="danger" size="sm" v-if="current_user.uuid == comment.created_by.uuid && settings.allow_comment_deletion && !comment.is_closure_comment" @click="deleteCommentModal(comment.uuid)">Delete</CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <vue-markdown>{{comment.message}}</vue-markdown>
          </CCardBody>
        </CCard>
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
import { mapState } from 'vuex';
import { loadOptions } from '@babel/core';
export default {
  name: "Comments",
  components: {
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
    deleteComment() {
      let uuid = this.target_comment.uuid
      this.$store.dispatch('deleteCaseComment', this.target_comment.uuid).then(resp => {
        this.comments_list = this.comments_list.filter(comment => comment.uuid !== this.target_comment.uuid)
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