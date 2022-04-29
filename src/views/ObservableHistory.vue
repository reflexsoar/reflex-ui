<template>
    <CRow>
        <CCol xs="12" lg="12">
            <CRow>
                <CCol>
                    <h2>Observable History</h2>
                    <span>Use the below search box to view the history of any observable by typing its value.</span><br><br>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" lg="10">
                    <CInput v-on:keyup.enter="search(observable_value)" v-model="observable_value" placeholder="Enter the observable you want to search for"></CInput>
                </CCol>
                <CCol xs="12" lg="2">
                    <CButton class="btn btn-block btn-primary" @click="search(observable_value)">Search</CButton>
                </CCol>
            </CRow>
            <CRow v-if="history_loaded">
                <CCol>
                    <CRow>
                        <CCol lg="3" xs="12">
                            <CCard>
                                <CCardBody>
                                    <center><h1>{{history.case_count}}</h1><br>Associated Cases</center>
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol lg="3" xs="12">
                            <CCard>
                                <CCardBody>
                                    <center><h1>{{history.event_count}}</h1><br>Associated Events</center>
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol lg="3" xs="12">
                            <CCard>
                                <CCardBody>
                                    <center><h1>{{history.is_ioc ? 'Yes' : 'No'}}</h1><br>Indicator of Compromise?</center>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol lg="12" xs="12">
                            <timeline>

                            <timeline-item v-for="item in history.timeline" :key="item.uuid"><b>{{ item.created_at | moment('LLLL') }}</b>
                            <CCard>
                                <CCardHeader>
                                    <b><CIcon v-if="item.type == 'case'" name="cilBriefcase"/><CIcon v-else name="cilBell"/>&nbsp;{{item.title}}</b>
                                </CCardHeader>
                                <CCardBody>
                                    
                                    <vue-markdown style="margin-bottom:0px;">{{item.description}}</vue-markdown>
                                    <CIcon name="cilCenterFocus" style="margin-top:5px"/>&nbsp;<li style="display: inline; margin-right: 2px;"><CButton color="secondary" class="tag" size="sm" style="margin-top:5px; margin-bottom:0px;" @click="search('tester')">Tester</CButton></li>
                                </CCardBody>
                                <CCardFooter style="background-color:#f0f0f0;">
                                    <CIcon name="cilTags"/>&nbsp;<li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag"><CButton color="dark" class="tag" size="sm">{{ tag }}</CButton></li>
                                </CCardFooter>
                            </CCard>
                            </timeline-item>
                            </timeline>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
            <CRow v-else>
                <CCol xs="12" lg="12">
                    <center><h3>No history found for {{ observable_value }}.</h3></center>
                </CCol>
            </CRow>
        </CCol>
    </CRow>    
</template>

<script>

import { Timeline, TimelineItem, TimelineTitle } from 'vue-cute-timeline'
import 'vue-cute-timeline/dist/index.css'

export default {
    name: 'ObservableHistory',
    components: {
        Timeline,
        TimelineItem,
        TimelineTitle,
    },
    data () {
        return {
            observable_value: "",
            history: {},
            history_loaded: false,
        }
    },
    methods: {
        getMoreHistory() {
            window.onscroll = () => {
                let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
                if (bottomOfWindow) {
                    console.log(bottomOfWindow)
                }
            }
        },
        search: function (value) {
            this.$store.dispatch('fetchObservableHistory', value).then(resp => {
                this.history_loaded = false
                this.observable_value = value
                this.history = resp.data
                if(this.history.timeline.length > 0) {
                    this.history_loaded = true
                }
            })
        }
    },
    mounted() {
        this.getMoreHistory()
    }
}
</script>