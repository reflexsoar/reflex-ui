<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
  <CRow>
    <CCol v-if="!loading" lg="12" sm="12">
      <h2 class="page-sub-header">Audit Logs</h2>
      <CCard>
      <CDataTable
        :hover="hover"
        :striped="striped"
        :bordered="bordered"
        :small="small"
        :fixed="fixed"
        :items="audit_logs"
        :fields="fields"
        :dark="dark"
        :sorter="{external: true, resetable: true}"
        
      ><template #created_at="{item}">
        <td>{{item.created_at | moment('from','now')}}</td>
        </template>
        <template #event_type="{item}">
        <td>
          <CRow>
            <CCol lg="6">
              {{item.event_type}}
            </CCol>
          </CRow>
        </td>
      </template>
      <template #source_user="{item}">
        <td>{{item.source_user}}</td>
      </template>
      <template #organization="{item}">
        <td>
          <OrganizationBadge :uuid="item.organization"></OrganizationBadge>
        </td>
      </template>
      <template #status="{item}">
        <td><CBadge class="btn-sm" :color="getStatusColor(item.status)" disabled>{{item.status}}</CBadge></td>
      </template>
      </CDataTable>
      </CCard>
    </CCol>
    <CCol v-else lg="12" sm="12">
      <CCardBody>
      </CCardBody>
      <div style="margin: auto; text-align:center; verticle-align:middle;">
        <CSpinner
          color="dark"
          style="width:6rem;height:6rem;"
        />
      </div>
    </CCol>
  </CRow>
  <CRow>
    <CCol lg="12" sm="12">
      <CCardBody v-if="pagination.pages > 0">
        <CPagination :activePage.sync="current_page" :pages="pagination.pages"/>
      </CCardBody>
    </CCol>
  </CRow>
</div>  
</template>

<style scoped>
.unlock {
  font-weight: 700;
}
</style>

<script>
import { mapState } from "vuex";
import OrganizationBadge from "./OrganizationBadge.vue";
export default {
    name: "AuditLogs",
    props: {
        items: Array,
        fields: {
            type: Array,
            default() {
                return [
                    "created_at",
                    "event_type",
                    "source_user",
                    "message",
                    "status"
                ];
            },
        },
        caption: {
            type: String,
            default: "Table",
        },
        hover: Boolean,
        striped: Boolean,
        bordered: Boolean,
        small: Boolean,
        fixed: Boolean,
        dark: Boolean,
        alert: false
    },
    created: function () {
        this.loadData();
        if (this.current_user.default_org) {
            this.fields.splice(1, 0, "organization");
            this.organizations = this.$store.getters.organizations.map((o) => { return { label: o.name, value: o.uuid }; });
        }
    },
    computed: mapState(["current_user"]),
    data() {
        return {
            loading: true,
            current_page: 1,
            audit_logs: [],
            pagination: {},
            status_options: [
                { "name": "Success" },
                { "name": "Failed" }
            ],
            selected_status: [
                { "name": "Success" },
                { "name": "Failed" }
            ],
            event_type_options: [
                //{'name': 'Authentication'},
                { "name": "Bulk Event Insert" },
                //{'name': 'User Management'}
            ],
            selected_event_type: [
                { "name": "SSO Authentication"},
                { "name": "Authentication" },
                { "name": "Bulk Event Insert" },
                { "name": "User Management" }
            ]
        };
    },
    watch: {
        current_page: function () {
            this.loadData();
        }
    },
    methods: {
        valueRemoved(event) {
            this.selected_status = this.selected_status.filter(s => s.name != event.name);
            this.loadData();
        },
        valueAdded(event) {
            if (!this.selected_status.find(s => s === event)) {
                this.selected_status.push({ ...event });
            }
            this.loadData();
        },
        loadData: function () {
            this.loading = true;
            let selected_status = this.selected_status.map(e => e.name);
            let selected_event_type = this.selected_event_type.map(e => e.name);
            let page = this.current_page;
            this.$store.dispatch("getAuditLogs", { selected_status, selected_event_type, page }).then((resp) => {
                this.audit_logs = this.$store.getters.audit_logs;
                this.pagination = resp.data.pagination;
                this.current_page = this.pagination.page;
                this.loading = false;
            });
        },
        getStatusColor(status) {
            switch (status) {
                case "Failed": return "danger";
                default: return "success";
            }
        },
        mapOrgToName(uuid) {
            let org = this.$store.getters.organizations.filter(o => o.uuid === uuid);
            if (org.length > 0) {
                return org[0].name;
            }
            else {
                return "Unknown";
            }
        }
    },
    components: { OrganizationBadge }
};
</script>
