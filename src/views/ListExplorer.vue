<template>
  <CCol>
    <h2>Intel Explorer</h2><br>
    <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
      {{alert.message}}
    </CAlert>      
    <CCard>
      <CRow>
        <CCol col="12">
          <CCard class="cases-picker-card">
              <CRow>
                <CCol col="9">
                  <li style="display: inline; margin-right: 2px;" v-for="filter in intelFilters" :key="filter.value+filter.data_type"><CButton color="secondary" class="tag"  size="sm" @click="toggleIntelFilter({'data_type': filter.data_type, 'value': filter.value})"><b>{{filter.data_type}}</b>: <span v-if="filter.data_type == 'list'">{{ $store.getters.list_name(filter.value) }}</span><span v-else>{{ filter.value | truncate }}</span></CButton></li><span v-if="intelFilters.length > 0" class="separator">&nbsp;|&nbsp;</span><span>Showing {{list_values ? list_values.length : 0  }} intel values.</span>
                </CCol>
                <CCol col="3" class="text-right">
                  <CButtonGroup>
                    <CButton @click="quick_filters = !quick_filters" color="info" size="sm">{{quick_filters ? 'Hide' : 'Show'}} Filters</CButton>
                    <CButton v-if="quick_filters" @click="resetFilters()" color="secondary" size="sm">Reset Filter</CButton>
                  </CButtonGroup>                  
                </CCol>
              </CRow>
            </CCard>
            
            <CCollapse :show="quick_filters"><CCard class="cases-picker-card">
              <!-- MOVE THIS TO ITS OWN COMPONENT -->
            <CRow class='event-stats-container event-stats-row'>
              <div class='event-stats-picker'>
                <CRow>
                  <CCol>
                    <b>Search</b><p>Free search by field</p>
                  </CCol>
                  <CCol class='text-right'>
                    <CButtonGroup>
                      <CButton size="sm" color="primary" @click="applyFreeSearch()">Search</CButton>
                    </CButtonGroup>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CSelect :options="free_search_options" :value.sync="selected_search_option"></CSelect>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CInput placeholder="Enter a search term..." v-model="search_text" @keydown.enter="applyFreeSearch()"></CInput>
                  </CCol>
                </CRow>
              </div>
              <div class='event-stats-picker' style='padding-right: 10px'>
                <v-date-picker
                          v-model="range"
                          mode="dateTime"
                          :masks="masks"
                          is-range
                        >
                          <template v-slot="{ inputValue, inputEvents }">
                            <CRow>
                              <CCol>
                                <b>Time Filter</b><p>Select a date range</p>
                              </CCol>
                              <CCol class='text-right'>
                                <CButtonGroup>
                                  <CButton size="sm" color="secondary" @click="clearTimeFilter()">Reset</CButton>
                                  <CButton size="sm" color="primary" @click="applyTimeFilter()">Apply</CButton>
                                </CButtonGroup>
                                
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol>
                                <CInput :value="inputValue.start" v-on="inputEvents.start">
                                  <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                                <CInput :value="inputValue.end" v-on="inputEvents.end">
                                <template #prepend>
                                    <CButton disabled color="secondary" size="sm"><CIcon name='cil-calendar'/></CButton>
                                  </template>
                                </CInput>
                              </CCol>
                            </CRow>
                            <CRow>
                              
                            </CRow>
                          </template>
                        </v-date-picker>
              </div>
              <div class='event-stats-picker' v-for="bucket, title in list_stats" :key="title">
                <b class='event-stats-title'>{{title}}</b>
                <div v-if="loading == 'loading'" class='event-stats-div' style="overflow-y: scroll; margin:auto; text-align:center; verticle-align:middle;">
                  <CSpinner
                        color="dark"
                        style="width:3rem;height:3rem;"
                        size="sm"
                    />
                </div>
                <div v-else class="event-stats-div" style="margin-top:5px; overflow-y: scroll">
                  <CRow v-for="k,v in list_stats[title]" :key="v">
                    <CCol v-if="title == 'from_poll'" v-c-tooltip="{ content: `${v ? 'Yes': 'No'}`, placement: 'left' }" @click="toggleIntelFilter({'filter_type': title, 'data_type':title,'value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{v ? 'Yes': 'No'}}</span></CCol>
                    <CCol v-else-if="title == 'list'" v-c-tooltip="{ content: `${v ? 'Yes': 'No'}`, placement: 'left' }" @click="toggleIntelFilter({'filter_type': title, 'data_type':title,'value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{$store.getters.list_name(v)}}</span></CCol>
                    <CCol v-else v-c-tooltip="{ content: `${v}`, placement: 'left' }" @click="toggleIntelFilter({'filter_type': title, 'data_type':title,'value':v})" style="cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span>{{v}}</span></CCol>
                    <CCol class="text-right" col="3"><CBadge color="secondary">{{k.toLocaleString('en-US')}}</CBadge></CCol>
                  </CRow>                
                </div>
              </div>
            </CRow>
            <!-- END EVENT STATS COMPONENT --></CCard>
            </CCollapse>
          
        </CCol>
      </CRow>
      <CDataTable
          :hover="hover"
          :striped="striped"
          :bordered="bordered"
          :small="small"
          :fixed="fixed"
          :items="list_values"
          :fields="fields"
          :items-per-page="page_size"
          :dark="dark"
          :loading="loading"
      >
      <template #value="{item}">
        <td>
          <a style="cursor: pointer" @click="toggleIntelFilter({'filter_type': 'value', 'data_type': 'value','value':item.value})" >{{ item.value }}</a>
        </td>
      </template>
      <template #from_poll="{item}">
        <td>
          {{item.from_poll ? 'Yes' : 'No'}}
        </td>
      </template>
      <template #organization="{item}">
        <td>
          <OrganizationBadge :uuid="item.organization"/>
        </td>
      </template>
      <template #created_at="{item}">
        <td>
          {{item.created_at | moment('from','now')}}
        </td>
      </template>
      <template #record="{item}">
        <td>
          <CButton v-if="item.record_id != null" color="secondary" size="sm" @click="filterByRelated(item.record_id)">View Record</CButton>
        </td>
      </template>
      </CDataTable>
      <CRow>
        <CCol>
          <CCardBody>
            <CPagination :activePage.sync="active_page" :pages="pagination.pages"/>
          </CCardBody>
        </CCol>
      </CRow>
    </CCard>
  </CCol>
</template>

<script>
import {mapState} from "vuex";
import OrganizationBadge from './OrganizationBadge'
export default {
    name: 'ListExplorer',
    components: {
      OrganizationBadge
    },
    props: {
    items: Array,
    fields: {
      type: Array,
      default () {
        return ['value', 'list_name', 'data_type', {key: 'created_at', label: 'Date Added'}, {key: 'from_poll', label: 'External Source'}, 'record']
      }
    },
    caption: {
      type: String,
      default: 'Table'
    },
    hover: Boolean,
    striped: Boolean,
    bordered: Boolean,
    small: Boolean,
    fixed: Boolean,
    dark: Boolean
    },
    computed: mapState(['current_user','status','alert','list_values','pagination','list_stats']),
    created: function () {
      if(this.current_user.default_org) {
        if (!this.fields.includes('organization')) {
          this.fields.splice(1,0,'organization')
        } 
      }
      this.loading = true
      this.loadIntelValues()
      this.$store.dispatch('getIntelListStats', {}).then(resp => {
        console.log(resp)
        this.loading = false
      })
    },
    watch: {
      modal_status: function () {
        if(!this.modal_status) {
          this.reset()
        }
      },
      active_page: function() {
        this.reloadIntelValues()
      }
    },
    data(){
      return {
        loading: false,
        delete_modal: false,
        error: false,
        error_message: "",
        delete_confirm: "",
        active_page: 1,
        page_size: 100,
        quick_filters: true,
        intelFilters: [],
        filtered_values: [],
        metrics: ['value','list','data_type','from_poll'],
        range: {
          start: this.days_ago(7),
          end: this.today()
        },
        masks: {
          input: 'YYYY-MM-DD h:mm A'
        },
        free_search_options: [
          'List Name', 'Value'
        ],
        search_text: '',
        selected_search_option: 'List Name'
      }
    },
    watch: {
      active_page: function() {
        this.loadIntelValues()
      }
    },
    methods: {
      resetFilters() {
        this.intelFilters = []
        this.loadIntelValues()
      },
      applyFreeSearch() {
        if(!['',null].includes(this.search_text)) {
          if(this.selected_search_option.toLowerCase() == 'list name') {
            this.toggleIntelFilter({'filter_type': 'list_name__like', 'data_type': this.selected_search_option.toLowerCase(), 'value': this.search_text})
          } else {
            this.toggleIntelFilter({'filter_type':this.selected_search_option.toLowerCase(), 'data_type': this.selected_search_option.toLowerCase(), 'value': this.search_text})
          }
          
          this.search_text = ""
        }
      },
      applyTimeFilter() {
        this.clearTimeFilter(false)
        this.toggleIntelFilter({'filter_type':'start','data_type':'start','value':this.range.start.toISOString()})
        this.toggleIntelFilter({'filter_type':'end','data_type':'end','value':this.range.end.toISOString()})
        this.loadIntelValues()
      },
      clearTimeFilter(refresh=true) {
        this.intelFilters = this.intelFilters.filter(f => f.filter_type !== 'start')
        this.intelFilters = this.intelFilters.filter(f => f.filter_type !== 'end')
        this.range = {
          start: this.days_ago(7),
          end: this.today()
        }
        if(refresh) {
          this.loadIntelValues()
        }
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
      loadIntelValues() {
        this.$store.commit('add_start')
        let value_filters = []
        let data_type_filters = []
        let record_id_filter = null
        let from_poll = null
        let list_filters = []
        let list_name__like = null
        let value__like = null
        let start_time = ""
        let end_time = ""
        let page = this.active_page
        let page_size = this.page_size

        for(let f in this.intelFilters) {

          let filter = this.intelFilters[f]

          if(filter.filter_type == 'value') {
            value_filters.push(filter.value)
          }

          if(filter.filter_type == 'record_id') {
            record_id_filter = filter.value
          }

          if(filter.filter_type == 'data_type') {
            data_type_filters.push(filter.value)
          }

          if(filter.filter_type == 'list') {
            list_filters.push(filter.value)
          }

          if(filter.filter_type == 'from_poll') {
            from_poll = filter.value
          }

          if(filter.filter_type == 'start') {
            start_time = filter.value
          }

          if(filter.filter_type == 'end') {
            end_time = filter.value
          }

          if(filter.filter_type == 'list_name__like') {
            list_name__like = filter.value
          }

          if(filter.filter_type == 'value__like') {
            list_name__like = filter.value
          }
        }

        this.$store.dispatch('getIntelListValues', {
          page: page,
          page_size: page_size,
          start: start_time,
          end: end_time,
          value: value_filters,
          list: list_filters,
          data_type: data_type_filters,
          from_poll: from_poll,
          list_name__like: list_name__like,
          value__like: value__like,
          record_id: record_id_filter
        }).then(() => {
          this.loading = false
        })
        this.$store.dispatch('getIntelListStats', {
          start: start_time,
          end: end_time,
          value: value_filters,
          list: list_filters,
          data_type: data_type_filters,
          from_poll: from_poll,
          list_name__like: list_name__like,
          value__like: value__like,
          record_id: record_id_filter
        })
      },
      filterByRelated(id) {
        this.intelFilters = [{'filter_type': 'record_id', 'data_type': 'record_id','value': id}]
        this.loadIntelValues()
      },
      toggleIntelFilter(filter) {
        let exists = this.intelFilters.some((item) => {
          return item.value == filter.value
        })

        // Can only have one from_poll filter at a time
        if(filter.filter_type == 'from_poll') {
          this.intelFilters = this.intelFilters.filter(item => item.filter_type !== filter.filter_type)
        }

        if(filter.filter_type == 'record_id') {
          this.intelFilters = this.intelFilters.filter(item => item.filter_type !== filter.filter_type)
        }

        if(!exists) {
          this.intelFilters.push(filter)
        } else {
          if(filter.data_type == 'start' || filter.data_type == 'end') {
            this.intelFilters = this.intelFilters.filter(item => item.filter_type !== 'start')
            this.intelFilters = this.intelFilters.filter(item => item.filter_type !== 'end')
          } else {
            this.intelFilters = this.intelFilters.filter(item => item.value !== filter.value)
          }
        }

        this.$store.commit('update_intel_filters', this.intelFilters)

        if(!['end','start'].includes(filter.filter_type)) {
          this.loadIntelValues()
        }
          
      }
    },
    filters: {
      truncate: function (value) {
          let maxLength = 75
          if (!value) return ''
          value = value.toString()
          if (value.length > maxLength) {
              return value.substring(0,maxLength) + "..."
          } else {
              return value.substring(0,maxLength)
          }
      }
    }
}
</script>
