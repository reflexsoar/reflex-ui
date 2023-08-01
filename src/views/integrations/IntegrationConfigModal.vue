<template>
  <div>
    <form id="createIntegrationConfig" @submit.prevent="submitForm">
      <CModal :title="title" size="xl" :show.sync="modalStatus">
        <CAlert v-if="error" :show="error" color="danger" fade>
          {{ error_message }}
        </CAlert>
        <CTabs
          :fade="false"
          variant="pills"
          :activeTab.sync="step"
          :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
        >
          <CTab title="Overview">
            <h3>Basic Settings</h3>
            <CInput
              v-model="configuration.name"
              label="Name"
              placeholder="Enter a name for this configuration"
              required
              description="Providing a name for the configuration allows users to differentiate between configurations that may have the same action"
            />
            <CTextarea
              v-model="configuration.description"
              label="Description"
              placeholder="Enter a description for this configuration"
              description="Providing a description for the configuration allows users to determine in more detail why this configuration exsits"
            />
            <h3>Global settings</h3>
            <p>
              Global settings are used by multiple actions for the integration. These
              settings are not action specific.
            </p>
            <div
              v-if="
                integration.manifest !== undefined &&
                'configuration' in integration.manifest &&
                Object.keys(integration.manifest.configuration).length > 0
              "
            >
              <CRow v-for="(field, data) in integration.manifest.configuration">
                <CCol v-if="configuration.global_settings !== undefined">
                  <CInput
                    v-model="configuration.global_settings[data]"
                    v-if="field.type == 'str'"
                    :label="data"
                    :description="field.description"
                    :placeholder="field.default"
                    v-bind:required="isRequired()"
                    :type="isSecret(field)"
                  >
                    <template
                      v-if="field.secret !== undefined && field.secret == true"
                      #append-content
                    >
                      <span style="cursor: pointer" @click="show_secrets = !show_secrets"
                        ><i v-if="show_secrets" class="fas fa-eye-slash"></i
                        ><i v-else class="fas fa-eye"></i
                      ></span>
                    </template>
                  </CInput>
                  <CTextarea
                    v-model="configuration.global_settings[data]"
                    v-if="field.type == 'text'"
                    :label="data"
                    :description="field.description"
                    :placeholder="field.default"
                    v-bind:required="field.required"
                  />
                  <CInput
                    v-model.number="configuration.global_settings[data]"
                    v-if="field.type == 'int'"
                    :label="data"
                    :description="field.description"
                    :placeholder="field.default"
                    v-bind:required="field.required"
                  />
                  <CSelect
                    v-model="configuration.global_settings[data]"
                    v-if="field.type == 'str-select'"
                    :label="data"
                    :description="field.description"
                    :placeholder="field.default"
                    v-bind:required="field.required"
                  >
                    <option v-for="option in field.options" :value="option">
                      {{ option }}
                    </option>
                  </CSelect>
                </CCol>
              </CRow>
            </div>
            <div v-else>
              <CAlert color="info">
                <b>Note:</b> Integration has no global settings.
              </CAlert>
            </div>
          </CTab>
          <div
            v-if="
              integration.manifest !== undefined &&
              'actions' in integration.manifest &&
              Object.keys(integration.manifest.actions).length > 0
            "
          >
            <CTab
              v-for="(action, i) in integration.manifest.actions"
              :title="action.friendly_name"
            >
              <h3>Configure {{ action.friendly_name }}</h3>
              <vue-markdown>{{ action.description }}</vue-markdown>
              <div v-if="action.name in configuration.actions">
                <label>Enable</label><br />
                <CSwitch
                  :checked.sync="configuration.actions[action.name].enabled"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                /><br />
              </div>
              <div
                v-if="
                  action.name in configuration.actions &&
                  configuration.actions[action.name].enabled
                "
              >
                <span
                  v-if="
                    action.configuration !== undefined &&
                    Object.keys(action.configuration).length > 0
                  "
                  ><br />
                  <h4>Action Specific Settings</h4></span
                >
                <CRow v-for="(field, data) in action.configuration">
                  <CCol>
                    <CInput
                      v-model="configuration.actions[action.name][data]"
                      v-if="field.type == 'str'"
                      :label="data"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <CTextarea
                      v-model="configuration.actions[action.name][data]"
                      v-if="field.type == 'text'"
                      :label="data"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <CInput
                      v-model.number="configuration.actions[action.name][data]"
                      v-if="field.type == 'int'"
                      :label="data"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <CSelect
                      :value.sync="configuration.actions[action.name][data]"
                      v-if="field.type == 'str-select'"
                      :label="data"
                      :options="field.options"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                  </CCol>
                </CRow>
              </div>
            </CTab>
          </div>
          <CTab title="Review">
            <h3>Review</h3>
            {{ configuration }}
          </CTab>
        </CTabs>
        <template #footer>
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
          <CButton
            v-if="mode == 'create' || mode == 'clone'"
            type="submit"
            color="primary"
            :disabled="submitted"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Create</CButton
          >
          <CButton
            v-if="mode == 'edit'"
            type="submit"
            color="primary"
            :disabled="submitted"
            ><span v-if="submitted"><CSpinner size="sm" />&nbsp;</span>Save</CButton
            >
        </template>
      </CModal>
    </form>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "IntegrationConfigModal",
  props: {
    show: Boolean,
    mode: {
      type: String,
      default: () => "create",
    },
    integration: {
      type: Object,
      default: () => null,
    },
    configuration: {
      type: Object,
      default: {
        name: "",
        description: "",
        actions: {},
        configuration: {},
      },
    },
  },
  computed: {
    ...mapState(["current_user"]),
  },
  data() {
    return {
      modalStatus: false,
      loading: false,
      error: false,
      error_message: "",
      test_failed: false,
      submitted: false,
      step: 0,
      title: "Integration Configuration",
      uuid: null,
      show_secrets: false,
    };
  },
  watch: {
    show: function () {
      this.error = false;
      this.error_message = "";
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.title = this.capitalize(this.mode) + " Integration";
        if (this.mode == "edit") {
          // Pop the uuid from the configuration
          this.uuid = this.configuration.uuid;
          delete this.configuration.uuid; // So we don't send it to the server
        }
        this.test_failed = true;
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.dismiss();
      }
    },
  },
  methods: {
    isSecret(field) {
      let field_type = "text";

      if (this.show_secrets) {
        return field_type;
      }

      if (field.secret !== undefined) {
        field_type = field.type;
      }

      if (field.secret == true) {
        field_type = "password";
      }

      return field_type;
    },
    isRequired(field) {
        // Only return true if the field is required and the 
        // action the field belongs to is enabled
        if (field !== undefined && field.required && this.configuration.actions[field.action].enabled) {
            return true;
        }
    },
    createConfiguration() {
      this.submitted = true;
      this.$store
        .dispatch("createIntegrationConfiguration", {
          uuid: this.integration.product_identifier,
          data: this.configuration,
        })
        .then((response) => {
          this.submitted = false;
          this.dismiss();
        })
        .catch((error) => {
          this.error = true;
          this.error_message = error.response.data.message;
          this.step = 0;
          this.submitted = false;
        });
    },
    updateConfiguration() {
        this.submitted = true;
        this.$store
            .dispatch("updateIntegrationConfiguration", {
            uuid: this.integration.product_identifier,
            configuration_uuid: this.uuid,
            data: this.configuration,
            })
            .then((response) => {
            this.submitted = false;
            this.dismiss();
            })
            .catch((error) => {
            this.error = true;
            this.error_message = error.response.data.message;
            this.step = 0;
            this.submitted = false;
            });
        
    },
    submitForm() {
        if (this.mode == "create" || this.mode == "clone") {
            this.createConfiguration();
        } else if (this.mode == "edit") {
            this.updateConfiguration();
        }
        
    },
    toggleSecrets() {
      this.show_secrets = !this.show_secrets;
    },
    dismiss() {
      this.error = false;
      this.error_message = "";
      this.modalStatus = false;
      this.show_secrets = false;
      this.$emit("update:show", this.modalStatus);
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
};
</script>
