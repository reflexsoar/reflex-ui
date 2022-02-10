<template>
  <!-- START FILTER PICKERS TODO: Move this to it's own component-->
  <CRow>
    <CCol col="12">
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol col="9">
              <li
                style="display: inline; margin-right: 2px"
                v-for="obs in observableFilters"
                :key="obs.value.toString()"
              >
                <CButton
                  color="secondary"
                  class="tag"
                  size="sm"
                  @click="
                    selectFilter({
                      data_type: obs.data_type,
                      value: obs.value,
                    })
                  "
                  ><b>{{ obs.data_type }}</b
                  >:
                  <span v-if="obs.filter_type == 'severity'">{{
                    severityText(obs.value).toLowerCase()
                  }}</span
                  ><span v-else-if="obs.filter_type == 'organization'">{{
                    mapOrgToName(obs.value)
                  }}</span
                  ><span v-else>{{ obs.value | truncate }}</span></CButton
                >
              </li>
              <span
                v-if="!filteredBySignature() && observableFilters.length > 0"
                ><span class="separator">|</span>Showing
                {{ filtered_events ? filtered_events.length : 0 }} grouped
                events.</span
              ><span
                v-if="filteredBySignature() && observableFilters.length != 0"
                ><span
                  class="separator"
                  v-if="filteredBySignature() && observableFilters.length != 0"
                  >|</span
                >Showing
                {{ filtered_events ? filtered_events.length : 0 }} events.</span
              ><span v-if="observableFilters.length == 0"
                >Showing {{ filtered_events.length }} grouped events.</span
              >
            </CCol>
            <CCol col="3" class="text-right">
              <CButtonGroup>
                <CButton @click="toggleFilters()" color="info" size="sm"
                  >{{ quick_filters ? "Hide" : "Show" }} Filters</CButton
                >
                <CButton
                  v-if="quick_filters"
                  @click="resetFilters()"
                  color="secondary"
                  size="sm"
                  >Reset Filter</CButton
                >
              </CButtonGroup>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCollapse :show="quick_filters">
          <!-- MOVE THIS TO ITS OWN COMPONENT -->
          <CRow class="event-stats-container event-stats-row">
            <div class="event-stats-picker">
              <CRow>
                <CCol>
                  <b>Search</b>
                  <p>Free search by field</p>
                </CCol>
                <CCol class="text-right">
                  <CButtonGroup>
                    <CButton
                      size="sm"
                      color="primary"
                      @click="applyFreeSearch()"
                      >Search</CButton
                    >
                  </CButtonGroup>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CSelect
                    :options="free_search_options"
                    :value.sync="selected_search_option"
                    key="event_picker_search_options"
                  ></CSelect>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CInput
                    placeholder="Enter a search term..."
                    v-model="search_text"
                    @keydown.enter="applyFreeSearch()"
                    key="event_picker_search_field"
                  ></CInput>
                </CCol>
              </CRow>
            </div>
            <div class="event-stats-picker" style="padding-right: 10px">
              <v-date-picker
                v-model="range"
                mode="dateTime"
                :masks="masks"
                is-range
              >
                <template v-slot="{ inputValue, inputEvents }">
                  <CRow>
                    <CCol>
                      <b>Time Filter</b>
                      <p>Select a date range</p>
                    </CCol>
                    <CCol class="text-right">
                      <CButtonGroup>
                        <CButton
                          size="sm"
                          color="secondary"
                          @click="clearTimeFilter()"
                          >Reset</CButton
                        >
                        <CButton
                          size="sm"
                          color="primary"
                          @click="applyTimeFilter()"
                          >Apply</CButton
                        >
                      </CButtonGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <CInput
                        :value="inputValue.start"
                        v-on="inputEvents.start"
                        key="event_picker_start_date"
                      >
                        <template #prepend>
                          <CButton disabled color="secondary" size="sm"
                            ><CIcon name="cil-calendar"
                          /></CButton>
                        </template>
                      </CInput>
                      <CInput :value="inputValue.end" v-on="inputEvents.end" key="event_picker_end_date">
                        <template #prepend>
                          <CButton disabled color="secondary" size="sm"
                            ><CIcon name="cil-calendar"
                          /></CButton>
                        </template>
                      </CInput>
                    </CCol>
                  </CRow>
                  <CRow> </CRow>
                </template>
              </v-date-picker>
            </div>
            <div
              class="event-stats-picker"
              v-for="(bucket, title) in event_stats"
              :key="title"
            >
              <b class="event-stats-title">{{ title }}</b>
              <div
                v-if="status == 'loading'"
                class="event-stats-div"
                style="
                  overflow-y: scroll;
                  margin: auto;
                  text-align: center;
                  verticle-align: middle;
                "
              >
                <CSpinner
                  color="primary"
                  style="width: 3rem; height: 3rem"
                  size="sm"
                  :grow="true"
                />
              </div>
              <div
                v-else
                class="event-stats-div"
                style="margin-top: 5px; overflow-y: scroll"
              >
                <CRow v-for="(k, v) in event_stats[title]" :key="v">
                  <CCol
                    v-if="title === 'severity'"
                    v-c-tooltip="{
                      content: `${severityText(
                        parseInt(v)
                      )}`,
                      placement: 'left',
                    }"
                    @click="
                      selectFilter({
                        filter_type: title,
                        data_type: title,
                        value: parseInt(v),
                      })
                    "
                    style="
                      cursor: pointer;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    ><span>{{
                      severityText(parseInt(v))
                    }}</span></CCol
                  >
                  <CCol
                    v-else-if="title === 'organization'"
                    v-c-tooltip="{
                      content: `${mapOrgToName(v)}`,
                      placement: 'left',
                    }"
                    @click="
                      selectFilter({
                        filter_type: 'organization',
                        data_type: 'organization',
                        value: v,
                      })
                    "
                    style="
                      cursor: pointer;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    ><span>{{ mapOrgToName(v) }}</span></CCol
                  >
                  <CCol
                    v-else-if="title === 'observable value'"
                    v-c-tooltip="{
                      content: `${encodeURI(v)}`,
                      placement: 'left',
                    }"
                    @click="
                      selectFilter({
                        filter_type: 'observable',
                        data_type: 'observable',
                        value: v,
                      })
                    "
                    style="
                      cursor: pointer;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    ><span>{{ v }}</span></CCol
                  >
                  <CCol
                    v-else
                    v-c-tooltip="{ content: `${v}`, placement: 'left' }"
                    @click="
                      selectFilter({
                        filter_type: title,
                        data_type: title,
                        value: v,
                      })
                    "
                    style="
                      cursor: pointer;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                    ><span>{{ v }}</span></CCol
                  >
                  <CCol class="text-right" col="3"
                    ><CBadge color="secondary">{{
                      k.toLocaleString("en-US")
                    }}</CBadge></CCol
                  >
                </CRow>
              </div>
            </div>
          </CRow>
          <!-- END EVENT STATS COMPONENT -->
        </CCollapse>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "EventFilterBar",
  computed: mapState(["observableFilters","event_stats","organizations"]),
  props: {
      filtered_events: Array
  },
  data() {
    return {
      organization: "",
      free_search_options: ["Title", "Tag", "Signature", "Observable"],
      selected_search_option: [],
      range: {
        start: this.days_ago(7),
        end: this.today(),
      },
      masks: {
        input: "YYYY-MM-DD h:mm A",
      },
      selected_search_option: "Title",
      search_text: "",
      quick_filters: false,
      status: ""
    };
  },
  methods: {
      toggleFilters() {
        this.quick_filters = !this.quick_filters
        this.$store.commit('set_quick_filter_state', this.quick_filters)
      },
      today() {
        let d = new Date()
        d.setHours(23,59,59,0)
        return d
      },
      days_ago(offset) {
        let d = new Date()
        d.setDate(d.getDate() - offset)
        d.setHours(0,0,0,0)
        return d
      },
      severityText(severity) {
          return this.$store.getters.getSeverityText(severity)
      },
      filteredBySignature() {
        if(this.observableFilters.some((filter) => filter.filter_type == 'signature')) {
          return true
        } else {
          return false
        }
      },
    applyTimeFilter() {
      this.clearTimeFilter(false);
      this.toggleObservableFilter({
        filter_type: "start",
        data_type: "start",
        value: this.range.start.toISOString(),
      });
      this.toggleObservableFilter({
        filter_type: "end",
        data_type: "end",
        value: this.range.end.toISOString(),
      });
      //this.filterEvents()
    },
    clearTimeFilter(refresh = true) {
      this.observableFilters = this.observableFilters.filter(
        (f) => f.filter_type !== "start"
      );
      this.observableFilters = this.observableFilters.filter(
        (f) => f.filter_type !== "end"
      );
      if (refresh) {
        //this.filterEvents()
      }
    },
    mapOrgToName(uuid) {
      return this.$store.getters.org_name(uuid);
    },
    selectFilter(filter) {
        this.$store.commit('toggleEventFilter', filter)
        this.filterEvents()
    },
    filterEvents: function () {
      this.organizations = this.$store.getters.organizations.map((o) => {
        return { label: o.name, value: o.uuid };
      });

      // Build the filters based on what is currently selected
      this.$store.commit("add_start");
      let status_filters = [];
      let tag_filters = [];
      let observables_filters = [];
      let severity_filter = [];
      let signature_filter = "";
      let title_filter = [];
      let source_filters = [];
      let organization_filters = [];
      let rql = "";
      let start_time = "";
      let end_time = "";
      let grouped = !this.filteredBySignature();
      let search = [];
      let title__like_filter = null;
      for (let f in this.observableFilters) {
        let filter = this.observableFilters[f];

        if (filter.filter_type == "signature") {
          signature_filter = filter.value;
        }

        if (filter.filter_type == "source") {
          source_filters.push(filter.value);
        }

        if (filter.filter_type == "rql") {
          rql = encodeURIComponent(filter.value);
        }

        if (filter.filter_type == "status") {
          status_filters.push(filter.value);
        }

        if (filter.filter_type == "tag") {
          tag_filters.push(encodeURIComponent(filter.value));
        }

        if (filter.filter_type == "observable") {
          observables_filters.push(encodeURIComponent(filter.value));
        }

        if (filter.filter_type == "search") {
          search.push(encodeURIComponent(filter.value));
        }

        if (filter.filter_type == "severity") {
          severity_filter.push(filter.value);
        }

        if (filter.filter_type == "title") {
          title_filter = [encodeURIComponent(filter.value)];
        }

        if (filter.filter_type == "start") {
          start_time = filter.value;
        }

        if (filter.filter_type == "end") {
          end_time = filter.value;
        }

        if (filter.filter_type == "organization") {
          organization_filters.push(filter.value);
        }

        if (filter.filter_type == "title__like") {
          title__like_filter = filter.value;
        }
      }

      this.$store
        .dispatch("getEventStats", {
          signature: signature_filter,
          tags: tag_filters,
          severity: severity_filter,
          title: title_filter,
          status: status_filters,
          source: source_filters,
          observables: observables_filters,
          start: start_time,
          end: end_time,
          organization: organization_filters,
          title__like: title__like_filter,
        })
        .then((resp) => {
          this.event_stats = this.$store.getters.event_stats;
        });
    },
  },
  filters: {
    truncate: function (value) {
      let maxLength = 75;
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