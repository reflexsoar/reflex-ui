<template>
  <div>
    <CCard class="event-card">
      <CCardHeader :class="getCardAccent(event.severity)">
        <CRow>
          <CCol>
            <h5 class="event-title">
              <input type="checkbox" aria-label="Select Card" />&nbsp;{{ event.title }}
            </h5>
          </CCol>
          <CCol class="text-right">            
            <CButtonGroup>
                    <CButton aria-label="Create Event Rule" size="sm" color="info" @click="createEventRule(event.signature, event.uuid)" v-c-tooltip="{'content':'Create Event Rule','placement':'bottom'}"><CIcon name='cilGraph'/></CButton>
                    <CButton aria-label="Create Case" @click="caseFromCard(event.uuid)" v-if="event.status.name === 'New'" size="sm" color="secondary" v-c-tooltip="{'content':'Create Case','placement':'bottom'}"><CIcon name="cilBriefcase"/></CButton>
                    <!--<CButton aria-label="View Event" @click="showDrawer(event.uuid)" size="sm" color="secondary" v-c-tooltip="{'content':'View Event','placement':'bottom'}"><CIcon name="cilMagnifyingGlass"/></CButton>-->
                    <CButton aria-label="View Event" @click="show_event_details = !show_event_details" size="sm" color="secondary" v-c-tooltip="{'content':'View Event','placement':'bottom'}"><CIcon name="cilMagnifyingGlass"/></CButton>
                    <CButton aria-label="Add Comment" @click="showEventCommentModal(event.uuid)" size="sm" color="secondary" v-c-tooltip="{'content':'Add Comment','placement':'bottom'}"><CIcon name="cilCommentBubble"/> {{event.total_comments ? event.total_comments : 0}}</CButton>
                    <CButton aria-label="Reopen Event" v-if="event.status.closed" @click="reopenEvent(event.uuid)" v-c-tooltip="{'content':'Reopen Event','placement':'bottom'}" size="sm" color="success"><CIcon name="cilEnvelopeOpen"/></CButton>
                    <CButton aria-label="View Case" v-if="event.case" size="sm" color="secondary" :to="`/cases/${event.case}`" v-c-tooltip="{'content':'View Case','placement':'bottom'}"><CIcon name="cil-folder-open"/></CButton>
                    <CButton aria-label="Dismiss Event" v-if="!event.status.closed" color="danger" size="sm" @click="dismissEventFromCard(event.uuid)" v-c-tooltip="{'content':'Dismiss Event','placement':'bottom'}"><CIcon name="cilDeaf"/></CButton>
                  </CButtonGroup>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
          {{ event.description }}
          </CCol>
        </CRow>
        <CRow style="padding-top:5px;">
            <CCol>
            <CIcon name="cilCenterFocus" />&nbsp;
                    <li
                        style="display: inline; margin-right: 2px"
                        v-for="obs in event.observables"
                        :key="obs.uuid"
                    >
                        <CButton
                        color="secondary"
                        class="tag"
                        v-c-tooltip="{ content: encodeURI(obs.value) }"
                        size="sm"
                        style="margin-top:5px; margin-bottom:5px;padding-top: 0px; padding-bottom: 0px;"
                        ><b>{{
                            obs.source_field ? obs.source_field.toLowerCase() : obs.data_type
                        }}</b
                        >: {{ obs.value.toLowerCase() | truncate }}</CButton
                        >
                    </li>
                    <span
                        v-if="event.observables.length > 10"
                        style="cursor: pointer"
                        v-c-popover="{ header: 'Additional Observables', content: '' }"
                        ><small></small></span
                    ><br />
                    </CCol>
                    </CRow>
        
      </CCardHeader>
      <CCollapse :show="show_event_details">
        <CCardBody style="padding:0px">
            <CTabs :fill="true" variant="tabs" :fade="false">
            <CTab title="Observables" style="overflow-y: scroll; max-height: 400px;">
              <CDataTable :hover="true" :items="event.observables" :fields="observable_fields" :items-per-page="10"
                bordered size="sm" :columnFilter='{ external: false, lazy: false }'>
                <template #value="{ item }">
                  <td>
                    <b>{{ item.value }}</b><br><small>{{ item.source_field ? item.source_field.toLowerCase() : 'none' }} |
                      {{ item.data_type }}</small>
                  </td>
                </template>
                <template #ioc="{ item }">
                  <td>
                    <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No"
                      :checked.sync="item.ioc" :disabled.sync="item.safe"
                      v-on:change.native="toggleISS(event.uuid, item.value, 'ioc', item.ioc)" />
                  </td>
                </template>
                <template #spotted="{ item }">
                  <td>
                    <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No"
                      :checked.sync="item.spotted"
                      v-on:change.native="toggleISS(event.uuid, item.value, 'spotted', item.spotted)" />
                  </td>
                </template>
                <template #safe="{ item }">
                  <td>
                    <CSwitch style="padding-top:3px" color="success" label-on="Yes" label-off="No"
                      :checked.sync="item.safe" :disabled.sync="item.ioc"
                      v-on:change.native="toggleISS(event.uuid, item.value, 'safe', item.safe)" />
                  </td>
                </template>
                <template #tags="{ item }">
                  <td>
                    <CIcon name='cilTags' />&nbsp;<li style="display: inline; margin-right: 2px;"
                      v-for="tag in item.tags" :key="tag">
                      <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
                    </li>
                  </td>
                </template>
              </CDataTable>
            </CTab>
            <CTab title="Raw Log">
                <CRow  class="event-card-tab-row">
                    <CCol>
                    <h5>Raw Log</h5>
                    <json-view :data="event" rootKey="/" :maxDepth="3" style="max-height: 250px; overflow-y: scroll"/> 
                    </CCol>
                </CRow>
            </CTab>
            <CTab title="Event Rules" v-bind:disabled="!event.event_rules">
                {{event.event_rules}}
            </CTab>
            <CTab title="Detections">

            </CTab>
            <CTab title="Comments">
            </CTab>
            </CTabs>
          </CRow>
        </CCardBody>
      </CCollapse>
      <CCardFooter  style="background-color: #f5f5f5; padding: 10px">
      <CRow>
            <CCol>
                <small>
                    <CButton @click="toggleObservableFilter({'filter_type':'severity', 'data_type':'severity', 'value':event.severity})" class="tag" :color="getSeverityColor(event.severity)" size="sm">{{getSeverityText(event.severity)}}</CButton>
                    <span class="separator" v-if="event.risk_score">|</span><CButton v-if="event.risk_score" class="tag" :color="getSeverityColor(event.severity)" size="sm">Risk: {{event.risk_score}}</CButton>
                    <span v-if="!filteredBySignature() && event.related_events_count > 1" class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'signature','data_type':'signature','value':event.signature})" v-if="!filteredBySignature() && event.related_events_count > 1" color="dark" size="sm">{{event.related_events_count}} occurrences <span v-if="event.related_events_count > 0"></span></CButton>                    
                    <span class="separator">|</span><CButton class="tag" @click="toggleObservableFilter({'filter_type':'status', 'data_type':'status', 'value': event.status.name})" size="sm" color="info">{{event.status.name}}</CButton>
                    <span  v-if="event.status.closed && event.dismiss_reason"><span class="separator">|</span><b>Dismiss Reason:</b> {{event.dismiss_reason.title }}</span>
                    <span class="separator">|</span>Created {{event.original_date | moment('LLLL') }}
                    <span class="separator">|</span><b>Reference:</b> {{event.reference}}
                    <span class="separator">|</span><CIcon name='cilVector' v-c-tooltip="{content: 'Event Rules Matched'}"></CIcon> {{event.event_rules ? event.event_rules.length : 0 }}
                    <span v-if="current_user.default_org"><span class="separator">|</span></span></small><span style="cursor: pointer" @click="toggleObservableFilter({'filter_type':'organization','data_type':'organization','value':event.organization})"><OrganizationBadge v-if="current_user.default_org" :uuid="event.organization" color="warning" /></span>
                </small>
            </CCol>
        </CRow>
        </CCardFooter>
      <CCardFooter style="background-color: #f5f5f5; padding: 10px">
        <CRow>
          <CCol>
            <CIcon name="cilTags" />&nbsp;
            <li
              style="display: inline; margin-right: 2px"
              v-for="tag in event.tags"
              :key="tag"
            >
              <CBadge color="dark" style="font-weight: normal; padding: 5px" size="sm">{{
                tag
              }}</CBadge>
            </li>
          </CCol>
        </CRow>
      </CCardFooter>
    </CCard>
  </div>
</template>

<style>
.separator {
  margin-left: 10px;
  margin-right: 10px;
}
.event-title {
  margin-bottom: 0px;
}
.event-card-tab-row {
    padding: 10px;
}
.event-accent-dark {
  border-left: 3px solid #535d6d !important;
}
.event-accent-info {
  border-left: 3px solid #0073e6 !important;
}
.event-accent-warning {
  border-left: 3px solid #f9b115 !important;
}
.event-accent-danger {
  border-left: 3px solid #eb0000 !important;
}
.event-card {
  margin-bottom: 10px;
}
</style>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "../OrganizationBadge.vue";

export default {
  name: "EventCard",
  components: {
    OrganizationBadge,
  },
  computed: {
    ...mapState(["current_user"]),
  },
  props: {
    event: {
      type: Object,
      required: true,
    },
    uuid: String,
  },
  data() {
    return {
      show_event_details: false,
      observable_fields: ['value', 'data_type', 'ioc', 'spotted', 'safe', 'tags']
    };
  },
  methods: {
    getCardAccent(severity) {
      switch (severity) {
        case 1:
          return "event-accent-dark";
        case 2:
          return "event-accent-info";
        case 3:
          return "event-accent-warning";
        case 4:
          return "event-accent-danger";
        default:
          return "event-accent-danger";
      }
    },
    jsonify(s) {
      try {
        return JSON.parse(s);
      } catch (e) {
        return s;
      }
    },
    filteredBySignature() {

    },
    toggleObservableFilter() {

    },
    getSeverityText(severity) {
        switch(severity) {
          case 1: return 'Low';
          case 2: return 'Medium';
          case 3: return 'High';
          case 4: return 'Critical';
          default: return 'Unknown';
        }
      },
      getSeverityColor(severity) {
        switch(severity) {
          case 1: return 'dark';
          case 2: return 'info';
          case 3: return 'warning';
          case 4: return 'danger';
          default: return 'danger';
        }
      },
      createEventRule() {},
      caseFromCard() {},
      showDrawer() {},
      showEventCommentModal() {},
      reopenEvent() {},
      dismissEventFromCard() {},
      toggleISS() {}
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
