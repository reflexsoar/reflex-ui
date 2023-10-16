<template>
  <div>
    <CCard v-show="show" class="observable-popover" :style="positionInlineStyle">
      <CCardHeader
        ><CRow>
          <CCol
            ><CBadge color="info">{{ observable.data_type }}</CBadge
            >&nbsp;<span class="observable-value" @click="copyToClipboard(observable.value, $event)" v-c-tooltip="{
              'content': 'Click to Copy'}">{{
              observable.value | truncate
            }}</span></CCol
          >
          <CCol col="1"
            ><CDropdown
              class="text-right"
              size="sm"
              color="secondary"
              toggler-text="Actions"
            >
              <CDropdownItem @click="vt_lookup()">Virus Total Lookup</CDropdownItem>
              <CDropdownItem @click="google_search()">Google Search</CDropdownItem>
              <CDropdownItem @click="copyButton(observable.value, $event)">Copy Value</CDropdownItem>
              <CDropdownItem @click="addToFilter()">Filter for Value</CDropdownItem>
              <CDropdownItem @click="show_list_adder = true">Add To List</CDropdownItem>
              <CDropdownItem disabled>Run Action</CDropdownItem>
            </CDropdown> </CCol
          ><CCol col="2">
            <span class="text-right">
              <button type="button" aria-label="Close" class="close" @click="close()">
                <CIcon name="cil-x" />
              </button>
              <button type="button" class="kb" @click="maximize()">
                <CIcon
                  :name="full_screen ? 'cil-window-minimize' : 'cil-window-maximize'"
                />
              </button>
            </span> </CCol></CRow
      ></CCardHeader>
      <CRow v-if="loading" class="absolute-middle" style="height: 100%">
        <center>
          <span><img v-bind:src="logo" class="logo-spinner" /></span>
        </center>
      </CRow>
      <CRow v-if="!loading">
        <CCol>
          <CTabs :activeTab.sync="active_tab">
            <CTab title="Overview">
              <CCardBody>
                <CRow>
                  <CCol>
                    <CIcon name="cilTags" />&nbsp;
                    <li
                      style="display: inline; margin-right: 2px"
                      v-for="tag in observable.tags"
                      :key="tag"
                    >
                      <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
                    </li>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CCallout color="info">
                      <small class="text-muted">Total Events</small><br />
                      <strong class="h1">{{
                        metrics.system_wide_events.toLocaleString()
                      }}</strong>
                    </CCallout>
                  </CCol>
                  <CCol v-if="current_user.default_org">
                    <CCallout :color="classByValue(metrics.total_org_events)">
                      <small class="text-muted">Total Organization Events</small><br />
                      <strong class="h1">{{
                        metrics.total_org_events.toLocaleString()
                      }}</strong>
                    </CCallout>
                  </CCol>
                  <CCol>
                    <CCallout color="info">
                      <small class="text-muted">Total Organization Cases</small><br />
                      <strong class="h1">{{
                        metrics.total_org_cases.toLocaleString()
                      }}</strong>
                    </CCallout>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CCallout color="info">
                      <small class="text-muted">Intel List Matches</small><br />
                      <strong class="h1">{{
                        metrics.threat_list_hits.length.toLocaleString()
                      }}</strong>
                    </CCallout>
                  </CCol>
                </CRow>
              </CCardBody>
            </CTab>
            <CTab title="Intel Lists" v-if="metrics.threat_list_hits.length > 0">
              <CDataTable
                :items="metrics.threat_list_hits"
                :fields="[
                  { key: 'name', label: 'Name' },
                  { key: 'external_feed', label: 'External Feed' },
                  { key: 'list_type', label: 'List Type' },
                ]"
                :itemsPerPage="5"
                :bordered="true"
                :small="true"
                :pagination="true"
                :loading="loading"
                :loadingText="loading ? 'Loading...' : ''"
                :noItemsViewSlot="loading ? '' : 'No items found'"
                :noItemsView="
                  loading
                    ? ''
                    : { noResults: 'No items found', noItems: 'No items found' }
                "
                ><template #external_feed="{ item }">
                  <td>
                    <span v-if="item.external_feed">
                      <p v-c-tooltip="{ content: `${item.url}`, placement: 'left' }">
                        Yes
                      </p>
                    </span>
                    <span v-else>
                      <p>No</p>
                    </span>
                  </td>
                </template>
              </CDataTable>
            </CTab>
            <CTab title="Asset Details" v-if="show_asset_tab">
              <CCardBody :style="tabComputedStyles">
                <p>
                  <span
                    v-if="current_asset != 0"
                    v-on:click="previousAsset()"
                    style="cursor: pointer"
                    ><CIcon name="cilArrowCircleLeft"
                  /></span>
                  Showing asset {{ assetNumber }} of {{ assets.length }}
                  <span
                    v-if="current_asset < assets.length - 1"
                    v-on:click="nextAsset()"
                    style="cursor: pointer"
                    ><CIcon name="cilArrowCircleRight"
                  /></span>
                </p>
                <CRow v-if="visibleAsset.asset_type == 'host'">
                  <CCol>
                    <CRow>
                      <CCol>
                        <h3>{{ visibleAsset.host.name }}&nbsp;</h3>
                        <span class="text-muted">{{ visibleAsset.host.fqdn }}</span>
                      </CCol>
                      <CCol>
                        <b>Last Updated:</b>
                        {{ visibleAsset.updated_at | moment("from") }}
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol
                        ><br />
                        <h4>Host Details</h4>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol><b>IP:</b> {{ visibleAsset.host.ip }} </CCol>
                      <CCol><b>MAC:</b> {{ visibleAsset.host.mac }} </CCol>
                    </CRow>
                  </CCol>
                </CRow>
              </CCardBody>
            </CTab>
            <CTab title="Related Events" v-if="metrics.top_events.length > 0">
              <CDataTable
                :items="metrics.top_events"
                :fields="[
                  { key: 'title', label: 'Title' },
                  { key: 'hits', label: 'Hits' },
                ]"
                :itemsPerPage="5"
                :bordered="true"
                :small="true"
                :pagination="true"
                :loading="loading"
                :loadingText="loading ? 'Loading...' : ''"
                :noItemsViewSlot="loading ? '' : 'No items found'"
                :noItemsView="
                  loading
                    ? ''
                    : { noResults: 'No items found', noItems: 'No items found' }
                "
              />
              
            </CTab>
            <CTab title="IP Whois" v-if="observable.data_type == 'ip' && metrics.ip_whois">
                <CCardBody :style="tabComputedStyles">
                  <pre style="white-space: pre-wrap;">{{ metrics.ip_whois }}</pre>
                </CCardBody>
              </CTab>
            <CTab title="URLHaus" v-if="['ip','url','domain'].includes(observable.data_type) && metrics.url_haus">
                <CCardBody :style="tabComputedStyles">
                  <pre style="white-space: pre-wrap;">{{ metrics.url_haus }}</pre>
                </CCardBody>
              </CTab>
            <CTab v-if="metrics.base64_decoded_values && metrics.base64_decoded_values.length > 0" title="Base64 Decoded Values">
              <CCardBody>
                <pre v-for="value,i in metrics.base64_decoded_values" :key="i" style="white-space: pre-wrap;">{{ value }}</pre>
              </CCardBody>
            </CTab>
          </CTabs>
        </CCol>
      </CRow>
    </CCard>
    <ListAdderModal :show.sync="show_list_adder" :observable="observable"></ListAdderModal>
  </div>
</template>

<style scoped>
.tab-content {
  padding: 5px !important;
}

.observable-value {
  cursor: pointer
}
</style>

<script>
import { mapState } from "vuex";

import ListAdderModal from '../ListAdderModal.vue'

export default {
  name: "ObservablePopover",
  components: {
    ListAdderModal,
  },
  props: {
    observable: {
      type: Object,
      default: () => {},
    },
    organization: {
      type: String,
      default: "",
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      logo: require("@/assets/img/symbol.png"),
      txt: "",
      posX: 0,
      posY: 0,
      popovers: [],
      loading: false,
      metrics: {
        system_wide_events: 0,
        total_org_events: 0,
        total_org_cases: 0,
        threat_list_hits: [],
        top_events: [],
      },
      full_screen: false,
      assets: [],
      active_tab: 0,
      show_asset_tab: false,
      current_asset: 0,
      show_list_adder: false,
    };
  },
  watch: {
    show() {
      if (this.show) {
        this.full_screen = false;
        this.active_tab = 0;
        (this.asset_details = {}), (this.show_asset_tab = false);
      }
    },
    observable() {
      if (this.show) {
        this.full_screen = false;
        this.active_tab = 0;
        (this.asset_details = {}), (this.show_asset_tab = false);
        this.loadObservableMetrics();
        this.loadAssetData();
      }
    },
  },
  methods: {
    vt_lookup() {
      if (
        ["md5hash", "sha1hash", "sha256hash", "imphash", "domain", "ip"].includes(
          this.observable.data_type
        )
      ) {
        if (this.observable.data_type == "ip") {
          window
            .open(
              `https://www.virustotal.com/gui/ip-address/${this.observable.value}`,
              "_blank"
            )
            .focus();
        } else if (
          ["sha1hash", "sha256hash", "imphash", "md5hash"].includes(
            this.observable.data_type
          )
        ) {
          window
            .open(
              `https://www.virustotal.com/gui/file/${this.observable.value}`,
              "_blank"
            )
            .focus();
        } else if (event.item.data_type == "domain") {
          window
            .open(
              `https://www.virustotal.com/gui/domain/${this.observable.value}`,
              "_blank"
            )
            .focus();
        }
      } else {
        alert("Unsupported data type");
      }
    },
    google_search() {
      window
        .open(`https://www.google.com/search?q=${this.observable.value}`, "_blank")
        .focus();
    },
    do_x() {
      console.log("do_x");
    },
    addToFilter() {
      this.$emit("add-observable-to-filter", {
        filter_type: "observable",
        data_type: this.observable.data_type,
        value: this.observable.value,
      });
    },
    loadAssetData() {
      let request_body = {
        organization: this.organization,
      };

      if (this.observable.data_type == "host") {
        request_body["hostname"] = this.observable.value;
      } else if (this.observable.data_type == "ip") {
        request_body["host__ip"] = this.observable.value;
      } else if (this.observable.data_type == "domain") {
        request_body["domain"] = this.observable.value;
      } else {
        return;
      }

      this.loading = true;

      this.$store
        .dispatch("getAssetDetails", request_body)
        .then((resp) => {
          this.assets = resp.data.assets;
          this.loading = false;
          if (this.assets.length > 0) {
            this.show_asset_tab = true;
          }
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    loadObservableMetrics() {
      this.loading = true;
      let request_params = {
        value: this.observable.value,
        data_type: this.observable.data_type,
      };
      if (this.current_user.default_org) {
        request_params["organization"] = this.organization;
      }
      this.$store
        .dispatch("getObservableMetric", request_params)
        .then((resp) => {
          this.metrics = resp.data;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    close() {
      this.$emit("update:show", false);
    },
    classByValue(v) {
      if (v > 1000) {
        return "danger";
      } else if (v > 5000) {
        return "warning";
      } else {
        return "info";
      }
    },
    maximize() {
      this.full_screen = !this.full_screen;
    },
    nextAsset() {
      if (this.current_asset < this.assets.length - 1) {
        this.current_asset += 1;
      }
    },
    previousAsset() {
      if (this.current_asset > 0) {
        this.current_asset -= 1;
      }
    },
    copyButton(text, event) {
        navigator.clipboard.writeText(text);
        // Set the text of the button to "Copied!"
        event.target.innerText = "Copied!";
        // Reset the text of the button after 2 seconds
        setTimeout(() => {
            event.target.innerText = "Copy Value";
        }, 1000);
    },
    copyToClipboard(text, event) {
        navigator.clipboard.writeText(text);
        // Set the text of the button to "Copied!"
        event.target.innerText = "Copied!";
        // Reset the text of the button after 2 seconds
        setTimeout(() => {
            event.target.innerText = text;
        }, 1000);
    }
  },
  computed: {
    positionInlineStyle() {
      return `${
        this.full_screen
          ? "width: 100%; height: 100%; z-index: 9999; top: 0px; "
          : "top: unset !important;width: 40%; height: auto; max-height: 450px;"
      }`;
    },
    tabComputedStyles() {
      return `${
        this.full_screen
          ? "max-height: unset; overflow-y: auto;"
          : "max-height: 300px; overflow-y: auto;"
      }}`;
    },
    ...mapState(["current_user"]),
    visibleAsset() {
      return this.assets[this.current_asset];
    },
    assetNumber() {
      let asset_number = this.current_asset + 1;
      if (asset_number > this.assets.length) {
        asset_number = this.assets.length;
      }
      return asset_number;
    },
  },
  filters: {
    truncate: function (value) {
      let maxLength = 50;
      if (!value) return "";
      value = value.toString();
      if (value.length > maxLength) {
        return value.substring(0, maxLength) + "...";
      } else {
        return value.substring(0, maxLength);
      }
    },
  },
};
</script>
