<template>
  <CRow>
    <CCol col="12">
      <CCard class="cases-picker-card">
        <CRow>
          <CCol col="10">
            <li style="display: inline">
              <span v-for="(key, type) in selected_filters" :key="type">
                <CButton
                  v-for="(value, i) in key"
                  :key="i"
                  size="sm"
                  class="tag"
                  color="secondary"
                  style="margin-left: 2px"
                  @click="
                    selectFilter({
                      type: type,
                      value: value,
                    })
                  "
                >
                  <b>{{ type }}</b
                  >: {{ getFilterDisplayName(type, value) }}
                </CButton></span
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
                    <CButton size="sm" color="primary" @click="applyFreeSearch()"
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
              <b class="event-stats-title">Show Synchronized Rules</b><br />
              <CSwitch
                label-on="Yes"
                label-off="No"
                :checked.sync="repo_sync"
                color="success"
              />
            </div>
            <div
              class="event-stats-picker"
              v-for="(bucket, title) in filters"
              :key="title"
            >
              <b class="event-stats-title">{{ title }}</b>
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
                <CRow v-for="k in filters[title]" :key="k.value">
                  <CCol
                    @click="
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
                    ><CBadge color="secondary">{{
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
</style>

<script>
import { mapState } from "vuex";

export default {
  name: "DetectionsFilterMenu",
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
        active: true,
      },
      filters: {},
      show_filters: false,
      free_search_options: ["Name"],
      selected_search_option: "Name",
      search_text: null,
      loading: false,
      repo_sync: true,
      rule_active: true,
    };
  },
  computed: {
    ...mapState(["selected_detection_filters"]),
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
    getFilters() {
      this.loading = true;
      let filters = this.selected_filters;
      this.$store.dispatch("getDetectionFilters", filters).then((resp) => {
        this.filters = resp.data;
        this.loading = false;
      });
    },
    getFilterDisplayName(type, value) {
      if (this.filters[type] != undefined) {
        let filter = this.filters[type].find((item) => item.value === value);
        if (filter) {
          return filter.name;
        }
      }
      return value;
    },
    selectFilter(filter) {
      // If the filter is already selected, remove it
      if (filter.type in this.selected_filters) {
        if (this.selected_filters[filter.type].includes(filter.value)) {
          // Remove the filter
          this.$set(
            this.selected_filters,
            filter.type,
            this.selected_filters[filter.type].filter((item) => item !== filter.value)
          );
        } else {
          // Add the filter
          this.selected_filters[filter.type].push(filter.value);
        }
      } else {
        // Add the filter
        this.$set(this.selected_filters, filter.type, [filter.value]);
      }
      this.$store.commit("update_selected_detection_filters", this.selected_filters);
      this.getFilters();

      let filters = this.selected_filters;
      this.$emit('filter_changed', filters);
    },
    resetFilters() {
      this.selected_filters = {};
      this.getFilters();
      this.$store.commit("update_selected_detection_filters", this.selected_filters);
      this.$emit('filter_changed', filters);
    },
  },
};
</script>
```
