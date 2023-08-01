<template>
  <CRow>
    <CCol v-if="loading">
      <CSpinner color="primary" />
    </CCol>
    <CCol v-else>
      <CRow>
        <CCol col=2>
            <CCard>
            <CCardBody class="text-center" style="height: 125px; line-height: 80px;">
                <img :src="integration.logo" :alt="integration.name" width="100%" />
            </CCardBody>
            </CCard>
        </CCol>
        <CCol>
          <h2>{{ integration.name }}</h2>
          <TagList :tags="integration.category" />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
            <CTabs variant="pills"><br>
                <CTab title="Overview">
                    <CCard>
                        <CCardBody>
                          <CRow>
                            <CCol col=8>
                              <p><vue-markdown>{{ integration.description }}</vue-markdown></p>
                            </CCol>
                            <CCol>
                              <table style="border: 0px">
            <tr>
              <td class="text-right"  style="padding: 5px;"><b>Author:</b></td>
              <td style="padding: 5px;"><CBadge class="tag tag-list" color="dark">{{ integration.author }}</CBadge></td>
            </tr>
            <tr>
              <td class="text-right"  style="padding: 5px;"><b>Contributors:</b></td>
              <td  style="padding: 5px;"><TagList :tagIcon="false" :tags="integration.contributor" /></td>
            </tr>
            <tr>
              <td class="text-right"  style="padding: 5px;"><b>License:</b></td>
              <td  style="padding: 5px;"><CBadge class="tag tag-list" color="dark">{{ integration.license_name }}</CBadge></td>
            </tr>
            <tr>
              <td class="text-right"  style="padding: 5px;"><b>Version:</b></td>
              <td  style="padding: 5px;"><CBadge class="tag tag-list" color="dark">{{ integration.version }}</CBadge></td>
            </tr>
          </table>
          </CCol>
        </CRow>
                        </CCardBody>
                    </CCard>
                </CTab>
                <CTab title="Configurations">
                    
                    <CCard>
                        <CCardHeader>
                            <CButton color="primary" @click="newConfiguration()">New Configuration</CButton>
                        </CCardHeader>
                        <CCardBody>
                            <h3>Configurations</h3>
                            <div v-if="configurations_loading">
                                <CSpinner color="primary" />
                            </div>
                            <div v-else>
                                <CDataTable
                                    :items="integration_configs"
                                    :fields="[ 'name', 'enabled', {'key':'actions', label:'Configured Actions'}, 'updated_at', 'created_at', 'updated_by', {key: 'manage', label:''} ]"
                                    :items-per-page="10"
                                    :hover="true"
                                    :bordered="true"
                                    :noItemsView="{ noItems: 'No configurations defined' }"
                                    :responsive="false"
                                >
                                    <template #name="{item}">
                                      <td>
                                        {{ item.name }}<br>
                                        <small class="text-muted">{{ item.uuid }}</small>
                                        </td>
                                      </template>
                                    <template #updated_at="{item}">
                                    <td>
                                        {{ item.updated_at | moment("from") }}
                                        </td>
                                    </template>
                                    <template #enabled="{item}">
                                      <td>
                                        <CBadge class="tag tag-list" :color="item.enabled ? 'success' : 'danger'">{{ item.enabled ? 'Enabled' : 'Disabled' }}</CBadge>
                                        </td>
                                    </template>
                                    <template #created_at="{item}">
                                    <td>
                                        {{ item.created_at | moment("from") }}
                                        </td>
                                    </template>
                                    <template #updated_by="{item}">
                                    <td>
                                        {{ item.updated_by.username }}
                                        </td>
                                    </template>
                                    <template #actions="{item}">
                                    <td>
                                        <TagList :tagIcon="false" :tags="configuredActionNames(item.actions)" />
                                        </td>
                                    </template>
                                    <template #manage="{item}">
                                    <td class="text-right">
                                      <CDropdown color="secondary" toggler-text="Manage" size="sm">
                                        <CDropdownItem v-if="item.enabled == false || item.enabled === undefined" @click="activateConfiguration(item)" size="sm"><CIcon name="cil-check"/>&nbsp;Activate</CDropdownItem>
                                        <CDropdownItem v-if="item.enabled == true" @click="deactivateConfiguration(item)" size="sm"><CIcon name="cil-ban"/>&nbsp;Deactivate</CDropdownItem>
                                        <CDropdownItem @click="editConfiguration(item)" size="sm"><CIcon name="cil-pencil"/>&nbsp;Edit</CDropdownItem>
                                        <CDropdownItem @click="cloneConfiguration(item)" size="sm"><CIcon name="cil-copy"/>&nbsp;Copy</CDropdownItem>
                                        <CDropdownItem color="danger" v-bind:disabled="item.enabled" @click="deleteConfigurationWarning(item.uuid)" size="sm"><CIcon name="cil-trash"/>&nbsp; Delete</CDropdownItem>
                                      </CDropdown>
                                        </td>
                                    </template>
                                </CDataTable>
                                </div>
                        </CCardBody>
                    </CCard>
                </CTab>
                <CTab title="Documentation">
                    <CCard><CCardBody>
                    <h3>Global Parameters</h3>
                    <p>
                        <ul>
                        <li v-for="item, key in integration.manifest.configuration">
                            <code>{{key}}</code> - {{item.description}}
                        </li>
                        </ul>
                    </p>
                    <h3>Supported Actions</h3>
                        <CDataTable
                            :items="integration.manifest.actions"
                            :fields="action_fields"
                            :items-per-page="10"
                            :hover="true"
                            :bordered="true"
                        >
                        <template #type="{item}">
                          <td style="text-transform: capitalize">
                            <CBadge class="tag" color="dark">{{ item.type ? item.type : 'unknown' }}</CBadge>
                          </td>
                        </template>
                        <template #description="{item}">
                          <td>
                           <vue-markdown>{{item.description}}</vue-markdown><span v-if="item.configuration"><br><i><b>Note</b>: Requires specific action configuration when setting up for the first time.</i></span>
                          </td>
                        </template>
                      </CDataTable></CCardBody>
                    </CCard>
                </CTab>
                <CTab title="Manifest">
                    <CCard>
                        <CCardBody> <h3>Manifest File</h3>
                        <p>The manifest file defines exactly what this integration expects from a configuration perspective</p>
                            <code><pre>{{ integration.manifest }}</pre></code>
                        </CCardBody>
                    </CCard>
                </CTab>
            </CTabs>
        </CCol>
      </CRow>
    </CCol>
    <IntegrationConfigModal :show.sync="showConfigModal" :integration="integration" :configuration="configuration" :mode="modal_mode"/>
    <!-- Delete warning modal -->
    <CModal
      color="danger"
      :show.sync="show_delete_confirmation"
      title="Delete Configuration - Warning">
        <CAlert :show.sync="delete_error" color="danger">{{ delete_error_message }}</CAlert>
    
        <p>Are you sure you want to delete this configuration?  Deleting an active configuration
        may result in resources leveraging these configuration to fail.</p>

        <p>To confirm, type the name of the configuration <b>{{ delete_target.name }}</b> below:</p>
        <CInput v-model="delete_confirmation" placeholder="Configuration Name" />
      <template #footer>
        <CButton color="danger" @click="deleteConfigurationConfirmed()">Yes</CButton>
        <CButton color="secondary" @click="dismissDeleteConfirmation()">No</CButton>
      </template>
    </CModal>
  </CRow>
</template>

<script>
import { mapState } from "vuex";
import IntegrationConfigModal from "./IntegrationConfigModal";
import TagList from "../components/TagList.vue";

export default {
  name: "IntegrationDetails",
  components: {
    IntegrationConfigModal,
    TagList
  },
  created() {
    this.uuid = this.$route.params.uuid;
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
    this.getIntegration();
    this.getIntegrationConfigurations();
    this.showConfigModal = false;
  },
  computed: {
    ...mapState(["current_user", "integration", "integration_configs"]),
  },
  data() {
    return {
      uuid: null,
      loading: false,
      configurations_loading: false,
      action_fields: [
        {key: "friendly_name", label: "Action Name"},
        {key: "description", label: "Description", _style: "width: 70%"},
        {key: "type", label: "Action Type", _style: "width: 10%"}
      ],
      showConfigModal: false,
      modal_mode: "create",
      configuration: {
        name: "",
        description: "",
        actions: {},
        configuration: {},
      },
      delete_target: {
        name: ""
      },
      delete_confirmation: '',
      show_delete_confirmation: false,
      delete_error: false,
      delete_error_message: ""
    };
  },
  methods: {
    newConfiguration() {
      this.configuration = this.build_default_configuration();
      this.modal_mode = "create";
      this.showConfigModal = true;
    },
    editConfiguration(configuration) {
      this.configuration = this.build_configuration_for_edit(configuration);
      this.modal_mode = "edit";
      this.showConfigModal = true;
    },
    cloneConfiguration(configuration) {
      this.configuration = this.build_configuration_for_edit(configuration);
      this.configuration.name = this.configuration.name + " (copy)";
      this.modal_mode = "clone";
      this.showConfigModal = true;
    },
    deleteConfigurationWarning(uuid) {
      this.delete_target = this.integration_configs.find((config) => {
        return config.uuid == uuid;
      });
      this.delete_confirmation = '';
      this.show_delete_confirmation = true;
    },
    deleteConfigurationConfirmed() {
      if(this.delete_confirmation == this.delete_target.name) {
        this.$store.dispatch("deleteIntegrationConfiguration", {
          uuid: this.integration.product_identifier,
          configuration_uuid: this.delete_target.uuid
        }).then(() => {
          this.dismissDeleteConfirmation();
        }).catch((error) => {
          this.delete_error = true;
          this.delete_error_message = error;
        });
        
      } else {
        this.delete_error = true;
        this.delete_error_message = "The configuration name you entered does not match the configuration name you are trying to delete.";
        return;
      }
    },
    dismissDeleteConfirmation() {
      this.show_delete_confirmation = false;
      this.delete_error = false;
      this.delete_error_message = "";
      this.delete_target = {
        name: ""
      };
      this.delete_confirmation = '';
    },
    deactivateConfiguration(configuration) {
      this.$store.dispatch("disableIntegrationConfiguration", {
        uuid: this.integration.product_identifier,
        configuration_uuid: configuration.uuid
      });
    },
    activateConfiguration(configuration) {
      this.$store.dispatch("enableIntegrationConfiguration", {
        uuid: this.integration.product_identifier,
        configuration_uuid: configuration.uuid
      });
    },
    build_configuration_for_edit(config) {
      let configuration = this.build_default_configuration();
      configuration.name = config.name;
      configuration.description = config.description;
      configuration.uuid = config.uuid;
      
      // Replace all the actions with the ones from the config
      for (let action of this.integration.manifest.actions) {
        if(config.actions[action.name]) {
          configuration.actions[action.name] = config.actions[action.name]
        }
      }

      // Replace all the global_settings
      for (let field in this.integration.manifest.configuration) {
        if(config.global_settings[field]) {
          configuration.global_settings[field] = config.global_settings[field]
        }
      }
      
      // Return a cloned version of the config
      return JSON.parse(JSON.stringify(configuration))
    },
    build_default_configuration() {
        let configuration = {
            actions: {},
            global_settings: {}
        }
        for (let action of this.integration.manifest.actions) {
            configuration.actions[action.name] = {
                enabled: false
            }
            for (let field in action.configuration) {
                if(action.configuration[field].default == null && action.configuration[field].required) {
                    if(action.configuration[field].type == "str") {
                        action.configuration[field].default = ""
                    } else if(action.configuration[field].type == "bool") {
                        action.configuration[field].default = false
                    } else if(action.configuration[field].type == "int") {
                        action.configuration[field].default = 0
                    }
                }

                if(action.configuration[field].default) {
                    configuration.actions[action.name][field] = action.configuration[field].default
                }
                
            }
        }
        return configuration
    },
    configuredActionNames(actions) {
        // Return all the properties of the actions object
        let configured_actions = [];
        // If the action is enabled add its name to the list
        for (const [key, value] of Object.entries(actions)) {
            if (value.enabled) {
                configured_actions.push(key);
            }
        }
        return configured_actions;
    },
    getIntegrationConfigurations() {
        this.configurations_loading = true;
        this.$store
          .dispatch("getIntegrationConfigurations", this.uuid)
          .then(() => {
            this.configurations_loading = false;
          })
          .catch(() => {
            this.configurations_loading = false;
          });
      },
    getIntegration() {
      this.loading = true;
      this.$store
        .dispatch("getIntegration", this.uuid)
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>
