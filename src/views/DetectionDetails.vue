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
                                    <b>Base Query</b>
                                    <p>{{detection.query}}</p>
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
                                    SOURCE: {{detection.source}}<br>
                                    TYPE: {{detection.rule_type}}<br>
                                    QUERY: {{detection.query.query}}
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
                                <CTab title="Hits">stuff</CTab>
                                <CTab title="Exclusions"/>
                                <CTab title="Log"/>
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
        }
    }
}
</script>