<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Case" :centered="true" size="xl" :show.sync="modalStatus">
      <div>
        <p v-if="related_events_count > 1">This case will be associated with <b>{{related_events_count}}</b> events.</p>{{selected_org}}
        <CForm @submit.prevent="createCase()" id="create_case_form">
            <CSelect
                  v-if="current_user.default_org"
                  placeholder="Select an Organization..."
                  required
                  :value.sync="organization"
                  :options="formattedOrganizations()"
                  @change="refreshDropdowns($event)"
                  label="Organization"
                />
            <CInput
              placeholder="Case Title"
              required
              v-model="title"
              label="Case Title"
              v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
            >
            </CInput>
            <label style="text-align:center; vertical-align:middle; padding-bottom:.8em">Assign Case Template?</label>&nbsp;&nbsp;&nbsp;<CSwitch aria-label="Assign Case Template" color="success" label-on="Yes" label-off="No" v-bind:checked.sync="use_case_template" v-bind:disabled="settings.require_case_templates"/>
            <div role="group" class="form-group" v-if="use_case_template">
                <multiselect 
                    v-model="case_template" 
                    label="title" 
                    :options="case_templates" 
                    track-by="uuid" 
                    :searchable="true"
                    :internal-search="false"
                    :options-limit="10"
                    :show-no-results="false" 
                    @search-change="caseTemplateFind"
                    v-bind:disabled="current_user.role.permissions.view_organizations && organization == null">
                    <template slot="option" slot-scope="props">
                        {{props.option.title}}</br>
                        <small>{{props.option.description}}<br>Contains {{props.option.task_count}} tasks.</small>
                    </template>
                </multiselect>
            </div><br v-else>
            <span v-if="case_template && case_template.task_count > 0"><label>Tasks</label><br><b>{{case_template.task_count}}</b> tasks will be added automatically to this case.<br><br></span><label>Case Owner</label>
            <multiselect 
                v-model="owner" 
                label="username" 
                :options="users" 
                track-by="username" 
                :searchable="true"
                :internal-search="false"
                :options-limit="25"
                :show-no-results="false"
                @search-change="usersFind"
                aria-label="Case Owner"
                v-bind:disabled="current_user.role.permissions.view_organizations && organization == null">
            </multiselect><br>
            <CTextarea
              placeholder="Enter a description for the case.  The more detail the better."
              required
              v-model="description"
              label="Description"
              description="HINT: Use markdown to create a beautiful description."
              rows=5
              v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
            >
            </CTextarea>
            <CRow>
              <CCol col="12" lg="6">
                <CSelect 
                    label="TLP"
                    :options="tlps"
                    :value.sync="tlp"
                    placeholder="Select a TLP"
                    v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
                  >
                  </CSelect>
              </CCol>
              <CCol col="12" lg="6">
                <CSelect 
                    label="Severity"
                    :options="severities"
                    :value.sync="severity"
                    placeholder="Select a Severity"
                    v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
                  >
                  </CSelect>
              </CCol>
            </CRow>
            <div role="group" class="form-group">
                <label class="typo__label">Tags</label>
                <multiselect 
                    v-model="selected_tags" 
                    placeholder="Select tags to apply to this input"
                    :taggable="true"
                    tag-placeholder="Add new tag"
                    track-by="name"
                    label="name"
                    :options="tag_list"
                    :multiple="true"
                    @tag="addTag"
                    :close-on-select="false"
                    aria-label="Tags"
                    v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"
                >
                </multiselect>
            </div>
            <span v-if="case_from_card">
                <label>Generate Event Rule</label><br><CSwitch aria-label="Generate Event Rule" color="success" label-on="Yes" label-off="No" v-bind:checked.sync="generate_event_rule" v-bind:disabled="current_user.role.permissions.view_organizations && organization == null"/><br>
                <small class="form-text text-muted w-100">When enabled all future events will be merged into this case.</small><br>
            </span>
        </CForm>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton type="submit" form="create_case_form" color="primary" v-bind:disabled.sync="submitted"><CSpinner color="success" size="sm" v-if="submitted"/><span v-else>Create</span></CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor';
import {vSelect} from "vue-select";
import { mapState} from 'vuex';
import OrganizationMultiSelect from './inputs/OrganizationMultiSelect'
export default {
    name: 'CreateCaseModal',
    components: {
        OrganizationMultiSelect
    },
    props: {
        show: Boolean,
        events: Array,
        related_events_count: Number,
        case_from_card: Boolean,
        organization: {
            type: String,
            default: null
        }
    },
    computed: mapState(['settings','current_user']),
    data(){
        return {
            title: "",
            description: "",
            selected_tags: Array(),
            use_case_template: false,
            case_templates: [],
            case_template: null,
            tlp: 2,
            users:[],
            owner: null,
            severity: 2,
            submitted: false,
            modalStatus: this.show,
            generate_event_rule: false,
            severities: [
                {'label':'Low', 'value':1},
                {'label':'Medium', 'value':2},
                {'label':'High', 'value':3},
                {'label':'Critical', 'value':4}
            ],
            tlps: [
                {'label': 'WHITE', 'value':1},
                {'label': 'GREEN', 'value':2},
                {'label': 'AMBER', 'value':3},
                {'label': 'RED', 'value':4}
            ],
            tag_list: [],
            tags: Array,
            default_tlp: 2,
            default_severity: 2,
            default_tags: Array(),
            error: false,
            error_message: "",
            selected_org: null
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show

            if(this.organization) {
                this.selected_org = this.organization
            }
            
            if(!this.organization) {
                if(this.current_user.default_org) {
                    this.organization = this.$store.getters.organizations[0].uuid
                }
            }
        },
        settings: function() {
            this.use_case_template = this.settings.require_case_templates
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadTags()
                this.loadData()
                this.loadUsers()
            }
            this.$emit('update:show', this.modalStatus)
            if(!this.modalStatus) {
                this.reset()
            }
        },
        case_template: function() {
            if(this.case_template === null) {
                this.removeCaseTemplate()
            } else {
                this.applyCaseTemplate()
            }            
        },
        use_case_template: function() {
            if(!this.use_case_template) {
                this.case_template = null
                //this.removeCaseTemplate()
            }            
            this.applyCaseTemplate()
        }
    },
    created() {
        
    },
    methods: {
        selectOrg(org) {
            this.selected_org = org
        },
        formattedOrganizations() {            
            return this.$store.getters.organizations.map((o) => { return {label: o.name, value: o.uuid}})
        },
        usersFind(query) {
            let organization = this.organization
            this.$store.dispatch('getUsersByName', {username: query, organization: organization}).then(resp => {
                this.users = this.$store.getters.users
            })
        },
        refreshDropdowns(event) {
            this.loadUsers()
            this.caseTemplateFind('')
        },
        removeCaseTemplate() {
            this.tlp = this.default_tlp
            this.severity = this.default_severity
            this.selected_tags = this.default_tags
        },
        applyCaseTemplate() {

            if(this.case_template) {

                this.default_severity = this.severity
                this.severity = this.case_template.severity

                this.default_tlp = this.tlp
                this.tlp = this.case_template.tlp

                this.default_tags = this.selected_tags
                this.selected_tags = this.case_template.tags
                for(let tag in this.default_tags) {
                    this.selected_tags.push(this.default_tags[tag])
                }
            }
        },
        loadUsers() {
            let organization = this.organization
            this.$store.dispatch('getUsers', {organization:organization}).then(resp => {
                this.users = this.$store.getters.users
            })
        },
        loadData() {
            let organization = this.organization
            this.$store.dispatch('getCaseTemplateList', {title:'', organization: organization}).then(resp => {
                this.case_templates = resp.data
            })
        },
        caseTemplateFind(query) {
            let organization = this.organization
            this.$store.dispatch('getCaseTemplateList', {title: query, organization: this.organization}).then(resp => {
                this.case_templates = resp.data
            })
        },
        createCase() {
            this.submitted = true
            let title = this.title;
            let organization = this.organization;
            let description = this.description;
            let events = [];
            let severity = this.severity;
            let tlp = this.tlp;
            let tags = Array();
            let include_related_events = this.case_from_card
            let generate_event_rule = this.generate_event_rule

            if(this.events) {
                for(let evt in this.events) {
                    events.push(this.events[evt])
                }
            }

            for(let tag in this.selected_tags) {
                tags.push(this.selected_tags[tag].name)
            }

            let request_data = {title,organization,description,events,tlp,severity,tags,generate_event_rule, include_related_events}
            if(this.owner) {
                request_data['owner_uuid'] = this.owner.uuid
            }

            if(this.case_template) {
                let case_template_uuid = this.case_template.uuid;
                request_data['case_template_uuid'] = case_template_uuid
            }

            this.$store.dispatch('createCase', request_data)
            .then(resp => {
                if(resp.status == 200) {
                    this.modalStatus = false
                    let case_uuid = resp.data.uuid
                    this.$router.push({name:'View Case', params:{uuid:case_uuid}})
                }
            })
            .catch(err => {
                console.log(err)
            })
        },
        loadTags: function() {
            this.tag_list = Array()
            this.$store.dispatch('getTags').then(resp => {
                for(let i in resp.data) {
                    this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
                }
            })
        },
        reset () {
            this.use_case_template = this.settings.require_case_templates
            this.case_template = null
            this.severity = 2
            this.tlp = 2
            this.selected_tags = Array()
        },
        dismiss() {
            this.reset()
            this.modalStatus = false            
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        }
    }
}
</script>