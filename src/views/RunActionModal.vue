<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal title="Run Action" :centered="true" size="lg" :show.sync="modalStatus" 
      :closeOnBackdrop="false">
      <template #header>
        <h5 v-if="mode == 'run'" class="modal-title">Run Action</h5>
        <h5 v-if="mode == 'add_to_eventrule'" class="modal-title">Add to Event Rule</h5>
      </template>
        <CAlert :show.sync="error" color="danger">
            {{ error_message }}
        </CAlert>
      <CSelect
        v-bind:disabled="loading || configured_actions.length == 0"
        :value.sync="selected_action"
        :options="actions_list"
        label="Action to Run"
        :placeholder="'Select Action'"
        @change="selectAction"
      >
        <template #label>
          <label v-if="mode == 'run'">Action to Run</label>
          <label v-if="mode == 'add_to_eventrule'">Action to Add</label>
        </template>
      </CSelect>
      <CRow v-if="action.parameters && !!Object.keys(action.parameters).length">
        <CCol>
          <h3>Parameters</h3>
          <CRow v-for="(field, name) in action.parameters">
            <CCol
            v-if="
                      !field.conditions ||
                      (field.conditions &&
                        field.conditions &&
                        field.conditions.every((c) =>
                          evaluateFieldValue(
                            action_payload.parameters[c.field],
                            c.operator,
                            c.value
                          )
                        ))
                    "
                    >
              <CInput
                v-if="field.type == 'str'"
                v-model="action_payload.parameters[name]"
                :placeholder="field.description"
                :description="field.description"
                :label="field.label"
              />
              <div v-if="field.type == 'str-multiple'">
                <label style="text-transform: capitalize">{{ field.label }}</label
                ><br />
                <multiselect
                  v-model="action_payload.parameters[name]"
                  @tag="addMultiOption(name, $event)"
                  @remove="removeMultiOption(name, $event)"
                  :options="getSelectOptions(field, field.default_options_from)"
                  :multiple="true"
                  :close-on-select="false"
                  :placeholder="field.description"
                  :taggable="true"
                >
                </multiselect>
                <small class="text-muted">{{ field.description }}</small>
              </div>
              <div v-if="field.type == 'bool'">
                <label>{{ field.label }}</label
                ><br />
                <CSwitch
                  :checked.sync="action_payload.parameters[name]"
                  label-on="Yes"
                  label-off="No"
                  color="success"
                /><br />
                <small>{{ field.description }}</small>
              </div>

              <CSelect
                v-if="
                  field.type == 'str-select' &&
                  getSelectOptions(field, field.default_options_from).length != 0
                "
                :options="getSelectOptions(field, field.default_options_from)"
                :value.sync="action_payload.parameters[name]"
                :label="field.label"
                placeholder="Please select one"
                :description="field.description"
              />
            </CCol>
          </CRow>
        </CCol>
      </CRow>
      {{action_payload}}
      {{ mode }}
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton v-if="mode == 'run'" @click="runByMode()" color="primary">Execute</CButton>
        <CButton v-if="mode == 'add_to_eventrule'" @click="runByMode()" color="primary">Add</CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex";
import {v4 as uuidv4} from 'uuid';
export default {
  name: "RunActionModal",
  props: {
    show: Boolean,
    events: {
      type: Array,
      default: () => [],
    },
    events_data: {
      type: Array,
      default: () => [],
    },
    mode: {
      type: String,
      default: "run",
    }
  },
  computed: {
    ...mapState(["settings", "current_user", "configured_actions"]),
    actions_list() {
      return this.configured_actions.map((action) => {
        return {
          label:
            action.friendly_name +
            " - " +
            action.integration_name +
            " - " +
            action.configuration_name,
          value: action.name,
        };
      });
    },
  },
  data() {
    return {
      modalStatus: this.show,
      selected_action: null,
      loading: false,
      action: {
        parameters: {},
      },
      action_payload: {},
      error: false,
      error_message: ""
    };
  },
  watch: {
    show: function () {
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
        this.getActions();
      }
      this.$emit("update:show", this.modalStatus);
      if (!this.modalStatus) {
        this.reset();
      }
    },
  },
  created() {},
  methods: {
    getSelectOptions(field_config, field) {
      let values = [];
      if (field == "intel_list") {
        values = this.$store.getters.intel
      }
      if (this.events_data.length > 0) {
        // Fetch the values of the field from all the events in event_data
        // Return the unique values
        if (field === undefined) {
          return [];
        } else if (field === "observables") {
          for (let i in this.events_data) {
            event = this.events_data[i];
            for (let o in event.observables) {
              let observable = event.observables[o];
              if (observable.data_type === field_config.observable_data_type) {
                values.push(observable.value);
              }
            }
          }
        }
      }
      return [...new Set(values)];
    },
    addMultiOption(name, $event) {
      if (!this.action_payload.parameters[name]) {
        this.$set(this.action_payload.parameters, name, []);
      }
      if (this.action_payload.parameters[name].includes($event)) {
        return;
      } else {
        // If the $event has a value property, use that, otherwise use the $event
        if ($event.value) {
          this.action_payload.parameters[name].push($event.value);
        } else {
            this.action_payload.parameters[name].push($event);
        }
      }
    },
    removeMultiOption(name, $event) {
      // Update in a manor that is reactive per Vue using $set
      let tags = this.action_payload.parameters[name];
      tags = tags.filter((tag) => tag != $event);
      this.$set(this.action_payload.parameters, name, tags);
    },
    getActions() {
      this.loading = true;
      this.$store
        .dispatch("getConfiguredActions", {})
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    selectAction() {
      this.action = this.configured_actions.find(
        (action) => action.name == this.selected_action
      );
      this.action_payload = {
        action: this.action.name,
        configuration_uuid: this.action.configuration_uuid,
        integration_uuid: this.action.integration_uuid,
        events: this.events,
        parameters: {},
      };

      if (this.action.parameters && !!Object.keys(this.action.parameters).length) {
        for (let param in this.action.parameters) {
          let param_config = this.action.parameters[param];

          if (param_config.type == "str-multiple") {
            this.action_payload.parameters[param] = this.$set(
              this.action_payload.parameters,
              param,
              []
            );
          }
          if (param_config.type == "str-select") {
            this.action_payload.parameters[param] = this.$set(
              this.action_payload.parameters,
              param,
              ""
            );
          }
          if (param_config.type == "str") {
            this.$set(this.action_payload.parameters, param, "");
          }
          if (param_config.type == "bool") {
            this.$set(this.action_payload.parameters, param, false);
          }
          if (param_config.type == "integer") {
            this.$set(this.action_payload.parameters, param, 0);
          }
          if (param_config.default) {
            this.$set(this.action_payload.parameters, param, param_config.default);
          }
        }
      }
    },
    runByMode() {
        if (this.mode == "run") {
            this.runAction();
        } else if (this.mode == "add_to_eventrule") {
            this.addToEventRule();
            this.dismiss();
        }
    },
    addToEventRule() {
      // Give the payload a unique ID
      this.action_payload.uuid = uuidv4();
      this.$emit("addToEventRule", this.action_payload);
    },
    runAction() {
      this.$store.dispatch("runAction", this.action_payload).then(() => {
        this.dismiss();
      }).catch((err) => {
        this.error = true;
        this.error_message = err.response.data.message;
      })
    },
    findActions() {
      console.log("FIND ACTIONS");
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
    reset() {
      this.selected_action = "";
      this.selected_plugin = "";
      this.action = {
        parameters: {},
      };
      this.action_payload = {};
      this.actions = [];
      this.error = false;
      this.error_message = "";
    },
    dismiss() {
      this.reset();
      this.modalStatus = false;
    },
  },
};
</script>
