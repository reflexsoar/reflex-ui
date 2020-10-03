<template>
<div>
  <div v-if="loading">
    <CRow >
      <CCol col="12">
        <div style="margin: auto; text-align:center; verticle-align:middle;">
          <CSpinner color="dark" style="width:6rem;height:6rem;"/>
        </div>
      </CCol>
    </CRow>
  </div>
  <div v-else>
    <CRow>
      <CCol col="12">
        <CCardBody style="border-bottom: 1px solid #cfcfcf; padding-bottom:0px;">
            <CRow>
                <CCol col="6">
                    <li style="display: inline; margin-right: 2px;" v-for="obs in filters" :key="obs.value"><CButton color="secondary" class="tag"  size="sm" @click="toggleObservableFilter({'dataType': obs.dataType.name, 'value': obs.value})"><b>{{obs.dataType}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else>{{ obs.value }}</span></CButton></li><span class="separator" v-if="filters.length">|</span>Showing {{observables.length}} observables.</span>
                </CCol>
                <CCol col="3">
                    
                    <CInput placeholder="Search" :value="search_filter" @change="search_filter = $event" v-on:keydown.enter.native="toggleObservableFilter({'filter_type':'search','dataType':'search','value':$event.target.value})"><template #append>
                    <CButton color="secondary" @click="toggleObservableFilter({'filter_type':'search','dataType':'search','value':search_filter})">Search</CButton></template></CInput>
                    </CCol>
                <CCol col="3">
                    <CPagination :activePage.sync="current_page" :pages="page_data.pages"/>
                </CCol>
            </CRow>
        </CCardBody>
      </CCol>
      </CRow>
      <CRow>
        
        <CCol col="12">
    <CDataTable
      :hover="hover"
      :items="observables"
      :fields="observable_fields"
      :items-per-page="small ? 25 : 10"
      bordered
      striped
      :pagination="false"
      :responsive="false"
    >
      <template #value="{item}">
        <td style="min-width:200px; max-width:300px;">
          <span
            v-c-tooltip="{content: `${item.value}`, placement:'bottom', appendToBody:'true'}"
          >{{item.value | defang | truncate}}</span><br><CIcon v-if="item.tags.length > 0" name="cilTags"/>&nbsp;
          <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name">
            <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag.name }}</CBadge>
          </li>
          
        </td>
      </template>
      <template #type="{item}">
        <td>{{item.dataType.name}}</td>
      </template>
      <template #ioc="{item}">
        <td>
          <CSwitch
            style="padding-top:3px"
            color="danger"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.ioc"
            v-bind:disabled="item.safe"
          />
        </td>
      </template>
      <template #spotted="{item}">
        <td>
          <CSwitch
            style="padding-top:3px"
            color="danger"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.spotted"
          />
        </td>
      </template>
      <template #safe="{item}">
        <td>
          <CSwitch
            style="padding-top:3px"
            color="success"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.safe"
            v-bind:disabled="item.ioc"
          />
        </td>
      </template>
      <template #count="{item}">
        <td v-if="observableStats(item.value) > 1">{{observableStats(item.value)}}</td>
        <td v-else>1</td>
      </template>
      <template #actions="{item}">
        <td>
          <CDropdown toggler-text="Actions" color="secondary" size="sm">
            <CDropdownItem @click="runPlaybookModal = !runPlaybookModal" disabled>Execute Action</CDropdownItem>
            <CDropdownDivider />
            <CDropdownItem @click="deleteObservableModal = !deleteObservableModal">Delete</CDropdownItem>
          </CDropdown>
        </td>
      </template>
    </CDataTable>
        </CCol>
      </CRow>
    </div>
  </div>
</template>

<style scoped>
.separator {
  margin-left: 10px;
  margin-right: 10px;
}
</style>

<script>
export default {
  name: "ObservableList",
  props: {
    uuid: String,
    events: Array,
    observable_fields: {
      type: Array,
      default() {
        return ["value", "ioc", "spotted", "safe", "count", "type", "actions"];
      },
    },
  },
  data() {
    return {
      runPlaybookModal: false,
      deleteObservableModal: false,
      hover: true,
      small: true,
      page_data: {},
      activePage: 1,
      filters: [],
      search_filter: "",
      current_page: 1,
      observables: [],
      loading: true
    };
  },
  watch: {
      current_page: function() {
        this.filterObservables()
      }
  },
  created() {
    this.filterObservables()
  },
  methods: {
    observableStats(uuid) {
      let observables = Array();
      for (let evt in this.events) {
        for (let obs in this.events[evt].observables) {
          let observable = this.events[evt].observables[obs];
          if (observable.value in observables) {
            observables[observable.value] += 1;
          } else {
            observables[observable.value] = 1;
          }
        }
      }
      return observables[uuid];
    },
    toggleObservableFilter(obs) {
      let exists = this.filters.some((item) => {
        return item.value === obs.value;
      });

      // Can only have one status filter at a time
      if (obs.filter_type == "status") {
        this.filters = this.filters.filter(
          (item) => item.filter_type !== obs.filter_type
        );
      }

      if (!exists) {
        this.filters.push(obs);
      } else {
        this.filters = this.filters.filter((item) => item.value !== obs.value);
      }
      this.filterObservables();
    },
    filterObservables() {
      this.loading = true;
      let tag_filters = [];
      let observables_filters = [];
      let type_filters = [];
      let search = "";

      for (let f in this.filters) {
        let filter = this.filters[f];

        if (filter.filter_type == "tag") {
          tag_filters.push(filter.value);
        }

        if (filter.filter_type == "observable") {
          observable_filters.push(filter.value);
        }

        if (filter.filter_type == "search") {
          search = filter.value;
        }
      }

      this.$store
        .dispatch("getCaseObservables", {
          uuid: this.uuid,
          observable: observables_filters,
          type: type_filters,
          tag: tag_filters,
          page: this.current_page,
          page_size: 25,
        })
        .then((resp) => {
          this.observables = resp.data.observables;
          this.page_data = resp.data.pagination;
          this.$store.commit("add_success");
          this.loading = false;
        });
    },
    uncheckSafe(item) {
      console.log("TEST");
      if (item.ioc) {
        item.safe = false;
      }
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
    defang: function (value) {
      return value
        .replace(":", "[:]")
        .replace("http", "hxxp")
        .replace(".", "[.]");
    },
  },
};
</script>