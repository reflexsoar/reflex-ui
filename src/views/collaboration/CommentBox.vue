<template>
  <div>
    <CRow>
      <CCol>
        <div class="comment-box-wrapper">
          <textarea
            v-model="comment_text"
            class="comment-box"
            placeholder="Enter your comment here.  Markdown is supported"
            @keyup.alt.enter="createComment()"
            v-bind:disabled="creating_comment"
          />
          <button
            class="comment-btn btn btn-primary"
            v-bind:disabled="comment_text.length == 0 || creating_comment"
            @click="createComment()"
          >
            <span v-if="creating_comment"><CSpinner size="sm" />&nbsp;</span>
            Comment
          </button>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.comment-box-wrapper {
  position: relative;
  width: 100%;
}

.comment-box {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #d8dbe0;
  resize: none;
  height: calc(1.5em + 0.75rem + 2px);
  min-height: calc(1.5em + 0.75rem + 2px);
}

.comment-box:focus {
  color: #768192;
  background-color: #fff;
  border-color: #958bef;
  outline: 0;
  min-height: calc(4.5em + 0.75rem + 2px);
  -webkit-box-shadow: 0 0 0 0.2rem rgba(50, 31, 219, 0.25);
  box-shadow: 0 0 0 0.2rem rgba(50, 31, 219, 0.25);
}

/* If the comment box has a value, increase the height */
.comment-box:not(:placeholder-shown) {
  min-height: calc(4.5em + 0.75rem + 2px);
}

/* If the comment box has a value show the button */
.comment-box:not(:placeholder-shown) + .comment-btn {
  display: flex;
}

/* Create a transition when the height value changes */
.comment-box {
  transition: min-height 0.25s ease;
}

.comment-btn {
  /* Hide the button by default */
  display: none;
  position: absolute;
  /* Float button to bottom right corner of the text area */
  bottom: 10px;
  right: 20px;
}

/* Only show the button when the text area has focus */
.comment-box:focus + .comment-btn {
  display: flex;
}
</style>

<script>
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/vue-editor";

export default {
  name: "CommentBox",
  components: {
    Editor,
  },
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
    settings: Object,
    event_uuid: String,
    comment_type: {
      type: String,
      default: "event",
    },
  },
  data() {
    return {
      comment_text: "",
      creating_comment: false,
    };
  },
  methods: {
    updateCommentText() {
      this.comment_text = this.$refs.commentEditor.invoke("getMarkdown");
    },
    createComment() {
      if (this.comment_type == "event") {
        this.createEventComment();
      } else {
        this.createCaseComment();
      }
    },
    createEventComment() {
      let payload = {
        comment: this.comment_text,
      };

      /* If the comment is empty, don't create it */
      if (payload.comment.length == 0) {
        return;
      }
      this.creating_comment = true;

      this.$store
        .dispatch("createEventComment", {
          uuid: this.event_uuid,
          data: payload,
        })
        .then((response) => {
          //this.$refs.commentEditor.invoke("setMarkdown", "");
          this.comment_text = "";
          this.creating_comment = false;
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.creating_comment = false;
        });
    },
  },
};
</script>
