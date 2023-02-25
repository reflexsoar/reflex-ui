<template>
  <div>
    <CCard v-show="show" class="observable-popover" :style="positionInlineStyle">
      <CCardHeader
        ><CRow>
          <CCol
            ><CBadge color="info">{{ observable.data_type }}</CBadge
            >&nbsp;<span v-c-tooltip="`${observable.value}`">{{ observable.value | truncate }}</span></CCol
          >
          <CCol col="1"
            ><CDropdown
              class="text-right"
              size="sm"
              color="secondary"
              toggler-text="Actions"
            >
              <CDropdownItem>Virus Total Lookup</CDropdownItem>
              <CDropdownItem>Google Search</CDropdownItem>
              <CDropdownItem>Copy Value</CDropdownItem>
              <CDropdownItem>Add To List</CDropdownItem>
              <CDropdownItem disabled>Run Action</CDropdownItem>
            </CDropdown> </CCol
          ><CCol col="2">
            <span class="text-right">
              <button type="button" aria-label="Close" class="close" @click="close()">
                <CIcon name="cil-x"/>
              </button>
              <button type="button" class="kb" @click="maximize()"><CIcon :name="full_screen ? 'cil-window-minimize' : 'cil-window-maximize'"/></button>
            </span>
          </CCol></CRow
        ></CCardHeader
      >
      <CRow v-if="loading" class="absolute-middle" style="height: 100%">
          <center><span><img v-bind:src="logo" class="logo-spinner"></span></center>
      </CRow>
      <CRow v-if="!loading">
        <CCol>
          <CTabs>
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
              :noItemsView="loading ? '' : { noResults: 'No items found', noItems: 'No items found' }"
            ><template #external_feed="{item}">
              <td>
                <span v-if="item.external_feed">
                  <p v-c-tooltip="{ content: `${item.url}`, placement: 'left' }">Yes</p>
                </span>
                <span v-else>
                  <p>No</p>
                </span>
              </td>
            </template>
            </CDataTable>            
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
              :noItemsView="loading ? '' : { noResults: 'No items found', noItems: 'No items found' }"/>
              </CTab>
          </CTabs>
          
        </CCol>
      </CRow>
    </CCard>
  </div>
</template>

<style scoped>
.tab-content {
    padding: 5px !important;
}
</style>

<script>
import { mapState } from "vuex";

export default {
  name: "ObservablePopover",
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
    };
  },
  watch: {
    show() {
      if (this.show) {
        this.full_screen = false;
        this.loadObservableMetrics();
      }
    },
    observable() {
      if (this.show) {
        
        this.loadObservableMetrics();
      }
    },
  },
  methods: {
    do_x() {
      console.log("do_x");
    },
    loadObservableMetrics() {
      this.loading = true;
      let request_params = {
        value: this.observable.value
      }
      if(this.current_user.default_org) {
        request_params['organization'] = this.organization
      }
      this.$store
        .dispatch("getObservableMetric", request_params)
        .then((resp) => {
          this.metrics = resp.data;
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
  },
  computed: {
    positionInlineStyle() {
      return `${this.full_screen ? "width: 100%; height: 100%; z-index: 9999; top: 0px; " : "top: unset !important;width: 40%; height: auto; max-height: 450px;"}`;
    },
    ...mapState(['current_user']),
  },
  filters: {
        truncate: function (value) {
            let maxLength = 50
            if (!value) return ''
            value = value.toString()
            if (value.length > maxLength) {
                return value.substring(0,maxLength) + "..."
            } else {
                return value.substring(0,maxLength)
            }
            
        }
    }
};
</script>
