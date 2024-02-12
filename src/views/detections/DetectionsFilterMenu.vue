<template>
  <CRow>
    <CCol col="12">
      <CCard class="cases-picker-card">
        <CRow>
          <CCol col="10">
            <li style="display: inline">
              <span v-for="(key, type) in selected_filters" :key="type">
                <CBadge
                  v-for="(value, i) in key"
                  :key="i"
                  size="sm"
                  class="tag tag-clickable"
                  color="secondary"
                  style="margin-left: 2px"
                  @click.alt.exact="selectFilter({
                      type: type,
                      value: value,
                    }, true)"
                  @click.exact="
                    selectFilter({
                      type: type,
                      value: value,
                    })
                  "
                >
                  <b>{{ getTypeDisplayName(type) }}</b
                  >: {{ getFilterDisplayName(type, value) }}
                </CBadge></span
              >
            </li>
          </CCol>
          <CCol col="2" class="text-right">
            <CButtonGroup>
              <CButton @click="show_filters = !show_filters" color="info" size="sm"
                >{{ show_filters ? "Hide" : "Show" }} Filters</CButton
              >
              <CButton
                v-if="show_filters"
                @click="resetFilters()"
                color="secondary"
                size="sm"
                >Reset Filter</CButton
              >
            </CButtonGroup>
          </CCol>
        </CRow>
      </CCard>
      <CCollapse :show="show_filters"
        ><CCard class="cases-picker-card">
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
                      v-bind:disabled="search_text === null || search_text == ''"
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
            <div class="event-stats-picker">
              <CRow>
                <CCol
                  ><b class="event-stats-title">Show Synchronized Rules</b><br />
                  <CSwitch
                    label-on="Yes"
                    label-off="No"
                    :checked.sync="repo_sync"
                    color="success"
                /></CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CRow>
                    <CCol>
                      <CInput
                        size="sm"
                        label="Max Estimated Hits"
                        style="width: 95%"
                        v-model.number="max_average_hits_per_day"
                        @change="
                          selectFilter({
                            type: 'max_average_hits_per_day',
                            value: max_average_hits_per_day,
                          })
                        "
                      ></CInput>
                    </CCol>
                    <CCol
                      ><CInput
                        size="sm"
                        label="Min Estimated Hits"
                        style="width: 95%"
                        v-model.number="min_average_hits_per_day"
                        @change="
                          selectFilter({
                            type: 'min_average_hits_per_day',
                            value: min_average_hits_per_day,
                          })
                        "
                      ></CInput>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </div>
            <div
              class="event-stats-picker"
              v-for="(bucket, title) in filters"
              :key="title"
            >
              <b class="event-stats-title">{{ title.replace("_", " ") }}</b>&nbsp;<i class="fa fa-filter" style="cursor:pointer; opacity: 80%; font-size: .86em" v-if="!['active'].includes(title)" @click="toggleStatsFilter(title)"/>
              <div
                v-if="loading"
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
              <CInput size="sm" style="margin-left: 5px" placeholder="Search..." v-model="detection_stats_filter[title]" v-if="showStatsFilter(title) && !['active'].includes(title)"/>
                <CRow v-for="k in filtered_stats(title)" :key="k.value">
                  <CCol
                  @click.alt.exact="selectFilter({
                      type: title,
                      value: k.value,
                    }, true)"
                    @click.exact="
                      selectFilter({
                        type: title,
                        value: k.value,
                      })
                    "                    
                    style="
                      cursor: pointer;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ k.name }}</CCol
                  ><CCol class="text-right" col="3"
                    ><CBadge color="secondary" style="font-size: 75% !important">{{
                      k.count.toLocaleString("en-US")
                    }}</CBadge></CCol
                  >
                </CRow>
              </div>
            </div>
          </CRow>
          <!-- END EVENT STATS COMPONENT --></CCard
        >
      </CCollapse>
    </CCol>
  </CRow>
</template>

<style scoped>
.separator {
  margin-left: 10px;
  margin-right: 10px;
}

.slider {
  width: 95%;
  margin-right: 10px;
}
</style>

<script>
import { mapState } from "vuex";

import RMultiCheck from "../components/MultiCheck.vue";

export default {
  name: "DetectionsFilterMenu",
  components: {
    RMultiCheck,
  },
  props: {
    total_detections: {
      type: Number,
      required: true,
    },
    filter_changed: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      selected_filters: {
        repo_synced: true,
      },
      filters: {},
      show_filters: false,
      free_search_options: ["Name", "Description", "Query", "Tags"],
      selected_search_option: "Name",
      search_text: null,
      repo_sync: true,
      rule_active: true,
      max_average_hits_per_day: 0,
      min_average_hits_per_day: 0,
      tag_search: "",
      show_stats_filter: {},
      detection_stats_filter: {},
    };
  },
  computed: {
    ...mapState(["selected_detection_filters", "loading"]),
  },
  created() {
    this.selected_filters = this.selected_detection_filters;
    this.filters = this.$store.state.detection_filters;
    this.getFilters();
  },
  watch: {
    repo_sync: function (val) {
      if (val == true) {
        this.selected_filters.repo_synced = true;
      } else {
        this.selected_filters.repo_synced = false;
      }
      this.getFilters();
    },
    rule_active: function (val) {
      if (val == true) {
        this.selected_filters.active = true;
      } else {
        this.selected_filters.active = false;
      }
      this.getFilters();
    },
  },
  methods: {
    toggleStatsFilter(title) {
        if (Object.keys(this.show_stats_filter).includes(title)) {
          this.show_stats_filter[title] = !this.show_stats_filter[title]
        } else {
          this.$set(this.show_stats_filter, title, true)
        }

        
        if(this.show_stats_filter[title] === false) {
          this.$set(this.detection_stats_filter, title, "")
        }

      },
      showStatsFilter(title) {
        if (Object.keys(this.show_stats_filter).includes(title)) {
          return this.show_stats_filter[title]
        } else {
          return false
        }
      },
    filtered_stats(title) {
      console.log(title)
        if (Object.keys(this.detection_stats_filter).includes(title)) {
          /* Return any of the keys of this.filters[title] that match the filter */
          let filtered_stats = {}
          Object.keys(this.filters[title]).forEach(key => {
            let _key = this.filters[title][key].name
            let search = this.detection_stats_filter[title].toLowerCase()

            if(title === 'severity') {
              _key = this.getSeverityText(Number(key))
            } else if (title === 'event rule') {
              _key = this.getEventRuleName(key)
            } else if (title === 'organization') {
              _key = this.mapOrgToName(key)
            }

            _key = _key.toLowerCase()
            if (_key.includes(search)) {
              filtered_stats[key] = this.filters[title][key]
            }
            
          })
          return filtered_stats
        } else {
          return this.filters[title]
        }
        return {}
      },
      getSeverityText(severity) {
        switch(severity) {
          case 0: return 'Informational';
          case 1: return 'Low';
          case 2: return 'Medium';
          case 3: return 'High';
          case 4: return 'Critical';
          default: return 'Unknown';
        }
      },
      mapOrgToName(uuid) {
        let org = this.$store.getters.organizations.filter(o => o.uuid === uuid)
        if (org.length > 0) {
          return org[0].name
        } else {
          return "Unknown"
        }
      },
    getFilterValue(type) {
      if (type === 'tags') {
        return this.filtered_tags
      }
      if (type in this.selected_filters) {
        return this.selected_filters[type];
      }
      return [];
    },
    getFilters() {
      let filters = this.selected_filters;
      this.$store.dispatch("getDetectionFilters", filters).then((resp) => {
        this.filters = resp.data;
      });
      this.$emit("filter_changed", this.filters);
    },
    getFilterDisplayName(type, value) {
      // If the type is a __not type, remove the __not
      if (type.endsWith("__not")) {
        type = type.replace("__not", "");
      }
      
      if (this.filters[type] != undefined) {
        let filter = this.filters[type].find((item) => item.value === value);
        if (filter) {
          return filter.name;
        }
      }
      return value;
    },
    getTypeDisplayName(type) {
      let display_names = {
        name__like: "Name",
        description__like: "Description",
        query__like: "Query",
        rule_type: "Rule Type",
        assess_rule: "Flagged for Assessment",
        max_average_hits_per_day: "Max Estimated Hits",
        min_average_hits_per_day: "Min Estimated Hits",
      };

      if (type in display_names) {
        return display_names[type];
      }

      if (type.endsWith("__not")) {
        type = type.replace("__not", "");
        type = "NOT " + type;
        return type
      }
      return type;
    },
    applyFreeSearch() {
      if (this.search_text == null || this.search_text == "") {
        return;
      }

      let free_search_types = {
        Name: "name__like",
        Description: "description__like",
        Query: "query__like",
        Tags: "tags",
        "Max Estimated Hits": "max_average_hits_per_day",
        "Min Estimated Hits": "min_average_hits_per_day",
      };
      let filter = {
        type: free_search_types[this.selected_search_option],
        value: this.search_text,
      };
      this.search_text = "";
      this.selectFilter(filter);
    },
    filterSelected(filter) {
      if (filter.type in this.selected_filters) {
        if (this.selected_filters[filter.type].includes(filter.value)) {
          return true;
        }
      }
      return false;
    },
    selectFilter(filter, filter_out = false) {
      // If the filter is already selected, remove it
      let allow_multiple = ['status','status__not', 'tags__not', 'tags', 'tactics','techniques','organization','organization__not', 'warnings','warnings__not','rule_type','severity'];
      let supported_for_not = ['status', 'warnings', 'tags', 'status__not', 'warnings__not', 'tags__not', 'organization', 'organization__not']

      if(filter_out) {
        if(!supported_for_not.includes(filter.type)) {
          return;
        }
        if(this.filterSelected(filter)) {
          this.selectFilter(filter);
        }
        if(filter.type.endsWith('__not')) {
          filter.type = filter.type.replace('__not', '');
        } else {
          filter.type = filter.type + '__not';
        }
      }

      if (filter.type in this.selected_filters) {
        if (this.selected_filters[filter.type].includes(filter.value)) {
          // Remove the filter
          this.$set(
            this.selected_filters,
            filter.type,
            this.selected_filters[filter.type].filter((item) => item !== filter.value)
          );
        } else {
          // If the filter.type is not in this.selected_filters create a new empty array
          if(!allow_multiple.includes(filter.type)) {
            this.$set(this.selected_filters, filter.type, [filter.value]);
          } else {
            this.$set(this.selected_filters, filter.type, [...this.selected_filters[filter.type], filter.value]);
          }
        }
      } else {
        if (!(filter.type in this.selected_filters)) {
          this.$set(this.selected_filters, filter.type, []);
        }
        
        if(!allow_multiple.includes(filter.type)) {
          this.$set(this.selected_filters, filter.type, [filter.value]);
        } else {
          this.$set(this.selected_filters, filter.type, [...this.selected_filters[filter.type], filter.value]);
        }

      }
      this.$store.commit("update_selected_detection_filters", this.selected_filters);
      this.getFilters();

      let filters = this.selected_filters;
    },
    resetFilters() {
      this.selected_filters = {};
      this.getFilters();
      this.$store.commit("update_selected_detection_filters", this.selected_filters);
      this.$emit("filter_changed", this.filters);
    },
  },
};
</script>
```
