<template>
  <div class="comments">
    <CRow>
      <CCol>
        <div v-for="case_file in case_files" :key="case_file.uuid">
          <CCardBody>
            <CaseFileCard :case_file="case_file" :deleteAction="deleteFile"/>
          </CCardBody>
        </div>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCardBody style="padding-top:0px;">
         <CRow>
          <CCol class="text-right">
            <CButton @click="upload_modal = !upload_modal" class="text-right" color="secondary">Upload File</CButton><br><br>
          </CCol>
        </CRow>
        </CCardBody>
      </CCol>
    </CRow>
    <CModal title="Delete File" color="danger" :centered="true" :show.sync="delete_modal">
      AMAZING
    </CModal>
    <CModal title="Upload Files" color="dark" size="lg" :centered="true" :show.sync="upload_modal">
      <div>
        <form
          @submit.prevent="uploadFile"
          enctype="multipart/form-data"
          novalidate
          v-if="isInitial || isSaving"
        >
          <p
            class="text-muted"
          >Upload files that are related to the case.</p>
          <CTextarea v-model="file_comment" label="Comment" rows="5" placeholder="Add a comment to add context to the uploaded file"/>
          <div class="dropbox">
            <input
              type="file"
              multiple
              :name="uploadFieldName"
              :disabled="isSaving"
              @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
              class="input-file"
            />
            <p v-if="isInitial">Drag your files here to begin</p>
            <p v-if="isSaving">Uploading {{ fileCount }} files</p>
          </div>
        </form>
      </div>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton type="submit" form="applyCaseTemplateForm" color="primary">Upload</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from 'vuex';
import { loadOptions } from '@babel/core';
import CaseFileCard from './CaseFileCard'
const STATUS_INITIAL = 0,
  STATUS_SAVING = 1,
  STATUS_SUCCESS = 2,
  STATUS_FAILED = 3;
export default {
  name: "CaseFileList",
  components: {
    CaseFileCard
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  props: {
    case_files: Array,
    uuid: "",
  },
  data() {
    return {
      file_list: [],
      delete_modal: false,
      uploadFieldName: "files",
      currentStatus: STATUS_INITIAL,
      uploadError: null,
      uploadedFiles: [],
      upload_modal: false,
      file_comment: "",
      fileCount: 0
    };
  },
  created() {
    this.comments_list = this.comments    
  },
  methods: {
    deleteFile() {
      console.log('DELETE!')
    },
    filesChange(fieldName, fileList) {
      // handle file changes
      const formData = new FormData();

      if (!fileList.length) return;

      // append the files to FormData
      Array.from(Array(fileList.length).keys()).map((x) => {
        formData.append(fieldName, fileList[x], fileList[x].name);
      });
      this.currentStatus = STATUS_SAVING;
    }
  },
};
</script>