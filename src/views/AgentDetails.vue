<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CRow v-if="loading">
      <CCol col>
        <div style="margin: auto; text-align: center; verticle-align: middle">
          <CSpinner color="dark" style="width: 6rem; height: 6rem" />
        </div>
      </CCol>
    </CRow>
    <CRow v-if="!loading"  class="page-heading">
      <CCol>
        <h1>{{ agent.name }}</h1>
      </CCol>
      <CCol>
        <span v-if="propertyExistsAndNotNull(agent.host_information, 'system')">
          <ObjectAttribute 
            label="Operating System"
            :value="agent.host_information.system.os_name"
          />
        </span>
      </CCol>
      <CCol>
        
          <ObjectAttribute
            label="Last Boot"
            :value="agent.host_information.last_reboot | moment('LLLL')"
          />
          </CCol>
      <CCol>
        <ObjectAttribute
          label="Last Logged On User"
          :value="last_logged_on_user(agent.host_information.users)"
        />
      </CCol>
    </CRow>
    <CTabs
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
        v-if="!loading"
      >
        <CTab title="Configuration">
        <CCard class="shadow-sm bg-white rounded">
          <CCardHeader>
            <CRow>
              <CCol
                col="12"
                lg="11"
                sm="12"
                class="text-left"
                @mouseover="name_hover = true"
                @mouseleave="name_hover = false"
              >
                <h1>
                  <span v-if="!name_edit">
                    {{ agent.name }}&nbsp;<a
                      v-if="name_hover"
                      @click="name_edit = !name_edit"
                      ><CIcon name="cilPencil" size="sm"
                    /></a>
                  </span>
                  <span v-if="name_edit">
                    <CInput v-model="agent.name" size="lg">
                      <template #append>
                        <CButton
                          color="danger"
                          @click="name_edit = !name_edit"
                          size="sm"
                          class="no-shadow"
                          ><CIcon name="cilXCircle"
                        /></CButton>
                        <CButton
                          color="primary"
                          @click="updateAgentName()"
                          class="no-shadow"
                          size="sm"
                          ><CIcon name="cilSave"
                        /></CButton>
                      </template>
                    </CInput>
                  </span>
                </h1>
              </CCol>
              <CCol col="12" lg="1" sm="12" class="text-right">
                <!--<h1><CSwitch color="success" size="lg" label-on="On" label-off="Off" :checked.sync="agent.active" v-c-tooltip="'Agent Status'" v-on:change.native="toggleAgentActive()"/></h1>-->
              </CCol>
            </CRow>
            <CRow>
              <CCol col="12" lg="6" sm="12">
                {{ agent.description }}
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                <h3>Inputs</h3>
                Inputs selected here will be polled by the agent at the period defined in
                the input configuration.<br /><br />
                <multiselect
                  @search-change="searchInputs"
                  v-model="selected"
                  placeholder="Select inputs to be used by this agent"
                  track-by="uuid"
                  label="name"
                  :options="input_list"
                  :multiple="true"
                  @input="updateInputs()"
                >
                </multiselect>
              </CCol>
              <CCol>
                <h3>Groups</h3>
                Groups selected here can be targeted by plugins to run plugins on select
                agents.<br /><br />
                <multiselect
                  v-model="selected_groups"
                  placeholder="Select the groups this agent belongs to"
                  track-by="name "
                  label="name"
                  :options="group_list"
                  :multiple="true"
                  @input="updateGroups()"
                >
                </multiselect>
              </CCol>
            </CRow>
            <CRow>
              <CCol
                ><br />
                <h3>Roles</h3>
                Roles tell the agent what actions to participate in. Detectors can run
                detection rules, Runners run playbook actions and individual response
                actions, Pollers query inputs.<br /><br />
                <multiselect
                  v-model="agent.roles"
                  placeholder="Select the groups this agent belongs to"
                  :options="roles"
                  :multiple="true"
                  @input="updateRoles()"
                >
                </multiselect>
              </CCol>
            </CRow>
          </CCardBody>
          <CCardFooter>
            <CRow>
              <CCol col="6">
                <label>Last Heartbeat: </label>&nbsp;{{
                  agent.last_heartbeat | moment("LLLL")
                }}
              </CCol>
              <CCol col="6" class="text-right">
                <CButton color="danger" @click="delete_modal = true"
                  ><CIcon name="cil-trash"
                /></CButton>
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>
        </CTab>
        <CTab title="Services" v-if="propertyExistsAndNotNull(agent.host_information, 'services')">
          <CCard>
            <CDataTable
              :items="agent.host_information.services"
              :fields="service_columns"
              :responsive="false"
              :items-per-page="25"
              :sorter="{ external: false, resetable: true }"
              column-filter
              pagination
              >
                <template #name="{item}">
                  <td>
                    <b>{{ item.display_name}} ({{ item.name }})</b><br>
                    <small class="text-muted">{{ item.description }}</small>
                  </td>
                </template>
                <template #status="{item}">
                  <td>
                    <CBadge v-if="item.status == 'running'" color="success" class="tag">running</CBadge>
                    <CBadge v-if="item.status == 'stopped'" color="danger" class="tag">stopped</CBadge>
                    <CBadge v-if="item.status == 'paused'" color="warning" class="tag">paused</CBadge>
                    </td>
                </template>
                <template #start_type="{item}">
                  <td>
                    <CBadge color="secondary" class="tag">{{ item.start_type }}</CBadge>
                    </td>
                </template>
              </CDataTable>
          </CCard>
        </CTab>
        <CTab title="Installed Software" v-if="propertyExistsAndNotNull(agent.host_information, 'installed_software')">
          <CRow>
            <CCol>
              <h3 class="page-sub-header">Installed Software</h3>
            </CCol>
            <CCol col=3>
              <MultiPicker
                label="Vendor"
                          :options="vendors"
                          :value.sync="selected_vendors"
                          option_key="value"
                          option_label="label"
                        />
            </CCol>
          </CRow>
          <CCard>
            <CDataTable
              :items="filtered_software"
              :fields="software_columns"
              :responsive="false"
              :items-per-page="25"
              :sorter="{ external: false, resetable: true }"
              column-filter
              pagination
            >
            <template #name="{item}">
              <td>
                <b>{{ item.name }}</b>
                <br>
                <small class="text-muted"><b>Install Date:</b> {{ formattedInstallDate(item.install_date )}}</small>
              </td>
              </template>
            </CDataTable>
          </CCard>
        </CTab>
        <CTab title="Listening Ports" v-if="propertyExistsAndNotNull(agent.host_information, 'listening_ports')">
          <CRow>
            <CCol>
              <CCard>
                <CDataTable
                  :items="agent.host_information.listening_ports"
                  :fields="listening_port_fields"
                  :responsive="false"
                  :items-per-page="25"
                  :sorter="{ external: false, resetable: true }"
                  table-filter
                  pagination

                >
                <template #parent_process_name="{item}">
                  <td>
                    <span>{{ item.parent_process_name }}</span>
                    <br>
                    <span class="text-muted"><CBadge color="secondary " class="tag tag-sm">Path</CBadge>&nbsp;<small>{{ item.parent_process_path }}</small></span><br>
                    <span class="text-muted"><CBadge color="secondary " class="tag tag-sm">User</CBadge>&nbsp;<small>{{ item.parent_process_user }}</small></span>
                  </td>
                </template>
                <template #process_name="{item}">
                  <td>
                    <span>{{ item.process_name }}</span><br>
                    <span class="text-muted"><CBadge color="secondary " class="tag tag-sm">Path</CBadge>&nbsp;<small>{{ item.process_path }}</small></span><br>
                    <span class="text-muted"><CBadge color="secondary " class="tag tag-sm">User</CBadge>&nbsp;<small>{{ item.process_user }}</small></span>
                  </td>
                </template>

                </CDataTable>
              </CCard>
              </CCol>
              </CRow>
        </CTab>
        <CTab title="Advanced View">
          <h3 class="page-sub-heading">JSON View</h3>
          <CCard>
            <CCardBody style="overflow: auto; max-height: 600px">
              <pre>{{ agent.host_information }}</pre>
            </CCardBody>
          </CCard>
        </CTab>
    </CTabs>
    <CRow v-if="!loading">
      <CCol>
        <CAlert :show.sync="alert" color="success" closeButton>
          {{ alert_message }}
        </CAlert>
        
        <CModal
          title="Delete Agent"
          :closeOnBackdrop="false"
          color="danger"
          :centered="true"
          :show.sync="delete_modal"
        >
          <CForm id="deleteForm" @submit.prevent="deleteAgent()">
            Are you sure you want to delete the agent <b>{{ agent.name }}</b
            >?
            <CForm id="delete-agent-confirm">
              <CInput
                v-model="delete_confirm"
                label="Agent Name"
                v-bind:description="delete_error"
                required
              ></CInput>
            </CForm>
          </CForm>
          <template #footer>
            <CButton @click="dismiss()" color="secondary">No</CButton>
            <CButton type="submit" form="deleteForm" color="danger">Yes</CButton>
          </template>
        </CModal>
      </CCol>
    </CRow>
  </div>
</template>

<style scoped>
.path {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}

.path:hover {
  display: block;
}
</style>

<script>
import { mapState } from "vuex";
import { vSelect } from "vue-select";
import ObjectAttribute from './components/ObjectAttribute.vue'
import MultiPicker from './components/MultiPicker.vue'
export default {
  name: "InputDetails",
  components: {
    ObjectAttribute,
    MultiPicker
  },
  computed: {
    ...mapState(["input_list"]),
    vendors: function() {
      if(this.propertyExistsAndNotNull(this.agent.host_information, 'installed_software')) {
        let vendors = this.agent.host_information.installed_software.map(function(item) {
          if (item.vendor === null) { return 'Unknown' } else {
            return item.vendor
          }
        })

        vendors =  [... new Set(vendors)]
        // Deduplicate
        return vendors.map(function(item) {
          return {label: item, value: item}
        })
      }
      return []
    },
    filtered_software: function() {
      if(this.propertyExistsAndNotNull(this.agent.host_information, 'installed_software')) {
        let software_list = []
        for (const item in this.agent.host_information.installed_software) {
          let software = this.agent.host_information.installed_software[item]
          if (this.selected_vendors.length > 0) {
            if (this.selected_vendors.includes(software.vendor)) {
              software_list.push(software)
            }
          } else {
            software_list.push(software)
          }
        }
        return software_list
      }
      return []
      
    }
  },
  data() {
    return {
      uuid: this.$route.params.uuid,
      agent: {},
      //input_list: [],
      group_list: [],
      selected: [],
      selected_groups: [],
      roles: ["detector", "poller", "runner", "mitre", "fim"],
      listening_port_fields: [
        'port',
        'pid',
        'process_name',
        'parent_pid',
        'parent_process_name'
      ],
      service_columns: ['name',  {key: 'binpath', label: 'Path', _style: "width: 10%"}, 'status', 'start_type'],
      software_columns: ['name', 'version', 'vendor', 'install_source'],
      selected_vendors: [],
      selected_roles: [],
      loading: true,
      cardCollapse: true,
      collapse: {},
      toggleCollapse: true,
      alert: false,
      alert_message: "",
      animate: true,
      name_hover: false,
      name_edit: false,
      delete_modal: false,
      delete_confirm: "",
      delete_error: "",
      current_tags: [],
    };
  },
  created() {
    this.$store.dispatch("getInputList", {});
    this.$store.dispatch("getAgentGroups", {}).then((resp) => {
      this.group_list = this.$store.getters.agent_groups;
    });
    this.$store.dispatch("getAgent", {uuid: this.$route.params.uuid, include_host_info: true}).then((resp) => {
      this.agent = resp.data;
      this.selectedInputs();
      this.selectedGroups();
      this.loading = false;
    });
  },
  methods: {
    last_logged_on_user(users) {
      /* Get the user with the most recent start_time */
      if (users) {
        let last_user = users[0];
        for (const user in users) {
          if (users[user].start_time > last_user.start_time) {
            last_user = users[user];
          }
        }
        return last_user.username;
      }
    },
    formattedInstallDate(install_date) {
      /* Takes a date in YYYYMMDD format and returns a formatted date string */
      if (install_date) {
        return install_date.substring(0, 4) + "-" + install_date.substring(4, 6) + "-" + install_date.substring(6, 8)
      }
    },
    unquotedSearchPath(path) {
      if (path.includes(' ') && !path.startsWith('"')) {
        return true
      }
      return false
    },
    propertyExistsAndNotNull(obj, key) {
      return obj.hasOwnProperty(key) && obj[key] !== null;
    },
    toggleAgentActive() {
      this.$store
        .dispatch("updateAgent", { uuid: this.uuid, data: { active: this.agent.active } })
        .then((resp) => {
          this.agent = this.$store.getters.agent;
        });
    },
    expandAll() {
      for (const c in this.collapse) {
        if (!this.collapse[c]) {
          this.collapse[c] = true;
        }
      }

      this.toggleCollapse = false;
    },
    collapseAll() {
      for (const c in this.collapse) {
        if (this.collapse[c]) {
          this.collapse[c] = false;
        }
      }
      this.toggleCollapse = true;
    },
    addInput(input) {
      this.inputs.push(input);
      this.input_list.push(t);
      this.selected.push(t);
    },
    selectedInputs() {
      for (const i in this.agent.inputs) {
        let input = this.agent.inputs[i];
        this.selected.push({ uuid: input.uuid, name: input.name });
      }
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.agent.organization,
        name: name,
      });
    },

    selectedGroups() {
      for (const i in this.agent.groups) {
        let group = this.agent.groups[i];
        this.selected_groups.push({ uuid: group.uuid, name: group.name });
      }
    },
    updateInputs(event) {
      this.alert = 5;
      this.alert_message = "Successfully updated the agents inputs.";
      let uuid = this.uuid;
      let inputs = { inputs: [] };
      for (const inp in this.selected) {
        inputs["inputs"].push(this.selected[inp].uuid);
      }
      this.$store.dispatch("setAgentInputs", { uuid, inputs });
    },
    updateGroups(event) {
      this.alert = 5;
      this.alert_message = "Successfully updated the agents groups.";
      let groups = { groups: [] };
      for (const grp in this.selected_groups) {
        groups["groups"].push(this.selected_groups[grp].uuid);
      }
      let uuid = this.uuid;
      this.$store.dispatch("setAgentGroups", { uuid, groups });
    },
    updateRoles() {
      let uuid = this.uuid;
      let data = {
        roles: this.agent.roles,
      };
      this.$store.dispatch("updateAgent", { uuid, data }).then((resp) => {
        this.agent = this.$store.getters.agent;
      });
    },
    updateAgentName() {
      let uuid = this.uuid;
      let data = {
        name: this.agent.name,
      };
      this.$store.dispatch("updateAgent", { uuid, data }).then((resp) => {
        this.agent = this.$store.getters.agent;
      });
      this.name_edit = false;
    },
    deleteAgent() {
      if (this.delete_confirm == this.agent.name) {
        this.$store.dispatch("deleteAgent", this.uuid).then((resp) => {
          this.$router.push({ path: "/agents" });
        });
      } else {
        this.delete_error = "Error: Entered name does not match agent name.";
      }
    },
    dismiss() {
      this.delete_error = "";
      this.delete_confirm = "";
      this.delete_modal = false;
    },
  },
  filters: {
    firstTwo: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.substring(0, 2);
    },
    capitalize: function (value) {
      if (!value) return "";
      value = value.toString();
      return value.toUpperCase();
    },
  },
};
</script>
