<template>
    <div>
        <CRow class="page-heading page-heading-row">
            <CCol col=4>
                <h1>MITRE ATT&CK Coverage Map</h1><p>See how your detection rules align with MITRE ATT&CK. This will help identify gaps in your detection rules.
        </p>
            </CCol>
            <CCol>
                <CRow>
                    <CCol>
                        <label>Only Detections:</label><br>
                        <CSwitch :checked.sync="hide_empty_techniques" label-on="Yes" label-off="No" color="success"></CSwitch>
                    </CCol>
                    <CCol>
                        <label>Only Data Sources:</label><br>
                        <CSwitch :checked.sync="hide_empty_data_sources" label-on="Yes" label-off="No" color="success"></CSwitch>
                    </CCol>
                    <CCol>
                        <label>Sub-Techniques:</label><br>
                        <CSwitch :checked.sync="show_subs" label-on="Yes" label-off="No" color="success"></CSwitch>
                    </CCol>
                    <CCol>
                        <CInput label="Search" v-model="search" placeholder="Search"></CInput>
                    </CCol>
                    <CCol v-if="current_user.default_org" >
                        <CSelect placeholder="Select an Organization..." required
                            :value.sync="organization" :options="formattedOrganizations()" @change="getDetectionMapping()"
                            label="Organization" />
                    </CCol>
                </CRow>
            </CCol>
        </CRow>
        <CRow v-if="loading" class="text-center" style="line-height: calc(50vh)">
            <CCol>
                <CSpinner color="primary" size="xl" />
            </CCol>
        </CRow>
        <div v-else-if="!loading" style="overflow-y: scroll; overflow-x: scroll; max-height: calc(100vh - 280px)">
            <CRow class="tactic-header">
                <CCol v-for="tactic in mitre_tactics" :key="tactic.shortname" class="text-center"
                    style="font-size: 14px; margin-left: 4px;"><b>{{ tactic.name }}</b>
                    <div class="coverage-bar">
                        <div class="coverage-bar-active" :style="{'max-width': getActiveCoverage(tactic)+'%', 'width': getActiveCoverage(tactic)+'%'}">{{ getTechniquesWithDetectionsPerPhase(tactic) }}</div>
                        <div class="coverage-bar-total" :style="{'max-width': getPossibleCoverage(tactic)+'%', 'width': getPossibleCoverage(tactic)+'%'}">&nbsp;</div>
                        <div class="text-right total-techniques">{{getTechniqueCountPerPhase(tactic)}}</div>
                    </div>
                </CCol>
            </CRow>
            <CRow style="width: 200%">
                <CCol v-for="tactic in mitre_tactics" :key="tactic.shortname">
                    <CRow v-for="technique in getTechniquesPerPhase(tactic)" :key="technique.id" class="technique-row" v-if="!technique.external_id.includes('.') || (show_subs && technique.external_id.includes('.'))">
                        <CCol class="technique-col"
                            v-if="((hide_empty_techniques && getDetectionCount(technique, tactic.shortname) > 0) || !hide_empty_techniques) && (hide_empty_data_sources && getInputCount(technique.data_sources) || ! hide_empty_data_sources)">
                            <CCard class="technique-card" :class="technique.is_sub ? 'sub-technique': technique.has_subs ? 'has-subs': null">
                                <CCardBody class="technique-card-body"
                                    @click="showDrawer(technique.external_id)">
                                    <CRow>
                                        <CCol><b>{{ technique.name }}</b></CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol>{{ technique.external_id }}</CCol>
                                        <CCol class="text-right" style="font-size: 14px;">
                                        <CBadge v-if="getDetectionCount(technique) > 0" class="tag tag-sm" :style="{'background-color': getDetectionColorFromScale(getDetectionActiveCount(technique), technique), 'color': getDetectionFontColorFromScale(getDetectionActiveCount(technique), technique)}"><i class="fas fa-shield"></i> {{getDetectionActiveCount(technique)}}/{{ getDetectionCount(technique,
                                            tactic.shortname)}}</CBadge>
                                        <CBadge v-else class="tag tag-sm" :style="{'background-color': getDetectionColorFromScale(0), 'color': getFontColorFromScale(0)}"><i class="fas fa-shield"></i> 0</CBadge>&nbsp;
                                        <CBadge 
                                            class="tag tag-sm" 
                                            :style="{'background-color': getInputColorFromScale(getInputCount(technique.data_sources)), 'color': getFontColorFromScale(getInputCount(technique.data_sources))}"
                                        >
                                            <i class="fas fa-database"></i> {{ getInputCount(technique.data_sources)}}
                                        </CBadge>
                                        </CCol>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CCol>
            </CRow>
        </div>
        <MitreTechniqueDrawer :organization.sync="organization"/>
    </div>
</template>

<style scoped>

.tactic-header {
    width: 200%;
    border-bottom:1px solid #cfcfcf;
    padding-bottom:5px;
    margin-bottom:5px;
    margin-left: -10px;
    
}

.technique-card {
    margin: 2px;
    cursor: pointer;
}

.technique-col {
    font-size: 11px;
    padding-right:0px !important;
}

.technique-card-body {
    padding: 4px;
}

.has-detections {
    background-color: lightgreen;
    border: 1px solid green;
}

.progress {
    border: 1px solid #cfcfcf;
    
}

.progress-bar {
    color: #000 !important;
}

.coverage-bar {
    height: 1.2rem;
    border: 1px solid #cfcfcf;
    position: relative;
    border-radius: 0.25rem;
    width: 100%;
    padding: 2px;
    font-size: 12px;
    line-height: 12px;
    font-weight: 500;
    color: #000;
    background-color: #efefef;
}

.coverage-bar-active {
    background-color: #2eb85c;
    position: absolute;
    height: 100%;
    top: 0rem;
    left: 0rem;
    z-index: 2;
    overflow: hidden;
    padding: 2px;
}

.coverage-bar-total {
    background-color: #b2ffb2;
    position: absolute;
    height: 100%;
    top: 0rem;
    left: 0rem;
    z-index: 1;
    padding: 2px;
}

.total-techniques {
    padding-right: 5px;
    z-index: 3
}

.has-subs {
    border-left: 2px solid #333333;
}

.sub-technique {
    border-left: 2px solid #999999;
    left: 5px;
    width: calc(100% - 9px);
}

</style>

<script>

import { mapState } from "vuex";
import MitreTechniqueDrawer from "./MitreTechniqueDrawer";
import CRightDrawer from '../CRightDrawer.vue';
// Import chroma.js
import chroma from 'chroma-js';

export default {
    name: "MitreCoverage",
    computed: {
        filtered_techniques() {
            if(this.search !== null) {
                return this.mitre_techniques.filter((technique) => {
                    return technique.name.toLowerCase().includes(this.search.toLowerCase()) || technique.external_id.toLowerCase().includes(this.search.toLowerCase());
                });
            } else {
                return this.mitre_techniques;
            }
        },
        ...mapState(['mitre_tactics', 'mitre_techniques', 'detections', 'mitre_technique', 'current_user', 'organizations', 'mitre_mapping'])
    },
    components: {
        MitreTechniqueDrawer,
        CRightDrawer
    },
    data() {
        return {
            loading: true,
            hide_empty_techniques: false,
            hide_empty_data_sources: false,
            organization: '',
            search: null,
            inputs: [],
            show_subs: false,
            max_detections: 0,
            max_green: "#2eb85c",
            none_red: "#ff0000",
            min_green: "#b2ffb2",
            white: "#fff",
            dark: "#3c4b64",
            techniques_subs: {}
        };
    },
    reloadDetections() {

    },
    created() {
        if(this.current_user.default_org) {
            this.organization = this.current_user.organization
        }
        this.$store.commit('set', ['mitreDrawerMinimize', true])
        this.loading = true
        this.getDetectionMapping()
        this.getMitreTactics()
        this.getMitreTechniques()
    },
    methods: {
        showDrawer(external_id) {
            if (this.$store.getters.mitreDrawerMinimize) {
                this.$store.dispatch('getMitreTechnique', { external_id: external_id }).then(resp => {
                    this.$store.commit('set', ['mitreDrawerMinimize', !this.$store.getters.mitreDrawerMinimize])
                })
            }
        },
        getTechniquesPerPhase(tactic) {
            return this.filtered_techniques.filter(technique => technique.phase_names.includes(tactic.shortname))
        },
        getDetectionActiveCount(technique) {
            if (technique.external_id in this.mitre_mapping['techniques']) {
                return this.mitre_mapping['techniques'][technique.external_id]['active']
            }
            return 0
        },
        getTechniqueCountPerPhase(tactic) {
            return this.filtered_techniques.filter(technique => technique.phase_names.includes(tactic.shortname)).length
        },
        getTechniquesWithDetectionsPerPhase(tactic) {
            return this.filtered_techniques.filter(technique => technique.phase_names.includes(tactic.shortname) && this.getDetectionActiveCount(technique, tactic.shortname) > 0).length
        },
        getTechniquesTotalDetections(tactic) {
            return this.filtered_techniques.filter(technique => technique.phase_names.includes(tactic.shortname) && this.getDetectionCount(technique, tactic.shortname) > 0).length
        },
        getActiveCoverage(tactic) {
            return Math.round(this.getTechniquesWithDetectionsPerPhase(tactic) / this.getTechniqueCountPerPhase(tactic) * 100)
        },
        getPossibleCoverage(tactic) {
            let active = this.getTechniquesWithDetectionsPerPhase(tactic)
            let possible = this.getTechniquesTotalDetections(tactic)
            let total = this.getTechniqueCountPerPhase(tactic)
            return Math.round(possible / total * 100)
        },
        getDetectionCount(technique, tactic) {
            if (technique.external_id in this.mitre_mapping['techniques']) {
                return this.mitre_mapping['techniques'][technique.external_id]['total']
            }
            return 0
        },
        getFontColorFromScale(count) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of black. */
            return "#fff";
        },
        getInputColorFromScale(count) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of green. */
            
            if (count == 0) {
                return this.none_red;
            }
            
            return this.max_green;
            
        },
        getDetectionFontColorFromScale(count, technique=null) {
            if (count == 0) {
                return this.white;
            }

            let max = this.max_detections;
            let min = 1;
            if(technique) {
                max = this.mitre_mapping['techniques'][technique.external_id]['total']
            }

            if (count == max) {
                return this.white;
            }

            let scale = chroma.scale([this.dark, this.white]).domain([min, max]).colors(Math.round(max/2));
            let index = Math.round((count - min) / (max - min) * (max/2));            
            return scale[index];
        },
        getDetectionColorFromScale(count, technique=null) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of green. */

            if (count == 0) {
                return this.none_red;
            }

            let max = this.max_detections;
            let min = 1;
            if(technique) {
                max = this.mitre_mapping['techniques'][technique.external_id]['total']
            }

            if (min == max) {
                return this.max_green;
            }

            let scale = chroma.scale([this.min_green, this.max_green]).domain([min, max]).colors(Math.round(max/2));
            let index = Math.round((count - min) / (max - min) * (max/2));            
            return scale[index];

        },
        getInputCount(data_sources) {
            let count = 0
            for (let i in this.inputs) {
                let input = this.inputs[i]
                for (let data_source in data_sources) {
                    
                    if (input.mitre_data_sources && input.mitre_data_sources.includes(data_sources[data_source])) {
                        count++
                    }
                }
            }
            return count
        },
        getDetectionMapping() {
            this.getInputs();
            
            if(this.current_user.default_org) {
                this.$store.dispatch('getDetectionMitreMapping', { organization: this.organization })
            } else {
                this.$store.dispatch('getDetectionMitreMapping', {})
            }
        },
        getDetections() {
            if(this.current_user.default_org) {
                this.$store.dispatch('getDetections', { page_size: 1000, organization: this.organization })
            } else {
                this.$store.dispatch('getDetections', { page_size: 1000 })
            }
        },
        getInputs() {
            if(this.current_user.default_org) {
                this.$store.dispatch('getInputs', { page_size: 1000, organization: this.organization }).then(() => {
                    this.inputs = this.$store.getters.inputs
                })
            } else {
                this.$store.dispatch('getInputs', { page_size: 1000 }).then(() => {
                    this.inputs = this.$store.getters.inputs
                })
            }
        },
        getMitreTechniques() {
            this.$store.dispatch('getMitreTechniques', { page_size: 1000 }).then(() => {
                this.loading = false
            })
        },
        getMitreTactics() {
            this.$store.dispatch('getMitreTactics', { page_size: 1000 })
        },
        formattedOrganizations() {
            return this.organizations.map((o) => { return { label: o.name, value: o.uuid } })
        }
    }
}
</script>