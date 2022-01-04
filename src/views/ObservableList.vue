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
                    <li style="display: inline; margin-right: 2px;" v-for="obs in filters" :key="obs.value"><CButton color="secondary" class="tag"  size="sm" @click="toggleObservableFilter({'data_type': obs.data_type, 'value': obs.value})"><b>{{obs.data_type}}</b>: <span v-if="obs.filter_type == 'severity'">{{getSeverityText(obs.value).toLowerCase()}}</span><span v-else>{{ obs.value }}</span></CButton></li><span class="separator" v-if="filters.length">|</span>Showing {{observables.length}} observables.</span>
                </CCol>
                <CCol col="3">
                    
                    <CInput placeholder="Search" :value="search_filter" @change="search_filter = $event" v-on:keydown.enter.native="toggleObservableFilter({'filter_type':'search','data_type':'search','value':$event.target.value})"><template #append>
                    <CButton color="secondary" @click="toggleObservableFilter({'filter_type':'search','data_type':'search','value':search_filter})">Search</CButton></template></CInput>
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
          >{{item.value | defang | truncate}}</span><br><small>{{ item.source_field ? item.source_field.toLowerCase() : item.data_type }} | {{ item.data_type }}</small><br><CIcon v-if="item.tags > 0" name="cilTags"/>&nbsp;
          <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag">
            <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag }}</CBadge>
          </li>
          
        </td>
      </template>
      <template #type="{item}">
        <td style="width:8%;">{{item.data_type}}</td>
      </template>
      <template #ioc-header>
        IOC <CIcon name='cilFlagAlt' size='sm' style="cursor: pointer" v-on:click.native="toggleAllIocWarning('ioc')"/>
      </template>
      <template #ioc="{item}">
        <td style="width:8%;">
          <CSwitch
            style="padding-top:3px"
            color="danger"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.ioc"
            v-bind:disabled="item.safe"
            v-on:change.native="toggleISS(item.case, item.value, 'ioc', item.ioc)"
          />
        </td>
      </template>
      <template #spotted-header>
        Spotted <CIcon name='cilFlagAlt' size='sm' style="cursor: pointer" v-on:click.native="toggleAllIocWarning('spotted')"/>
      </template>
      <template #spotted="{item}">
        <td style="width:8%;">
          <CSwitch
            style="padding-top:3px"
            color="danger"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.spotted"
            v-on:change.native="toggleISS(item.case, item.value, 'spotted', item.spotted)"
          />
        </td>
      </template>
      <template #safe-header>
        Safe <CIcon name='cilFlagAlt' size='sm' style="cursor: pointer" v-on:click.native="toggleAllIocWarning('safe')"/>
      </template>
      <template #safe="{item}">
        <td style="width:8%;">
          <CSwitch
            style="padding-top:3px"
            color="success"
            label-on="Yes"
            label-off="No"
            :checked.sync="item.safe"
            v-bind:disabled="item.ioc"
            v-on:change.native="toggleISS(item.case, item.value, 'safe', item.safe)"
          />
        </td>
      </template>
      <template #count="{item}">
        <td style="width:8%" v-if="observableStats(item.value) > 1">{{observableStats(item.value)}}</td>
        <td style="width:8%" v-else>1</td>
      </template>
      <template #actions="{item}">
        <td style="width:10%;">
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
      <CModal title="Tag all Observables" color="danger" :centered="true" size="lg" :show.sync="show_bulk_toggle_modal">
        <p>Are you sure you want to toggle all observables as <b>{{bulk_toggle_field}}</b>?</p>
        <p>This will skip any that are already tagged. In the case of IOC flagging, observables already marked as safe will be skipped.</p>
        <template #footer>
          <CButton @click="bulkToggleISS(bulk_toggle_field,true)" color="danger">Yes</CButton>
        </template>
      </CModal>
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
        return ["value", "ioc", "spotted", "safe", "type", "actions"];
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
      loading: true,
      show_bulk_toggle_modal: false,
      bulk_toggle_field: ""
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
    toggleISS(uuid, observable_value, field, value) {
      let data = {};
      data[field] = value
      this.$store.dispatch('updateObservable', {uuid, observable_value, data}).then(resp => {
        this.observables = this.$store.getters.observables
      })
    },
    toggleAllIocWarning(field) {
        this.show_bulk_toggle_modal = true
        this.bulk_toggle_field = field
    },
    bulkToggleISS(field, value) {
      let targets = []
      if(field != 'spotted') {
        targets = this.observables.filter((obs) => obs.safe !== true).map(obs => { return obs.uuid} )
      } else {
        targets = this.observables.map(obs => { return obs.uuid })
      }      

      let data = {
        'observables': targets,
      }
      data[field] = value
      this.$store.dispatch('bulkUpdateObservables', data).then(resp => {
        this.observables = this.$store.getters.observables
        this.show_bulk_toggle_modal = false
      })
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
      let search = [];

      for (let f in this.filters) {
        let filter = this.filters[f];

        if (filter.filter_type == "tag") {
          tag_filters.push(filter.value);
        }

        if (filter.filter_type == "observable") {
          observable_filters.push(filter.value);
        }

        if (filter.filter_type == "search") {
          search.push(filter.value);
        }
      }

      this.$store
        .dispatch("getCaseObservables", {
          uuid: this.uuid,
          observable: observables_filters,
          type: type_filters,
          tag: tag_filters,
          search: search,
          page: this.current_page,
          page_size: 25,
        })
        .then((resp) => {
          this.observables = this.$store.getters.observables;
          this.page_data = resp.data.pagination;
          this.$store.commit("add_success");
          this.loading = false;
        });
    },
    uncheckSafe(item) {
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
      if(value != null) {
        return value
        .replace(":", "[:]")
        .replace("http", "hxxp")
        .replace(".", "[.]");
      } else {
        return value
      }
      
    },
  },
};
</script>