<template>
  <CModal :centered="false" size="xl" :show.sync="show">
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect/dist/vue-multiselect.min.css"
    />
    <template #header>
      <h5 class="modal-title" style="text-transform: capitalize">{{ mode }} FIM Rule</h5>
    </template>
    <CAlert :show.sync="error" color="danger">
      {{ error_message }}
    </CAlert>
    <CTabs
      :fade="false"
      variant="pills"
      :activeTab.sync="step"
      :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
    >
      <CTab title="Rule Details">
        <h4>Rule Details</h4>
        <CRow>
          <CCol>
            <SelectInput
              v-if="current_user.default_org"
              label="Organization"
              :options="organizations"
              :value.sync="organization"
              option_label="name"
              option_key="uuid"
            />
            <CInput
              label="Rule Name"
              v-model="name"
              placeholder="Enter a name for this rule"
            />
            <CTextarea
              label="Description"
              v-model="description"
              placeholder="Enter a description for this rule"
            />
            <CRow>
              <CCol>
                <CSelect label="Severity" :value.sync="severity" :options="severities" />
              </CCol>
              <CCol>
                <CInput
                  v-model.number="risk_score"
                  label="Risk Score"
                  type="number"
                  min="0"
                  max="100"
                />
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Paths">
        <CRow>
          <CCol>
            <h4>Paths to Monitor</h4>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <p>
              Enter one or more paths to monitor for changes. If you want to monitor a
              single file, you can include it on the Filters tab as an include pattern.
            </p>
          </CCol>
        </CRow>
        <CRow v-for="(path, index) in paths" :key="index">
          <CCol col>
            <CInput
              v-model="paths[index]"
              :key="index"
              placeholder="Enter a path to monitor"
            >
              <template #append>
                <CButton @click="removePath(index)" color="danger"
                  ><i class="fas fa-trash-can"
                /></CButton>
              </template>
            </CInput>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <CButton @click="newPath" color="primary">Add Path</CButton>
          </CCol>
        </CRow>
        <CRow>
          <CCol
            ><br />
            <label>Recurse Paths</label><br />
            <CSwitch
              :checked.sync="recursive"
              color="success"
              label-on="Yes"
              label-off="No"
            />
          </CCol>
        </CRow>
      </CTab>
      <CTab title="Filters">
        <h4>File Filters</h4>
        <p>
          File filters allow you to specify which files to include or exclude from
          monitoring. You can use regular expressions to match multiple files.
        </p>
        <CTabs variant="pills">
          <CTab title="Exclude Patterns"
            ><br />
            <h5>Exclude Patterns</h5>
            <p>Enter one or more regular expressions to exclude from monitoring.</p>
            <CRow v-for="(pattern, index) in exclude_patterns" :key="index">
              <CCol>
                <CInput
                  v-model="exclude_patterns[index]"
                  :key="index"
                  placeholder="Enter a regular expression to exclude"
                >
                  <template #append>
                    <CButton @click="removeExcludePattern(index)" color="danger"
                      ><i class="fas fa-trash-can"
                    /></CButton>
                  </template>
                </CInput>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton @click="newExcludePattern" color="primary"
                  >Add Exclude Pattern</CButton
                >
              </CCol>
            </CRow>
          </CTab>
          <CTab title="Include Patterns"
            ><br />
            <h5>Include Patterns</h5>
            <p>Enter one or more regular expressions to include in monitoring.</p>
            <CRow v-for="(pattern, index) in include_patterns" :key="index">
              <CCol>
                <CInput
                  v-model="include_patterns[index]"
                  :key="index"
                  placeholder="Enter a regular expression to include"
                >
                  <template #append>
                    <CButton @click="removeIncludePattern(index)" color="danger"
                      ><i class="fas fa-trash-can"
                    /></CButton>
                  </template>
                </CInput>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CButton @click="newIncludePattern" color="primary"
                  >Add Include Pattern</CButton
                >
              </CCol>
            </CRow>
          </CTab>
        </CTabs>
        <CRow>
          <CCol> </CCol>
        </CRow>
      </CTab>
      <CTab title="Advanced Settings">
        <h4>Advanced Settings</h4>

        <CRow>
          <CCol> </CCol>
        </CRow>
      </CTab>
    </CTabs>
    <template #footer>
      <CRow>
        <CCol class="text-right">
          <CButton color="secondary" @click="dismiss">Cancel</CButton>&nbsp;
          <CButton v-if="mode == 'create'" color="primary" @click="createRule"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
          >
          <CButton v-if="mode == 'edit'" color="primary" @click="updateRule"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Update</CButton
          >
        </CCol>
      </CRow>
    </template>
  </CModal>
</template>

<script>
import { mapState } from "vuex";

import SelectInput from "../components/SelectInput.vue";

import { v4 as uuid4 } from "uuid";

export default {
  name: "FIMRuleModal",
  components: {
    SelectInput,
  },
  props: {
    show: Boolean,
    rule: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: String,
      default: "create",
    },
  },
  computed: mapState(["current_user", "organizations"]),
  watch: {
    show: function () {
      this.$emit("update:show", this.show);
      if (this.show) {
        if (this.rule != {}) {
          let rule_data = JSON.parse(JSON.stringify(this.rule));
          this.uuid = rule_data.uuid;
          this.name = rule_data.name;
          this.organization = rule_data.organization;
          this.description = rule_data.description;
          this.severity = rule_data.severity;
          this.risk_score = rule_data.risk_score;
          this.paths = rule_data.paths;
          this.recursive = rule_data.recursive;
          this.exclude_patterns = rule_data.exclude_patterns;
          this.include_patterns = rule_data.include_patterns;
          this.max_file_size = rule_data.max_file_size;
          this.max_parallel_files = rule_data.max_parallel_files;
          this.check_interval = rule_data.check_interval;
          this.hashes = rule_data.hashes;
          this.alert = rule_data.alert;
          this.collect_additional_data = rule_data.collect_additional_data;
        }

        if (this.mode == "create") {
          this.reset();
        }
      }
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      error_message: "",
      submitted: false,
      organization: "",
      name: "",
      description: "",
      organization: "",
      severity: 0,
      risk_score: 1,
      paths: [],
      recursive: false,
      file_types: [],
      exclude_patterns: [
        ".*\\.(etl|evtx|job|log|ldf|mdf|vmdk|vmd|vhd|vhdx|mof|vmx|vmsd|lck|swap|log\\.?\\d+|jfm|edb|frm|myd|myi|pyc|db|regtrans-ms|sqlite)$",
      ],
      include_patterns: [],
      max_file_size: 100000000,
      max_parallel_files: 5,
      check_interval: 60,
      hashes: [],
      alert: true,
      collect_additional_data: false,
      severities: [
        { label: "Informational", value: 0 },
        { label: "Low", value: 1 },
        { label: "Medium", value: 2 },
        { label: "High", value: 3 },
        { label: "Critical", value: 4 },
      ],
      step: 0,
    };
  },
  methods: {
    closeModal() {
      this.reset();
      this.$emit("update:show", false);
    },
    reset() {
      this.name = "";
      this.organization = "";
      this.description = "";
      this.severity = 0;
      this.risk_score = 1;
      this.paths = [];
      this.exclude_patterns = [
        ".*\\.(etl|evtx|job|log|ldf|mdf|vmdk|vmd|vhd|vhdx|mof|vmx|vmsd|lck|swap|log\\.?\\d+|jfm|edb|frm|myd|myi|pyc|db|regtrans-ms|sqlite)$",
      ];
      this.include_patterns = [];
      this.max_file_size = 100000000;
      this.max_parallel_files = 5;
      this.check_interval = 60;
      this.hashes = [];
      this.alert = true;
      this.collect_additional_data = false;
      this.step = 0;
      this.error = false;
      this.error_message = "";
    },
    createRule() {
      this.submitted = true;
      let payload = {
        name: this.name,
        description: this.description,
        severity: this.severity,
        risk_score: this.risk_score,
        paths: this.paths,
        recursive: this.recursive,
        exclude_patterns: this.exclude_patterns,
        include_patterns: this.include_patterns,
        max_file_size: this.max_file_size,
        max_parallel_files: this.max_parallel_files,
        check_interval: this.check_interval,
        hashes: this.hashes,
        alert: this.alert,
        collect_additional_data: this.collect_additional_data,
      };

      if (this.current_user.default_org) {
        payload.organization = this.organization;
      }

      this.$store
        .dispatch("createFIMRule", payload)
        .then((resp) => {
          this.submitted = false;
          this.closeModal();
        })
        .catch((err) => {
          this.error = true;
          this.error_message = err.response.data.message;
          this.submitted = false;
        });
    },
    newFileType() {
      this.file_types.push("");
    },
    removeFileType(index) {
      this.file_types.splice(index, 1);
    },
    newExcludePattern() {
      this.exclude_patterns.push("");
    },
    removeExcludePattern(index) {
      this.exclude_patterns.splice(index, 1);
    },
    newIncludePattern() {
      this.include_patterns.push("");
    },
    removeIncludePattern(index) {
      this.include_patterns.splice(index, 1);
    },
    newPath() {
      this.paths.push("");
    },
    removePath(index) {
      this.paths.splice(index, 1);
    },
    updateRule() {
      this.submitted = true;
      let payload = {
        name: this.name,
        description: this.description,
        severity: this.severity,
        risk_score: this.risk_score,
        paths: this.paths,
        recursive: this.recursive,
        exclude_patterns: this.exclude_patterns,
        include_patterns: this.include_patterns,
        max_file_size: this.max_file_size,
        max_parallel_files: this.max_parallel_files,
        check_interval: this.check_interval,
        hashes: this.hashes,
        alert: this.alert,
        collect_additional_data: this.collect_additional_data,
      };

      if (this.current_user.default_org) {
        payload.organization = this.organization;
      }

      this.$store
        .dispatch("updateFIMRule", { uuid: this.uuid, data: payload })
        .then((resp) => {
          this.submitted = false;
          this.closeModal();
        })
        .catch((err) => {
          this.error = true;
          this.error_message = err.response.data.message;
          this.submitted = false;
        });
    },
    dismiss() {
      this.closeModal();
    },
  },
};
</script>
