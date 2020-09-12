<template>
  <CRow>
    <CCol col v-if="loading">
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner color="dark" style="width:6rem;height:6rem;" />
      </div>
    </CCol>
    <CCol col v-else>
      <CAlert :show.sync="alert" color="success" closeButton>{{alert_message}}</CAlert>
      <CButton color="primary" @click="showModal">Upload Plugin</CButton>
      <br />
      <br />
      <CRow>
        <CCol>
          <h2>Available Plugins</h2>
        </CCol>
      </CRow>
      <CRow>
        
        <CCol v-for="plugin in plugins" :key="plugin.name" lg="4">
        <CCard class="shadow-sm bg-white rounded">
            <CCardBody>
              <div class="text-right">
                <CSwitch color="success" label-on="On" label-off="Off" v-bind:checked="plugin.enabled"/>
              </div>
              <div class="text-center">
                <img style="max-width:100%; max-height: 200px;" :src="`data:image/png;base64,${plugin.logo}`">
              </div>
              {{plugin.description}}<br>
              Number of actions: {{plugin.manifest.actions.length}}<br>
            </CCardBody>
            <CCardFooter>
              <CRow>
                <CCol class="text-left">
                  <span style="font-size: .85em;"><b>Last Updated:</b> {{plugin.modified_at | moment('from', 'now')}}<br><b>Configured:</b> {{plugin.configs.length}}</span>
                </CCol>
                <CCol class="text-right">
                  <CButton color="primary" :to="plugin.uuid" size="sm">Configure</CButton>
                  
                </CCol>
              </CRow>
            </CCardFooter>
        </CCard>
        </CCol>
      </CRow>
    </CCol>
    <CModal
      title="New Plugin"
      color="dark"
      :centered="true"
      size="lg"
      :show.sync="uploadPluginModal"
    >
      <div>
        <form
          @submit.prevent="uploadPlugin"
          enctype="multipart/form-data"
          novalidate
          v-if="isInitial || isSaving"
        >
          <p
            class="text-muted"
          >Upload a new plugin using the upload form below. Plugins must be uploaded in .zip format.</p>
          <div class="dropbox">
            <input
              type="file"
              multiple
              :name="uploadFieldName"
              :disabled="isSaving"
              @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
              class="input-file"
            />
            <p v-if="isInitial">Drag your plugin files here to begin</p>
            <p v-if="isSaving">Uploading {{ fileCount }} plugins</p>
          </div>
        </form>
        <div v-if="isSuccess">
          <h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
          <p>
            <a href="javascript:void(0)" @click="reset()">Upload again</a>
          </p>
          <ul>
            <li v-for="item in uploadedFiles" v-bind:key="item.name">{{item.name}}
            </li>
          </ul>
        </div>
        <!--FAILED-->
        <div v-if="isFailed">
          <h2>Upload failed.</h2>
          <p><br>
            <a href="javascript:void(0)" @click="reset()">Try again</a>
          </p>
          <pre>{{ uploadError }}</pre>
        </div>
      </div>
      <template #footer>
        <CButton @click="uploadPluginModal = false" color="danger">Discard</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
const STATUS_INITIAL = 0,
  STATUS_SAVING = 1,
  STATUS_SUCCESS = 2,
  STATUS_FAILED = 3;
const UPLOAD_SUCCESS = "Successfully uploaded plugin.";
export default {
  name: "Inputs",
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
    },
  },
  created: function () {
    this.loadData();
    this.refresh = setInterval(
      function () {
        this.loadData();
      }.bind(this),
      60000
    );
  },
  data() {
    return {
      name: "",
      description: "",
      dismissCountDown: 10,
      loading: true,
      uploadFieldName: "files",
      currentStatus: STATUS_INITIAL,
      uploadError: null,
      uploadedFiles: [],
      uploadPluginModal: false,
      alert: false,
      alert_message: "",
    };
  },
  methods: {
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    showModal() {
      this.reset();
      this.uploadPluginModal = true;
    },
    save(formData) {
      // upload data to the server
      this.currentStatus = STATUS_SAVING;
      this.$store
        .dispatch("uploadPlugin", formData)
        .then((resp) => {
          this.uploadedFiles = [].concat(resp);
          this.currentStatus = STATUS_SUCCESS;
          this.loadData()
        })
        .catch((err) => {
          this.uploadError = err.response.data.message;
          this.currentStatus = STATUS_FAILED;
        });
    },
    filesChange(fieldName, fileList) {
      // handle file changes
      const formData = new FormData();

      if (!fileList.length) return;

      // append the files to FormData
      Array.from(Array(fileList.length).keys()).map((x) => {
        formData.append(fieldName, fileList[x], fileList[x].name);
      });

      // save it
      this.save(formData);
    },
    addSuccess: function () {
      if (this.$store.getters.addSuccess == "success") {
        return true;
      } else {
        return false;
      }
    },
    loadData: function () {
      this.loading = true;
      this.$store.dispatch("getPlugins").then((resp) => {
        this.plugins = resp.data;
        this.loading = false;
      });
    },
  },
  beforeDestroy: function () {
    clearInterval(this.refresh);
  },
};
</script>
