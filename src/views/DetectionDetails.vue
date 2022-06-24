<template>
    <CRow>
        <CCol>
            <CRow>
                <CCol>
                    <h1>{{detection.name}}</h1>
                    <p><b>Last Run:</b> {{detection.last_run | moment('MMMM Do YYYY, h:mm:ss a')}} ({{detection.last_run | moment('from','now') }})</p>
                    
                </CCol>
                <CCol col="1" class='text-right'>
                    BUTTONS HERE
                </CCol>
            </CRow>
            <CRow>
                <CCol col="8">
                    <CRow>
                        <CCol>
                            <CCard>
                                <CCardHeader>
                                    <b>About</b>
                                </CCardHeader>
                                <CCardBody>
                                    <p>{{detection.description}}</p>
                                    <p><b>Created By: </b> {{detection.created_by.username}}</p>
                                    <p><b>False Positives</b><br>
                                    <li v-for="fp,i in detection.false_positives" :key="i">
                                        {{fp}}
                                    </li></p>
                                    <p><b>References</b><br>
                                    <li v-for="ref,i in detection.references" :key="i">
                                        <a v-bind:href="ref" target="_">{{ref}}</a>
                                    </li></p>
                                    <p><b>MITRE ATT&CK Tactics</b> <li style="display: inline; margin-right: 2px;" v-for="t in detection.tactics" :key="t.name"><CButton color="primary" size="sm" disabled="">{{ t.name }}</CButton></li></p>
                                    <p><b>MITRE ATT&CK Techniques</b> <li style="display: inline; margin-right: 2px;" v-for="t in detection.techniques" :key="t.name"><CButton color="primary" size="sm" disabled="">{{ t.name }}</CButton></li></p>
                                    <p><b>Tags</b> <li style="display: inline; margin-right: 2px;" v-for="tag in detection.tags" :key="tag"><CButton color="primary" size="sm" disabled="">{{ tag }}</CButton></li></p>
                                    
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CCol>
                <CCol>
                    <CRow>
                        <CCol>
                            <CCard>
                                <CCardHeader>
                                    <b>Configuration</b>
                                </CCardHeader>
                                <CCardBody>
                                    <p><b>Source Input</b><br>{{detection.source.name}}</p>
                                    <p><b>Detection Type</b><br>{{detectionType(detection.rule_type)}}</p>
                                    <p><b>Base Query</b><br>{{detection.query.query}}</p>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol>
                            <CCard>
                                <CCardHeader>
                                    <b>Schedule</b>
                                </CCardHeader>
                                <CCardBody>
                                    <p><b>Runs Every: </b> {{detection.interval}} minutes</p>
                                    <p><b>Look Behind: </b> {{detection.lookbehind}} minutes</p>
                                    <p><b>Mute Period: </b> {{detection.mute_period}} minutes</p>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardBody class='tabbed'>
                            <CTabs>
                                <CTab title="Hits">
                                    <CCardBody>
                                        Coming Soon
                                    </CCardBody>
                                </CTab>
                                <CTab title="Exclusions">
                                    <CDataTable
                                        :items="detection.exceptions"
                                        :fields="['field','condition','values',{key: 'list', label:'Intel List'},{key: 'admin', label: ''}]">
                                        <template #admin="{item}">
                                        <td class="text-right">
                                            <CButton aria-label="Edit Exclusion"  size="sm" color="info" v-c-tooltip="{content:'Edit Exclusion', placement:'left'}"><CIcon name='cilPencil'/></CButton>&nbsp;
                                            <CButton aria-label="Delete Exclusion"  size="sm" color="danger" v-c-tooltip="{content:'Delete Exclusion', placement:'left'}"><CIcon name='cilTrash'/></CButton>
                                        </td>
                                        </template>
                                        <template #values="{item}">
                                        <td>
                                            <li style="display: inline; margin-right: 2px;" v-for="value in item.values" :key="value"><CButton color="primary" size="sm" disabled>{{ value }}</CButton></li>
                                        </td>
                                        </template>
                                        <template #list="{item}">
                                        <td>
                                            <span v-if="item.list.name !== null"><CButton color="primary" size="sm" disabled>{{item.list.name}}</CButton></span>
                                        </td>
                                        </template>
                                        </CDataTable>
                                </CTab>
                                <CTab title="Log">
                                    <CCardBody>
                                        Coming Soon
                                    </CCardBody>
                                </CTab>
                            </CTabs>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CCol>
        {{detection}}
    </CRow>
</template>
<script>
import {mapState} from "vuex";
import moment from 'moment';

export default {
    name: 'DetectionDetails',
    computed: mapState(['detection']),
    data () {
        return {
            uuid: this.$route.params.uuid
        }
    },
    created() {
        this.getDetection(this.uuid)
    },
    methods: {
        getDetection(uuid) {
            this.$store.dispatch('getDetection', uuid)
        },
        detectionType(i){
            return ["Match", "Threshold", "Metric Change", "Field Mismatch"][i]
        }
    }
}
</script>