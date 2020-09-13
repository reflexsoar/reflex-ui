<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Case" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
        <p v-if="events && events.length > 1">This case will be associated with <b>{{events.length}}</b> events.</p>
        <CForm @submit.prevent="createCase" >
            <CInput
              placeholder="Case Title"
              required
              v-model="title"
              label="Case Title"
            >
            </CInput>
            <label style="text-align:center; vertical-align:middle; padding-bottom:.8em">Assign Case Template?</label>&nbsp;&nbsp;&nbsp;<CSwitch color="success" label-on="Yes" label-off="No" v-bind:checked.sync="use_case_template"/>
            <CSelect 
                label="Case Template"
                :options="[]"
                v-model="case_template"
                placeholder="Select a case template"
                v-if="use_case_template"
              >
              </CSelect>
            <CTextarea
              placeholder="Enter a description for the case.  The more detail the better."
              required
              :v-model.sync="description"
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
                <multiselect v-model="selected_tags" placeholder="Select tags to apply to this input" :taggable="true" tag-placeholder="Add new tag" track-by="name" label="name" :options="tag_list" :multiple="true" @tag="addTag">
                </multiselect>
            </div>
        </CForm>
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton @click="createCase()" color="primary">Create</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
export default {
    name: 'CreateCaseModal',
    props: {
        show: false,
        events: Array(),
    },
    data(){
        return {
            title: "",
            description: "",
            selected_tags: Array(),
            use_case_template: false,
            case_template: "",
            tlp: 2,
            severity: 2,
            modalStatus: this.show,
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
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadTags()
            }
            this.$emit('update:show', this.modalStatus)
        }
    },
    created() {
        this.loadTags()
    },
    methods: {
        createCase() {
            let title = this.title;
            let description = this.description;
            let events = [];
            let severity = this.severity;
            let tlp = this.tlp;
            let tags = Array();

            if(this.events) {
                for(let evt in this.events) {
                    events.push(this.events[evt])
                }
            }

            for(let tag in this.selected_tags) {
                tags.push(this.selected_tags[tag].name)
            }
            console.log(title,description,events,tlp,severity,tags);
            this.$store.dispatch('createCase', {title,description,events,tlp,severity,tags})
            .then(resp => {
                if(resp.status == 200) {
                    this.modalStatus = false
                    let case_uuid = resp.data.uuid
                    this.$router.push({name:'view_case', params:{uuid:case_uuid}})
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
            })},
        dismiss() {
            this.use_case_template = false
            this.modalStatus = false
            this.selected_tags = Array()
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
            console.log(this.selected_tags)
        }
    }
}
</script>