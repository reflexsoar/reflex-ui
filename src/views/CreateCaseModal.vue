<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Case" :centered="true" size="xl" :show.sync="modalStatus">
      <div>
        <p v-if="related_events_count > 1">This case will be associated with <b>{{related_events_count}}</b> events.</p>
        <CForm @submit.prevent="createCase" >
            <CInput
              placeholder="Case Title"
              required
              v-model="title"
              label="Case Title"
            >
            </CInput>
            <label style="text-align:center; vertical-align:middle; padding-bottom:.8em">Assign Case Template?</label>&nbsp;&nbsp;&nbsp;<CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="use_case_template" v-bind:disabled="settings.require_case_templates"/>
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
                    @search-change="caseTemplateFind">
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
                @search-change="usersFind">
            </multiselect><br>
            <CTextarea
              placeholder="Enter a description for the case.  The more detail the better."
              required
              v-model="description"
              label="Description"
              rows=5
            >
            </CTextarea>
            <CRow>
              <CCol col="12" lg="6">
                <CSelect 
                    label="TLP"
                    :options="tlps"
                    :value.sync="tlp"
                    placeholder="Select a TLP"
                  >
                  </CSelect>
              </CCol>
              <CCol col="12" lg="6">
                <CSelect 
                    label="Severity"
                    :options="severities"
                    :value.sync="severity"
                    placeholder="Select a Severity"
                  >
                  </CSelect>
              </CCol>
            </CRow>
            <div role="group" class="form-group">
                <label class="typo__label">Tags</label>
                <multiselect v-model="selected_tags" placeholder="Select tags to apply to this input" :taggable="true" tag-placeholder="Add new tag" track-by="name" label="name" :options="tag_list" :multiple="true" @tag="addTag" :close-on-select="false">
                </multiselect>
            </div>
            <label>Generate Event Rule</label><br><CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="generate_event_rule"/><br>
            <small class="form-text text-muted w-100">When enabled all future events will be merged into this case.</small><br>
        </CForm>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton @click="createCase()" color="primary" v-bind:disabled.sync="submitted"><CSpinner color="success" size="sm" v-if="submitted"/><span v-else>Create</span></CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState} from 'vuex';
export default {
    name: 'CreateCaseModal',
    props: {
        show: Boolean,
        events: Array,
        related_events_count: Number,
        case_from_card: Boolean
    },
    computed: mapState(['settings']),
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
            tags: Array
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
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
            this.applyCaseTemplate()
        },
        use_case_template: function() {
            if(!this.use_case_template) {
                this.case_template = null
            }
            
            this.applyCaseTemplate()
        }
    },
    created() {
    },
    methods: {
        usersFind(query) {
            this.$store.dispatch('getUsersByName', query).then(resp => {
                this.users = this.$store.getters.users
            })
        },
        applyCaseTemplate() {
            if(this.case_template) {
                this.severity = this.case_template.severity
                this.tlp = this.case_template.tlp
            }

            // Remove tags when the template was changed
            // removing only case template tags
            for(let tag in this.selected_tags) {
                if('from_template' in this.selected_tags[tag]) {
                    this.selected_tags.splice(tag, 1)
                }
            }

            // Add the tags from the new case template
            if(this.case_template) {
                for(let tag in this.case_template.tags) {
                    if(this.selected_tags.filter(t => t.uuid === this.case_template.tags[tag].uuid).length < 1) {
                        console.log(this.case_template.tags[tag])
                        this.selected_tags.push({'name': this.case_template.tags[tag]})
                    }
                }
            }
        },
        loadUsers() {
            this.$store.dispatch('getUsers').then(resp => {
                this.users = this.$store.getters.users
            })
        },
        loadCaseTemplates() {

        },
        loadData() {
            this.$store.dispatch('getCaseTemplateList', '').then(resp => {
                this.case_templates = resp.data
            })
        },
        caseTemplateFind(query) {
            this.$store.dispatch('getCaseTemplateList', query).then(resp => {
                this.case_templates = resp.data
            })
        },
        createCase() {
            this.submitted = true
            let title = this.title;
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

            let request_data = {title,description,events,tlp,severity,tags,generate_event_rule, include_related_events}
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