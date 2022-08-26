<template>
    <div>
        <link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css" />
        <CModal title="Event Comment" :centered="true" size="xl" :show.sync="modalStatus">
            <template #header>
                <h5 style="text-transform: capitalize">Event Comment</h5>
                <span class="text-right">
                    <button type="button" aria-label="Close" class="close" @click="dismiss()">
                        ×
                    </button>
                    <button type="button" class="kb" aria-label="Documentation"
                        onclick="window.open('https://docs.reflexsoar.com/en/latest/events')">
                        <CIcon name="cil-book" size="lg" />
                    </button>
                </span>
            </template>
            <div>
                <CRow>
                    <CCol>
                        <CAlert :show.sync="error" color="danger" closeButton>
                            {{ error_message }}
                        </CAlert>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <p>Add a comment on this event, <b>{{event.title}}</b>.</p>
                        <markdown-editor height="auto" theme="success" :value="comment" @change="comment = $event"></markdown-editor>
                    </CCol>
                </CRow>
            </div>
            <template #footer>
                <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
                <CButton @click="createEventComment()" color="primary" :disabled="submitted"><span v-if="submitted">
                        <CSpinner size="sm" />&nbsp;
                    </span>Comment</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>

import { mapState } from "vuex";
import 'v-markdown-editor/dist/v-markdown-editor.css';

export default {
    name: 'EventCommentModal',
    props: {
        show: Boolean,
        event: {
            Object,
            default: {}
        }
    },
    computed: mapState(['settings', 'current_user']),
    data() {
        return {            
            error: false,
            error_message: '',
            modalStatus: this.show,
            submitted: false,
            comment: ""
        }
    },
    watch: {
        show: function () {
            this.error = false;
            this.error_message = "";
            if (this.mode == "Edit") {
                this.step = 0;
            }
            this.modalStatus = this.show;
        },
        modalStatus: function () {
            if (this.modalStatus) {
                this.test_failed = true;
            }
            this.$emit("update:show", this.modalStatus);
            if (!this.modalStatus) {
                this.dismiss();
            }
        }
    },
    created() {
    },
    methods: {
        dismiss() {
            this.comment = ""
            this.modalStatus = false
        },
        createEventComment() {
            let payload = {
                comment: this.comment
            }
            console.log(this.comment)
            this.$store.dispatch('createEventComment', {
                uuid: this.event.uuid,
                data: payload
            }).then(response => {
                this.comment = ""
                this.modalStatus = false
            }).catch(error => {
                this.error = true;
                this.error_message = error.response.data.message;
            });
        }
    }
}

</script>