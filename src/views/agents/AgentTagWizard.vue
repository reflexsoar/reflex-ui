<template>
  <CModal :centered="false" size="lg" :show.sync="show">
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect/dist/vue-multiselect.min.css"
    />
    <template #header>
      <h5 class="modal-title" style="text-transform: capitalize">{{ mode }} Agent Tag</h5>
    </template>
    <CAlert :show.sync="error" color="danger">
      {{ error_message }}
    </CAlert>
    <CRow>
        <CCol>
            
            <CInput
            label="Namespace"
            v-model="namespace"
            placeholder="Enter a name for the tag"
            />
            
        </CCol>
        <CCol>
            <CInput
            label="Value"
            v-model="value"
            placeholder="Enter a name for the tag"
            />
        </CCol>
        <CCol col=2>
            <CInput label="Color" type="color" v-model="color" placeholder="Enter a color for the tag"/>
            </CCol>
    </CRow>
    <CRow>
        <CCol>
            <CTextarea
            label="Description"
            v-model="description"
            placeholder="Enter a description for the tag"
            />
        </CCol>
    </CRow>
    <CRow>
        <CCol>
            <CTextarea
            label="Query"
            v-model="query"
            placeholder="Enter a query for the tag"
            />
        </CCol>
    </CRow>
    <CRow>
        <CCol>
            <h5>Preview</h5>
            <AgentTag :namespace="namespace" :value="value" :color="color" />
        </CCol>
    </CRow>
    <template #footer>
      <CRow>
        <CCol class="text-right">
          <CButton color="secondary" @click="dismiss">Cancel</CButton>&nbsp;
          <CButton v-if="mode == 'create'" color="primary" @click="createTag"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
          >
          <CButton v-if="mode == 'edit'" color="primary" @click="updateTag"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Update</CButton
          >
        </CCol>
      </CRow>
    </template>
    </CModal>
</template>

<style>
</style>

<script>
import { mapState } from "vuex";

import AgentTag from "./AgentTag.vue";

export default {
  name: "AgentTagWizard",
  components: {
    AgentTag,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "create",
    },
    tag: {
      type: Object,
      default: () => {
        return {
          namespace: "",
          value: "",
          description: "",
          query: "",
          organization: "",
          color: "",
        };
      },
    },
  },
  computed: mapState(["current_user", "organizations"]),
  data() {
    return {
      error: false,
      error_message: "",
      namespace: "",
      description: "",
      value: "",
      query: "",
      dynamic: true,
      organization: "",
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      submitted: false,
    };
  },
  watch: {
    show: function () {
      this.$emit("update:show", this.show);
      if (this.show) {
        if (this.rule != {}) {
          let tag_data = JSON.parse(JSON.stringify(this.tag));
          this.uuid = tag_data.uuid;
          this.name = tag_data.name;
          this.organization = tag_data.organization;
          this.description = tag_data.description;
          this.namespace = tag_data.namespace;
          this.value = tag_data.value;
          this.query = tag_data.query;
          this.color = tag_data.color;
        }

        if (this.mode == "create") {
          this.reset();
        }
      }
    },
  },
  methods: {
    generateRandomHexColor() {
        this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    },
    getFontColor(color) {
        let color_info = Color(color);
        console.log(color_info.isDark())
        /* The font should be white if the background is dark */
        if (color_info.isDark()) {
            return "#fff";
        } else {
            return "#000";
        }
    },
    reset() {
        this.error = false;
        this.error_message = "";
        this.namespace = "";
        this.description = "";
        this.value = "";
        this.query = "";
        this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        this.submitted = false;
    },
    createTag() {
      this.error = false;
      this.error_message = "";
      this.submitted = true;
      this.$store
        .dispatch("createAgentTag", this.tag)
        .then(() => {
          this.submitted = false;
          this.$emit("dismiss");
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.submitted = false;
        });
    },
    updateTag() {
      this.error = false;
      this.error_message = "";
      this.$store
        .dispatch("updateAgentTag", this.tag)
        .then(() => {
            this.submitted = false;
          this.$emit("dismiss");
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.submitted = false;
        });
    },
    closeModal() {
      this.reset();
      this.$emit("update:show", false);
    },
    dismiss() {
      this.closeModal();
    },
  },
};
</script>