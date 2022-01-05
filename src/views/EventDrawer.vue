<template>
  <CRightDrawer 
    fixed 
    :minimize="minimize"
    :show="show"
    :aside="true"
    :narrow="true"
    colorScheme="light"
    @update:show="(value) => $store.commit('set', ['eventDrawerShow', value])"
  >
  <CCardBody>
    <h1><CRow>
      <CCol>{{event_data.title}}</CCol>
      <CCol col="3" class="text-right"><CButton color="secondary"
        @click="$store.commit('set', ['eventDrawerMinimize', true])"
      >Close</CButton></CCol>
    </CRow></h1>
    <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in event_data.tags" :key="tag.name"><CButton color="dark" class="tag" size="sm">{{ tag }}</CButton></li><br><br>
    <p><b>Description:</b><br>{{event_data.description}}</p>
    <h2>Raw Log</h2>
    <vue-json-pretty :showLength="true" selectableType="multiple" :path="'res'" :data="jsonify(event_data.raw_log)"></vue-json-pretty><br>
    <h2>Observables</h2>
    <CDataTable
        :hover="true"
        :items="event_data.observables"
        :fields="observable_fields"
        :items-per-page="10"
        bordered
        striped
        pagination
    >
        <template #value="{item}">
            <td>
                <b>{{item.value}}</b><br><small>{{item.source_field.toLowerCase()}} | {{item.data_type}}</small>
            </td>
        </template>
        <template #ioc="{item}">
            <td>
                <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.ioc" disabled/>
            </td>
        </template>
        <template #spotted="{item}">
            <td>
                <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.spotted"/>
            </td>
        </template>
        <template #safe="{item}">
            <td>
                <CSwitch style="padding-top:3px" color="success" label-on="Yes" label-off="No" :checked.sync="item.safe"/>
            </td>
        </template>
        <template #tags="{item}">
            <td>
                <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled>{{ tag }}</CButton></li>
            </td>
      </template>
    </CDataTable>
  </CCardBody>
  
  </CRightDrawer>
</template>

<style scoped>

.c-sidebar {
  width: 60% !important;
  overflow-y: scroll;
}

.c-sidebar.c-sidebar-fixed {
  z-index: 1302;
}

.c-sidebar-minimized.c-sidebar-fixed {
    width: 0px !important;
    z-index: 1302;
}
</style>

<script>
import nav from '../containers/_nav'
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import CRightDrawer from './CRightDrawer'

export default {
  name: 'EventDrawer',
  nav,
  props: {
      event_data: {}
  },
  components: {
    VueJsonPretty,
    CRightDrawer
  },
  created: function() {
    if (this.$store.state.unread_alert_count > 0) {
      nav[0]._children[1]['badge'] = {'color': 'danger', 'text': this.$store.state.unread_alert_count}
    }
  },
  data() {
    return {
      observable_fields: ['value', 'ioc', 'spotted', 'safe', 'tags']
    }
  },
  computed: {
    show () {
      return this.$store.state.eventDrawerShow 
    },
    minimize () {
      return this.$store.state.eventDrawerMinimize 
    }
  },
  methods: {
    jsonify(s) {
        try {
            return JSON.parse(s)
        } catch (e) {
            return s
        }
    }
  }
}
</script>
