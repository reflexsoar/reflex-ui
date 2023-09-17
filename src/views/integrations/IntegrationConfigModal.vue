<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
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
          </CTab>
          <CTab
            title="Global Settings"
            v-if="
              integration.manifest !== undefined &&
              'configuration' in integration.manifest &&
              Object.keys(integration.manifest.configuration).length > 0
            "
          >
            <h3>Global settings</h3>
            <p>
              Global settings are used by multiple actions for the integration. These
              settings are not action specific.
            </p>

            <CRow v-for="(field, data) in integration.manifest.configuration">
              <CCol v-if="configuration.global_settings !== undefined">
                <CInput
                  v-model="configuration.global_settings[data]"
                  v-if="field.type == 'str'"
                  :label="field.label"
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
                  :label="field.label"
                  :description="field.description"
                  :placeholder="field.default"
                  v-bind:required="field.required"
                />
                <CInput
                  v-model.number="configuration.global_settings[data]"
                  v-if="field.type == 'int'"
                  :label="field.label"
                  :description="field.description"
                  :placeholder="field.default"
                  v-bind:required="field.required"
                />
                <CSelect
                  v-model="configuration.global_settings[data]"
                  v-if="field.type == 'str-select'"
                  :label="field.label"
                  :options="getSelectOptions(field)"
                  :description="field.description"
                  :placeholder="field.default ? field.default : 'Select an option'"
                  v-bind:required="field.required"
                >
                </CSelect>
              </CCol>
            </CRow>
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
              style="max-height: 500px; overflow-x: hidden; overflow-y: auto;"
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
                  <CCol
                    v-if="
                      !field.conditions ||
                      (field.conditions &&
                        field.conditions &&
                        field.conditions.every((c) =>
                          evaluateFieldValue(
                            configuration.actions[action.name][c.field],
                            c.operator,
                            c.value
                          )
                        ))
                    "
                  >
                    <CInput
                      v-model="configuration.actions[action.name][data]"
                      v-if="field.type == 'str'"
                      :label="field.label"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                      :type="isSecret(field)"
                    >
                      <template
                        v-if="field.secret !== undefined && field.secret == true"
                        #append-content
                      >
                        <span
                          style="cursor: pointer"
                          @click="show_secrets = !show_secrets"
                          ><i v-if="show_secrets" class="fas fa-eye-slash"></i
                          ><i v-else class="fas fa-eye"></i
                        ></span>
                      </template>
                    </CInput>
                    <CTextarea
                      v-model="configuration.actions[action.name][data]"
                      v-if="field.type == 'text'"
                      :label="field.label"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <CInput
                      v-model.number="configuration.actions[action.name][data]"
                      v-if="field.type == 'int'"
                      :label="field.label"
                      :description="field.description"
                      :placeholder="field.default"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <CSelect
                      :value.sync="configuration.actions[action.name][data]"
                      v-if="field.type == 'str-select'"
                      :label="field.label"
                      :options="getSelectOptions(field)"
                      :ref="data"
                      :description="field.description"
                      :placeholder="field.default ? field.default : 'Select an option'"
                      v-bind:required="
                        field.required && configuration.actions[action.name].enabled
                      "
                    />
                    <div v-if="field.type == 'bool'">
                      <label>{{ field.label }}</label
                      ><br />
                      <CSwitch
                        :checked.sync="configuration.actions[action.name][data]"
                        label-on="Yes"
                        label-off="No"
                        color="success"
                      /><br />
                      <small>{{ field.description }}</small><br>
                    </div>
                    <div v-if="field.type == 'str-multiple'">
                      <label>{{ field.label }}</label
                      ><br />
                      <multiselect
                        v-model="configuration.actions[action.name][data]"
                        @tag="addMultiOption(action.name, data, $event)"
                        @remove="removeMultiOption(action.name, data, $event)"
                        :options="getSelectOptions(field)"
                        :multiple="true"
                        :close-on-select="false"
                        :placeholder="field.description"
                        :taggable="true"
                        v-if="field.default_options_from === undefined"
                      >
                      </multiselect>
                      <multiselect
                        v-model="configuration.actions[action.name][data]"
                        :options="getSelectOptions(field)"
                        :multiple="true"
                        :close-on-select="false"
                        :placeholder="field.description"
                        label="label"
                        track-by="value"
                        v-else
                      >
                      </multiselect>
                      <small class="text-muted">{{ field.description }}</small
                      ><br /><br />
                    </div>
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
  created() {
    this.$store.dispatch("getCloseReasons", {});
    this.$store.dispatch("getConfiguredOutputs");
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
      close_reasons: [],
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
      if (
        field !== undefined &&
        field.required &&
        this.configuration.actions[field.action].enabled
      ) {
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
    evaluateFieldValue(target, operator, value) {
      if (operator == "eq") {
        return target == value;
      }
      if (operator == "ne") {
        return target != value;
      }
      if (operator == "gt") {
        return target > value;
      }
      if (operator == "lt") {
        return target < value;
      }
      if (operator == "gte") {
        return target >= value;
      }
      if (operator == "lte") {
        return target <= value;
      }
      if (operator == "contains") {
        return target.includes(value);
      }
      if (operator == "startswith") {
        return target.startsWith(value);
      }
      if (operator == "endswith") {
        return target.endsWith(value);
      }
      if (operator == "regex") {
        return target.match(value);
      }
    },
    getSelectOptions(field_config) {
      let values = [];
      if (field_config.default_options_from) {
        let options_field = field_config.default_options_from;
        if (options_field == "intel_list") {
          values = this.$store.getters.intel;
        }
        if (options_field == "close_reasons") {
          values = this.$store.getters.close_reasons.map((reason) => {
            return { label: reason.title, value: reason.uuid };
          });

          return values;
        }
        if (options_field == "integration_outputs") {
          console.log(this.$store.getters.integration_outputs_select);
          return this.$store.getters.integration_outputs_select;
        }
      } else {
        if (field_config.options) {
          values = field_config.options;
        } else {
          values = [];
        }
      }

      return [...new Set(values)];
    },
    addMultiOption(action, field, $event) {
      if (!this.configuration.actions[action][field]) {
        this.$set(this.configuration.actions[action], field, []);
      }
      if (this.configuration.actions[action][field].includes($event)) {
        return;
      } else {
        // If the $event has a value property, use that, otherwise use the $event
        if ($event.value) {
          this.configuration.actions[action][field].push($event.value);
        } else {
          this.configuration.actions[action][field].push($event);
        }
      }
    },
    removeMultiOption(action, field, $event) {
      // Update in a manor that is reactive per Vue using $set
      let tags = this.configuration.actions[action][field];
      tags = tags.filter((tag) => tag != $event);
      this.$set(this.configuration.actions[action], field, tags);
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
