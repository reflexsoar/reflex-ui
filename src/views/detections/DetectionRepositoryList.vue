<template>
  <div>
    <CRow>
      <CCol>
        <h2 class="page-sub-header">Detection Repositories</h2>
      </CCol>
      <CCol class="text-right">
        <CButton v-if="current_user.permissions['create_detection_repository']" color="primary" @click="createRepositoryModal()">New Repository</CButton>
      </CCol>
    </CRow>
    <CCard>
    <CDataTable
      :items="detection_repositories"
      :fields="fields"
      :items-per-page="10"
      :sorter="{ external: false, resetable: true }"
      :loading="loading"
      column-filter
      pagination
      :responsive="false"
    >
      <template #select-filter="{ item }">
        <input
          type="checkbox"
          :checked="selected_items.length > 0"
          @click="selectAll()"
          style="margin-left: 7px"
        />
      </template>
      <template #select="{ item }">
        <td>
          <input
            type="checkbox"
            :checked="item_is_selected(item.uuid)"
            @click="select_item(item.uuid)"
          />
        </td>
      </template>
      <template #actions="{ item }">
        <td style="min-width: 25px" class="text-right">
          <CDropdown color="dark" toggler-text="Manage" size="sm">
            <template #toggler v-if="synchronizing">
              <CButton color="dark" size="sm" v-bind:disabled="synchronizing">
               <CSpinner size="sm"/>
              </CButton>
            </template>
            <CDropdownItem v-if="!item.read_only && current_user.permissions['update_detection_repository']" color="info" @click="editRepository(item.uuid)" size="sm"
              ><CIcon name="cilPencil" />&nbsp;Edit Repository
            </CDropdownItem>
            <CDropdownItem v-if="!item.read_only  && current_user.permissions['delete_detection_repository']" color="danger" @click="deleteRepository(item.uuid)" size="sm"
              ><CIcon name="cilTrash" />&nbsp;Delete Repository
            </CDropdownItem>
            <CDropdownItem v-if="!item.subscribed && item.organization != current_user.organization" @click="startSubscriptionWizard(item.uuid)" size="sm">
                <CIcon name="cilPlus" />&nbsp;Subscribe to Repository
            </CDropdownItem>
            <CDropdownItem v-if="item.subscribed && item.organization != current_user.organization" @click="startUnsubscripeProcess(item.uuid)" size="sm">
                <CIcon name="cilMinus" />&nbsp;Unsubscribe from Repository
            </CDropdownItem>
            <CDropdownItem v-if="item.subscribed && item.organization != current_user.organization" @click="startEditSubscription(item.uuid)" size="sm">
                <CIcon name="cilPencil" />&nbsp;Edit Subscription
            </CDropdownItem>
            <CDropdownItem v-if="item.subscribed && item.organization != current_user.organization" @click="forceSync(item.uuid)" size="sm">
                <CIcon name="cilSync" />&nbsp;Synchronize Now
            </CDropdownItem>
            <CDropdownItem v-if="current_user.permissions['sync_local_subscribers']" @click="syncLocalSubscribers(item.uuid)" size="sm">
                <CIcon name="cilSync" />&nbsp;Synchronize Local Subscribers
            </CDropdownItem>
          </CDropdown>
        </td>
      </template>
      <template #name="{ item }">
        <td>
          <CRow>
            <CCol>
              <span class="item-name">{{ item.name }}</span>
            </CCol>
          
          <CCol col=2>
            <div style="display: inline-block; padding-right:2px;">
              <TagBucket v-if="item.tags && item.tags.length > 0" :tags="item.tags" />
            </div>
            <div style="display: inline-block">
              <TagBucket v-if="item.detections && item.detections.length > 0" :tags="item.detections" :countOnly="true" iconName="cil-shield-alt"/>
            </div>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <div v-if="item.subscription && item.subscription.uuid != undefined">
                <ul class="repository-sync-status-list">
                  <li><label>Synchronizing:&nbsp;</label> 
                    <CBadge class="tag tag-sm" color="info" v-if="item.subscription.synchronizing">Yes</CBadge>
                    <CBadge class="tag tag-sm" color="success" v-else>No</CBadge>
                  </li>
                  <li><label>Last Sync:&nbsp;</label> <CBadge color="secondary" class="tag tag-sm">{{ item.subscription.last_sync | moment("from","now") }}</CBadge></li>
                  <li><label>Last Sync Status:&nbsp;</label> 
                      <CBadge v-if="item.subscription.last_sync_status == 'success'" color="success" class="tag tag-sm">Success</CBadge>
                      <CBadge v-else-if="item.subscription.last_sync_status == 'running'" color="info" class="tag tag-sm">Running</CBadge>
                      <CBadge v-else-if="item.subscription.last_sync_status == 'pending'" color="info" class="tag tag-sm">Pending</CBadge>
                      <CBadge v-else-if="item.subscription.last_sync_status == 'failed'" color="danger" class="tag tag-sm">Failed</CBadge>
                      </li>
                </ul>
              </div>
          </CCol>
          </CRow>
          <CRow>
            <CCol>
              <p>{{ item.description }}</p>
            </CCol>
          </CRow>
        </td>
      </template>
      <template #subscribed="{ item }">
        <td>
          <center>
            <CBadge color="info" class="tag" size="sm" v-if="item.subscribed">Subscribed</CBadge>
            <CBadge color="info" class="tag" size="sm" v-else>Not Subscribed</CBadge>
          </center>
        </td>
      </template>
      <template #repo_type="{ item }">
        <td>
          <center><CBadge color="info" class="tag" size="sm">{{ item.repo_type }}</CBadge></center>
        </td>
      </template>
      <template #share_type="{ item }">
        <td>
          <center><CBadge color="info" class="tag" size="sm">{{ item.share_type }}</CBadge></center>
        </td>
      </template>
      <template #tags="{ item }">
        <td>
          <li
            style="display: inline; margin-right: 2px"
            v-for="tag in item.tags"
            :key="tag"
          >
            <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
          </li>
        </td>
      </template>
    </CDataTable>
    </CCard>
    <CModal :title="`${modal_mode} Repository Subscription`" :show.sync="show_subscription_modal" size="lg" :close-on-backdrop="false" @close="resetSubscriptionWizard()">
        <p>Subscribing to a repository will automatically synchronize all detections from the target repository in to your own detection library.
            Based on an interval defined in this wizard, the system will automatically synchronize any new or updated detections from the target repository.
            The synchronization process will only update fields based on the synchronization settings below.  The process will not overwrite exclusions.
        </p>
        <CInput v-model.number="subscription.sync_interval" label="Synchronization Interval (minutes)" description="How oftern to synchronize rules from this repository" />
        
        <label for="input">Default Input</label><br />
        <multiselect
          id="input"
          @search-change="searchInputs"
          v-model="subscription.default_input"
          placeholder="Select the input to be used for this detection"
          track-by="uuid"
          label="name"
          :options="input_list"
        />
        <small class="text-muted">The default input will be assigned to all detections synchronized from this repository on initial sync.  This can be changed on detection rule setup.</small><br>
        <br>
        <label for="field_template">Field Templates</label><br />
        <multiselect
          v-model="subscription.default_field_template"
          :options="field_templates_multiselect_options"
          :multiple="true"
          :close-on-select="false"
          track-by="uuid"
          label="name"
          :searchable="true"
        />
        <small class="text-muted">Field templates will be assigned to all detections synchronized from this repository on initial sync.  This can be changed on detection rule setup.</small><br>
        <br>
        <h2>Synchronization Settings</h2>
        <p>These settings will determine how the system will handle conflicts between your local rules and the rules from the target repository.
          If a setting is On, any time the repository synchronizes local changes to the rule will be overwritten.</p>
        <CRow>
        <CCol>
            <label>Risk Score</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.risk_score" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Severity</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.severity" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Run Interval</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.interval" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Lookbehind</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.lookbehind" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Mute Period</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.mute_period" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
        </CRow><br>
        <CRow><CCol>
            <label>Threshold</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.threshold_config" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Field Mismatch</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.field_mismatch_config" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>New Terms</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.new_terms_config" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Signature Fields</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.signature_fields" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Field Templates</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.field_templates" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
        </CRow><br>
        <CRow>
        <CCol>
            <label>Observable Fields</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.observable_fields" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Triage Guide</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.guide" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Setup Guide</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.setup_guide" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>Testing Guide</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.testing_guide" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
          <CCol>
            <label>False Positives</label><br>
            <CSwitch :checked.sync="subscription.sync_settings.false_positives" class="mr-1" color="success" labelOn="On" labelOff="Off" />
          </CCol>
        </CRow>

        
        <template #footer>
            <CButton color="secondary" @click="resetSubscriptionWizard()" v-bind:disabled="synchronizing">Dismiss</CButton>
            <CButton v-if="modal_mode == 'Edit'" color="primary" @click="updateSubscription()" v-bind:disabled="synchronizing"><span v-if="synchronizing"><CSpinner size="sm"/>&nbsp;</span>Update</CButton>
            <CButton v-if="modal_mode == 'Create'" color="primary" @click="createSubscription()" v-bind:disabled="synchronizing"><span v-if="synchronizing"><CSpinner size="sm"/>&nbsp;</span>Subscribe</CButton>
        </template>
    </CModal>
    <CModal title="Unsubscribe from Repository" :show.sync="show_unsubscribe_modal" size="lg" color="danger" @close="resetUnsubscribeWarning()">
        <p>Are you sure you want to unsubscribe?  This will remove all associated detection rules from your detection library.</p>
        <template #footer>
            <CButton color="secondary" @click="resetUnsubscribeWarning()">Dismiss</CButton>
            <CButton color="danger" @click="deleteSubscription()">Unsubscribe</CButton>
        </template>
    </CModal>
    <DetectionRepositoryModal :show.sync="show_repository_modal" :repository="selected_repo" :mode="modal_mode"/>
  </div>
</template>

<script>
import { mapState } from "vuex";
import DetectionRepositoryModal from './DetectionRepositoryModal'
import TagBucket from '../components/TagBucket'
import TagList from '../components/TagList'

export default {
  name: "DetectionRepositoryList",
  computed: {
    ...mapState(["detection_repositories","current_user","input_list", "field_templates", "repository_subscription"]),
    field_templates_multiselect_options: function () {
      return this.field_templates.map((o) => {
        return { name: o.name, uuid: o.uuid };
      });
    }
  },
  components: {
    DetectionRepositoryModal,
    TagBucket,
    TagList
  },
  created: function () {
    this.loading = true;
    this.$store.dispatch("getDetectionRepositories", {}).then(() => {
        this.loading = false;
    });

  },
  data() {
    return {
      fields: [
        {
          key: "select",
          label: "",
          _style: "width: 1%",
          sorter: false,
          filter: false,
        },
        "name",
        { key: "subscribed", label: "Subscribed", _style: "width: 5%; text-align: center"},
        { key: "repo_type", label: "Type", _style: "width: 5%; text-align: center" },
        { key: "share_type", label: "Access Mode", _style: "width: 10%; text-align: center" },
        {
          key: "actions",
          label: "Manage",
          filter: false,
          _style: "width: 5%; text-align: right",
        },
      ],
      page: 1,
      page_size: 25,
      loading: false,
      selected_items: [],
      show_subscription_modal: false,
      repository: null,
      sync_interval: 60,
      sync_settings: this.defaultSyncSettings(),
      show_unsubscribe_modal: false,
      synchronizing: false,
      show_repository_modal: false,
      selected_repo: this.default_repo(),
      default_input: null,
      default_field_template: [],
      modal_mode: "Create",
      subscription: {
        uuid: null,
        sync_interval: 60,
        sync_settings: this.defaultSyncSettings(),
        default_input: null,
        default_field_template: [],
      }
    };
  },
  methods: {
    default_repo() {
      return {
          name: "",
          description: "",
          organization: "",
          tags: [],
          repo_type: "local",
          share_type: "private",
          
          access_scope: []
      };
    },
    editRepository(uuid) {
      this.show_repository_modal = true;
      this.modal_mode = "Edit";
      let source_detection = this.detection_repositories.find((item) => item.uuid === uuid);
      this.selected_repo = {
        "name": source_detection.name,
        "description": source_detection.description,
        "organization": source_detection.organization,
        "tags": source_detection.tags,
        "repo_type": source_detection.repo_type,
        "share_type": source_detection.share_type,
        "uuid": source_detection.uuid,
        "access_scope": source_detection.access_scope,
      }
      
      //alert("Not implemented yet");
    },
    deleteRepository(uuid) {
      this.$store.dispatch('deleteDetectionRepository', {uuid: uuid});
    },
    createRepositoryModal() {
      this.show_repository_modal = true;
      this.modal_mode = "Create";
      this.selected_repo = this.default_repo();
      //alert("Not implemented yet");
    },
    startSubscriptionWizard(uuid) {
        this.modal_mode = "Create";
        this.repository = this.detection_repositories.find((item) => item.uuid === uuid);
        this.$store.dispatch("getFieldTemplates", { organization: this.current_user.organization });
        this.subscription.sync_settings = this.defaultSyncSettings();
        this.show_subscription_modal = true;
    },
    startUnsubscripeProcess(uuid) {
        this.repository = this.detection_repositories.find((item) => item.uuid === uuid);
        this.show_unsubscribe_modal = true;
    },
    createSubscription() {
        let data = {
            sync_interval: this.subscription.sync_interval,
            sync_settings: this.subscription.sync_settings,
        }

        if (this.subscription.default_input != null) {
          data['default_input'] = this.subscription.default_input.uuid;
        }
        if (this.subscription.default_field_template && this.subscription.default_field_template.length != 0) {
          data['default_field_template'] = this.subscription.default_field_template.map((template) => {
            return template.uuid
          })
        }

        this.synchronizing = true;
        this.$store.dispatch("createDetectionRepositorySubscription", {repository_uuid: this.repository.uuid, data: data}).then(() => {
          this.getDetections();
        });
        
    },
    select_item(i) {
      if (this.selected_items.includes(i)) {
        this.selected_items = this.selected_items.filter((item) => item !== i);
      } else {
        this.selected_items.push(i);
      }
    },
    selectAll() {
      if (this.selected_items.length > 0) {
        this.selected_items = [];
      } else {
        this.selected_items = this.detection_repositories.map((item) => item.uuid);
      }
    },
    item_is_selected(i) {
      return this.selected_items.includes(i);
    },
    resetSubscriptionWizard() {
        this.show_subscription_modal = false;
        this.repository = null;
        this.subscription = {
          uuid: null,
          sync_interval: 60,
          sync_settings: this.defaultSyncSettings(),
          default_input: null,
          default_field_template: [],
        };
    },
    resetUnsubscribeWarning() {
        this.show_unsubscribe_modal = false;
        this.repository = null;
    },
    getSubscription(uuid) {
        this.$store.dispatch("getDetectionRepositorySubscription", { uuid: uuid}).then(() => {
          
          this.subscription = JSON.parse(JSON.stringify(this.repository_subscription));
          if(this.subscription.default_input) {
            this.subscription.default_input = this.input_list.find((item) => item.uuid === this.subscription.default_input);
          }

          if(this.subscription.default_field_template && this.subscription.default_field_template.length != 0) {
            
            this.subscription.default_field_template = this.subscription.default_field_template.map((template) => {
              return this.field_templates_multiselect_options.find((item) => item.uuid === template);
            })
          }

          this.modal_mode = "Edit";
          this.show_subscription_modal = true;
        }).catch(() => {
          this.show_subscription_modal = false;
          this.modal_mode = "Create";
        });
    },
    startEditSubscription(uuid) {
      this.repository = this.detection_repositories.find((item) => item.uuid === uuid);
      this.$store.dispatch("getFieldTemplates", { organization: this.current_user.organization });
      this.searchInputs();
      this.getSubscription(uuid)
    },
    updateSubscription() {

      let data = {
          sync_interval: this.subscription.sync_interval,
          sync_settings: this.subscription.sync_settings,
      }

      if (this.subscription.default_input != null) {
        data['default_input'] = this.subscription.default_input.uuid;
      }
      if (this.subscription.default_field_template.length != 0) {
        data['default_field_template'] = this.subscription.default_field_template.map((template) => {
          return template.uuid
        })
      }

      this.$store.dispatch("updateDetectionRepositorySubscription", { repository_uuid: this.repository.uuid, data: data }).then((resp) => {
        this.synchronizing = true;
        this.getDetections();
        this.resetSubscriptionWizard();
      });
    },
    deleteSubscription() {
        this.$store.dispatch("deleteDetectionRepositorySubscription", {repository_uuid: this.repository.uuid}).then(() => {
            this.show_unsubscribe_modal = false;
            this.getDetections();
            this.resetUnsubscribeWarning()
        });
    },
    searchInputs(name) {
      this.$store.dispatch("getInputList", {
        organization: this.current_user.organization,
        name: name,
      });
    },
    defaultSyncSettings() {
      return {
        risk_score: true,
        severity: true,
        interval: true,
        lookbehind: true,
        mute_period: true,
        threshold_config: true,
        metric_change_config: true,
        field_mismatch_config: true,
        new_terms_config: true,
        field_templates: true,
        signature_fields: true,
        observable_fields: true,
        guide: true,
        setup_guide: true,
        testing_guide: true,
        false_positives: true,
      }
    },
    forceSync(uuid) {
        this.synchronizing = true;
        this.$store.dispatch("synchronizeDetectionRepository", {repository_uuid: uuid}).then(() => {
            this.getDetections();
        }).catch(() => {
            this.loading = false;
            this.synchronizing = false;
        })
    },
    getDetections() {
      this.loading = true;
      this.$store.dispatch("getDetections", {}).then(() => {
        this.loading = false;
        this.synchronizing = false;
      }).catch(() => {
        this.loading = false;
        this.synchronizing = false;
      });
    },
    syncLocalSubscribers(uuid) {
      this.$store.dispatch("synchronizeLocalSubscribers", { uuid: uuid})
    }
  },
};
</script>
