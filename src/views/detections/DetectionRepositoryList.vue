<template>
  <div>
    <CRow style="padding: 10px">
      <CCol>
        <CButton color="primary" @click="createRepositoryModal()">New Repository</CButton>
      </CCol>
      <CCol col="5" class="text-right"> </CCol>
    </CRow>
    <CDataTable
      :items="detection_repositories"
      :fields="fields"
      :items-per-page="10"
      :sorter="{ external: false, resetable: true }"
      :loading="loading"
      column-filter
      pagination
      style="border-top: 1px solid #cfcfcf"
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
            <CDropdownItem v-if="!item.read_only" color="info" @click="editRepository(item.uuid)" size="sm"
              ><CIcon name="cilPencil" />&nbsp;Edit Repository
            </CDropdownItem>
            <CDropdownItem v-if="!item.read_only" color="danger" @click="deleteRepository(item.uuid)" size="sm"
              ><CIcon name="cilTrash" />&nbsp;Delete Repository
            </CDropdownItem>
            <CDropdownItem v-if="!item.subscribed" @click="startSubscriptionWizard(item.uuid)" size="sm">
                <CIcon name="cilPlus" />&nbsp;Subscribe to Repository
            </CDropdownItem>
            <CDropdownItem v-if="item.subscribed" @click="startUnsubscripeProcess(item.uuid)" size="sm">
                <CIcon name="cilMinus" />&nbsp;Unsubscribe from Repository
            </CDropdownItem>
            <CDropdownItem v-if="item.subscribed" @click="forceSync(item.uuid)" size="sm">
                <CIcon name="cilSync" />&nbsp;Synchronize Now
            </CDropdownItem>
          </CDropdown>
        </td>
      </template>
      <template #name="{ item }">
        <td>
          <span
            ><b>{{ item.name }}</b></span
          >
          <p>{{ item.description }}</p>
        </td>
      </template>
      <template #detection_count="{ item }">
        <td>
          <center>{{ item.detection_count ? item.detection_count : 0 }}</center>
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
    <CModal title="Subscribe to Repository" :show.sync="show_subscription_modal" size="lg" :close-on-backdrop="false" @close="resetSubscriptionWizard()">
        <p>Subscribing to a repository will automatically synchronize all detections from the target repository in to your own detection library.
            Based on an interval defined in this wizard, the system will automatically synchronize any new or updated detections from the target repository.
            The synchronization process will only update the description, base query, MITRE ATT&CK tactics and techniques and other very specific 
            information for making the detection effective.  The process will not overwrite exclusions.
        </p>
        <CInput v-model.number="sync_interval" label="Synchronization Interval (minutes)" description="How oftern to synchronize rules from this repository" />
        <template #footer>
            <CButton color="secondary" @click="resetSubscriptionWizard()">Dismiss</CButton>
            <CButton color="primary" @click="createSubscription()">Subscribe</CButton>
        </template>
    </CModal>
    <CModal title="Unsubscribe from Repository" :show.sync="show_unsubscribe_modal" size="lg" color="danger" @close="resetUnsubscribeWarning()">
        <p>Are you sure you want to unsubscribe?  This will remove all associated detection rules from your detection library.</p>
        <template #footer>
            <CButton color="secondary" @click="resetUnsubscribeWarning()">Dismiss</CButton>
            <CButton color="danger" @click="deleteSubscription()">Unsubscribe</CButton>
        </template>
    </CModal>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "DetectionRepositoryList",
  computed: {
    ...mapState(["detection_repositories"]),
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
        { key: "detection_count", label: "Detections", _style: "width: 5%; text-align: center" },
        { key: "subscribed", label: "Subscribed", _style: "width: 5%; text-align: center"},
        { key: "repo_type", label: "Type", _style: "width: 5%; text-align: center" },
        { key: "share_type", label: "Access Mode", _style: "width: 10%; text-align: center" },
        { key: "tags", label: "Tags", _style: "width: 25%" },
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
      show_unsubscribe_modal: false,
      synchronizing: false
    };
  },
  methods: {
    editRepository(uuid) {
      alert("Not implemented yet");
    },
    deleteRepository(uuid) {
      alert("Not implemented yet");
    },
    createRepositoryModal() {
      alert("Not implemented yet");
    },
    startSubscriptionWizard(uuid) {
        this.repository = this.detection_repositories.find((item) => item.uuid === uuid);
        this.show_subscription_modal = true;
    },
    startUnsubscripeProcess(uuid) {
        this.repository = this.detection_repositories.find((item) => item.uuid === uuid);
        this.show_unsubscribe_modal = true;
    },
    createSubscription() {
        let data = {
            sync_interval: this.sync_interval,
        }
        this.$store.dispatch("createDetectionRepositorySubscription", {repository_uuid: this.repository.uuid, data: data}).then(() => {
            this.show_subscription_modal = false;
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
        this.sync_interval = 60;
    },
    resetUnsubscribeWarning() {
        this.show_unsubscribe_modal = false;
        this.repository = null;
    },
    deleteSubscription() {
        this.$store.dispatch("deleteDetectionRepositorySubscription", {repository_uuid: this.repository.uuid}).then(() => {
            this.show_unsubscribe_modal = false;
        });
    },
    forceSync(uuid) {
        this.synchronizing = true;
        this.$store.dispatch("synchronizeDetectionRepository", {repository_uuid: uuid}).then(() => {
            this.$store.dispatch("getDetections", {}).then(() => {
                this.loading = false;
                this.synchronizing = false;
            }).catch(() => {
                this.loading = false;
                this.synchronizing = false;
            })
        }).catch(() => {
            this.loading = false;
            this.synchronizing = false;
        })
    }
  },
};
</script>
