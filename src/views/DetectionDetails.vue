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
                                    <p><b>Created By: </b> {{detection.created_by.username}} on {{ detection.created_at| moment('MMMM Do YYYY, h:mm:ss a') }}</p>
                                    <p v-if="detection.updated_by"><b>Updated By: </b> {{detection.updated_by.username}}, {{ detection.updated_at| moment('from','now')  }}</p>
                                    <p><b>False Positives</b><br>
                                    <li v-for="fp in detection.false_positives" :key="fp">
                                        {{fp}}
                                    </li></p>
                                    <p><b>References</b><br>
                                    <li v-for="ref in detection.references" :key="ref">
                                        <span v-if="ref.startsWith('http')">{{ref}}&nbsp;<a _target="_child" :href="ref" target="_blank"><CIcon name='cil-external-link' size="sm"/></a></span>
                                        <span v-else>{{ref}}</span>
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
                                    <p><b>Base Query</b><br><div class="query">{{detection.query.query}}</div></p>
                                    <p><b>Severity</b><br><CButton class="tag" size="sm" :color="$store.getters.severity_color(detection.severity)">{{$store.getters.severity_text(detection.severity)}}</CButton></p>
                                    <p><b>Risk Score</b><br><CProgress max=50000 :value="detection.risk_score" show-value :color="riskScoreColor(detection.risk_score)"/></p>
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
                            <CTabs :activeTab.sync="activeTab">
                                <CTab title="Hits">
                                    <CCardBody>
                                        <CDataTable
                                            :items="detection_hits"
                                        >
                                        <template #severity="{item}">
                                            <td>
                                                <CButton class="tag" size="sm" :color="$store.getters.severity_color(item.severity)">{{$store.getters.severity_text(item.severity)}}</CButton>
                                            </td>
                                        </template>
                                        <template #risk_score="{item}">
                                            <td>
                                                <CProgress v-if="item.risk_score" max=50000 :value="item.risk_score" :color="riskScoreColor(detection.risk_score)" show-value/>
                                            </td>
                                        </template>
                                        <template #tags="{item}">
                                            <td>
                                                <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="primary" size="sm" disabled="">{{ tag }}</CButton></li>
                                            </td>
                                        </template>
                                        </CDataTable>
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
    </CRow>
</template>
<style scoped>

.query {
    background: #0e0e0e;
    color: #ccc !important;
    border: 1px solid rgb(216, 219, 224);
    border-radius: 0.25rem;
    box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
    padding-left: 10px;
}

</style>
<script>
import {mapState} from "vuex";
import moment from 'moment';

export default {
    name: 'DetectionDetails',
    computed: mapState(['detection','detection_hits']),
    watch: {
        activeTab(tab) {
            // If the tab is the hits tab go fetch them
            if(tab === 0 ) {
                this.getHits()
            }
        }
    },
    data () {
        return {
            uuid: this.$route.params.uuid,
            activeTab: 0
        }
    },
    created() {
        this.getDetection(this.uuid)
        this.getHits()
    },
    methods: {
        getDetection(uuid) {
            this.$store.dispatch('getDetection', uuid)
        },
        detectionType(i){
            return ["Match", "Threshold", "Metric Change", "Field Mismatch"][i]
        },
        getHits() {
            this.$store.dispatch('getDetectionHits', {uuid: this.uuid})
        },
        riskScoreColor(score) {
            if(score === null) {
                return "info"
            }
            if(score >= 0 && score <= 12500) {
                return "info"
            }
            if(score >= 12501 && score <= 25000) {
                return "success"
            }
            if(score >= 25001 && score <= 37500) {
                return "warning"
            }
            if(score >= 37501) {
                return "danger"
            }
        }
    }
}
</script>