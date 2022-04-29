<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Observables" :centered="true" size="xl" :show.sync="modalStatus">
        <div name="create-observable-step-1" v-if="(step == 1)">
            <div>
                <p>Enter your observables below, the application will attempt to determine the basic observable type and allow you to edit it on the next page.</p>
                <CTextarea label="Observables" v-model="observables" rows="10" placeholder="Enter your observables, one per line."></CTextarea>
            </div>
        </div>
        <div name="create-observable-step-2" v-if="(step == 2)">
            <div>
                <p>The following observable types were detected, if the wrong Data Type was detected, reassign them accordingly.</p>
                <p>Note: Existing observables will not be added to the case.</p>
                <CDataTable
                  :items="new_observables"
                  :fields="observable_fields"
                  items-per-page-select
                  :items-per-page="10"
                  :striped="true"
                  :sorter='{resetable:true}'
                  pagination
                >
                <template #value="{item}">
                    <td>
                        <span v-c-tooltip="{content: `${item.value}`, placement:'bottom', appendToBody:'true'}">{{item.value | truncate}}</span>
                    </td>
                </template>
                <template #data_type="{item}">
                    <td style="padding-bottom:0px">
                        <CSelect :options="data_types" :value.sync="item.data_type.name" style="margin-bottom:0px;"/>
                    </td>
                </template>
                <template #tlp="{item}">
                    <td>
                        <CSelect 
                            :options="tlps"
                            :value.sync="item.tlp"
                            placeholder="Select a TLP"
                            style="margin-bottom:0px;"
                        >
                  </CSelect>
                    </td>
                </template>
                <template #ioc="{item}">
                    <td>
                        <CSwitch style="padding-top:3px" color="danger" label-on="Yes" label-off="No" :checked.sync="item.ioc"/>
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
                </CDataTable>
            </div>
        </div>
      <template #footer>
        <CButton @click="restart()" color="danger">Restart</CButton>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton v-if="step != 1" @click="previousStep()" color="info">Previous</CButton>
        <CButton v-if="step != final_step" @click="nextStep()" v-bind:disabled="observables == ''" color="primary">Next</CButton>
        <CButton v-if="step == final_step" @click="createObservables()" color="primary">Save</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
export default {
    name: 'AddObservableModal',
    props: {
        show: false,
        case_data: Object,
        uuid: "",
        organization: ""
    },
    data(){
        return {
            value: "",
            data_type: "",
            selected_tags: Array(),
            case_uuid: this.uuid,
            ioc: false,
            spotted: false,
            modalStatus: this.show,
            caseData: this.case_data,
            tag_list: [],
            tags: Array(),
            final_step: 2,
            step: 1,
            observables: "",
            new_observables: Array(),
            observable_fields: ['value','data_type','tlp','ioc','spotted','safe'],
            data_types: ['hash','url','domain','host','email','ip','sid','mac','user','process','imphash','fqdn','command'],
            tlps: [
                {'label': 'WHITE', 'value':1},
                {'label': 'GREEN', 'value':2},
                {'label': 'AMBER', 'value':3},
                {'label': 'RED', 'value':4}
            ]
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadTags()
                this.restart()
            }
            this.$emit('update:show', this.modalStatus)
        },
        caseData: function() {
            this.$emit('update:case_data', this.caseData)
        }
    },
    created() {
    },
    methods: {
        previousStep() {
            this.step -= 1;
            if(this.step == 1){
                this.new_observables = Array()
            }
        },
        nextStep() {
            if(this.step == 2) {
                this.final_step = true;
            }

            if(this.step == 1) {
                let observable_list = this.observables.split('\n')
                observable_list = [...new Set(observable_list)]
                for(let o in observable_list) {
                    this.new_observables.push({
                        value: observable_list[o], 
                        data_type: {
                            name: this.matchObservable(observable_list[o])
                        }, 
                        tlp:2, 
                        ioc:false, 
                        spotted:false,
                        safe:false,
                        tags:Array()
                    })
                }
            }
            this.step += 1
        },
        matchObservable (value) {
            let ip = new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)
            let email = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
            let url = new RegExp(/(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/)
            let md5hash = new RegExp(/[a-f0-9A-F]{32}/)
            let sha1hash = new RegExp(/[a-f0-9A-F]{40}/)
            let sha256hash = new RegExp(/[a-f0-9A-F]{64}/)
            let mac = new RegExp(/^([A-Za-z0-9]{2}\:?\-?){6}$/)
            let sid = new RegExp(/^S(\-\d{1,10}){4,7}$/)
            if(ip.test(value)) {
                return 'ip';
            }
            if(email.test(value)) {
                return 'email';
            }
            if(url.test(value)) {
                return 'url'
            }
            if(md5hash.test(value) || sha1hash.test(value) || sha256hash.test(value)) {
                return 'hash'
            }
            if(mac.test(value)) {
                return 'mac'
            }
            if(sid.test(value)) {
                return 'sid'
            }
            return 'host'
        },
        createObservables() {
            let uuid = this.uuid;
            let data = {'observables': []}
            data['organization'] = this.organization
            for(let observable in this.new_observables) {
                let exists = false;
                let obs = this.new_observables[observable]
                for(let obx in this.caseData.observables) {
                    if(obs.value == this.caseData.observables[obx].value) {
                        exists = true
                    }
                }
                if(!exists) {
                    obs.data_type = obs.data_type.name
                    data['observables'].push(obs)
                }
            }
            this.$store.dispatch('bulkAddObservablesToCase', {uuid, data})
            this.modalStatus = false;
        },
        loadTags: function() {
            this.tag_list = Array()
            this.$store.dispatch('getTags').then(resp => {
                for(let i in resp.data) {
                    this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
                }
            })},
        restart() {
            this.new_observables = Array()
            this.step = 1
            this.observables = ""
        },
        dismiss() {
            this.modalStatus = false
            this.selected_tags = Array()
            this.new_observables = Array()
            this.step = 1
            this.observables = ""
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        }
    },
    filters: {
        truncate: function (value) {
            let maxLength = 50
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