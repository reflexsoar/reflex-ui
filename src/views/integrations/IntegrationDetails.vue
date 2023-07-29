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
                                    :fields="[ 'name', {'key':'actions', label:'Configured Actions'}, 'updated_at', 'created_at', 'updated_by', {key: 'manage', label:''} ]"
                                    :items-per-page="10"
                                    :hover="true"
                                    :bordered="true"
                                    :noItemsView="{ noItems: 'No configurations defined' }"
                                >
                                    <template #updated_at="{item}">
                                    <td>
                                        {{ item.updated_at | moment("from") }}
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
                                    <td>
                                        <CButton color="primary" :to="`${integration.product_identifier}/${item.id}`" size="sm">Edit</CButton>
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
                        /></CCardBody>
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
    <IntegrationConfigModal :show.sync="showConfigModal" :integration="integration" :configuration="configuration"/>
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
        "name",
        "description",
        "source_object_type"
      ],
      showConfigModal: false,
      configuration: {
        name: "",
        description: "",
        actions: {},
        configuration: {},
      },
    };
  },
  methods: {
    newConfiguration() {
      this.configuration = this.build_default_configuration();
      this.showConfigModal = true;

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
