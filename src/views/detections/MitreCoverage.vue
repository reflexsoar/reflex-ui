<template>
    <div>
        <h2>
            <CBadge color="primary">BETA</CBadge>&nbsp;MITRE ATT&CK Coverage Map
        </h2>
        <p>See how your detection rules align with MITRE ATT&CK. This will help identify gaps in your detection rules.
        </p>
        <CAlert :show="true" color="info"><b>Beta Feature</b>: This feature is in beta and may not function as intended
            under all conditions.</CAlert>
        <CRow>
            <CCol>
                <label>Hide Techniques with no Detections:</label><br>
                <CSwitch :checked.sync="hide_empty_techniques" label-on="Yes" label-off="No" color="success"></CSwitch>
            </CCol>
            <CCol>
                <label>Hide Techniques with no Data Source:</label><br>
                <CSwitch :checked.sync="hide_empty_data_sources" label-on="Yes" label-off="No" color="success"></CSwitch>
            </CCol>
            <CCol>
                <CInput label="Search" v-model="search" placeholder="Search"></CInput>
            </CCol>
            <CCol>
                <CSelect v-if="current_user.default_org" placeholder="Select an Organization..." required
                    :value.sync="organization" :options="formattedOrganizations()" @change="getDetectionMapping()"
                    label="Organization" />
            </CCol>
        </CRow>
        <CRow v-if="loading" class="text-center" style="line-height: calc(50vh)">
            <CCol>
                <CSpinner color="primary" size="xl" />
            </CCol>
        </CRow>
        <div v-else-if="!loading" style="overflow-y: scroll; overflow-x: scroll; max-height: calc(100vh - 420px)">
            <CRow style="width: 200%; border-bottom:1px solid #cfcfcf; padding-bottom:5px; margin-bottom:5px;">
                <CCol v-for="tactic in mitre_tactics" :key="tactic.shortname" class="text-center"
                    style="font-size: 12px; margin-left: 4px;"><b>{{ tactic.name }}</b>
                </CCol>
            </CRow>
            <CRow style="width: 200%">
                <CCol v-for="tactic in mitre_tactics" :key="tactic.shortname">
                    <CRow v-for="technique in getTechniquesPerPhase(tactic)" :key="technique.id" class="technique-row">
                        <CCol class="technique-col"
                            v-if="((hide_empty_techniques && getDetectionCount(technique, tactic.shortname) > 0) || !hide_empty_techniques) && (hide_empty_data_sources && getInputCount(technique.data_sources) || ! hide_empty_data_sources)">
                            <CCard class="technique-card"
                                v-if="getDetectionCount(technique, tactic.shortname) == 0"
                                @click="showDrawer(technique.external_id)">
                                <CCardBody class="technique-card-body">
                                
                                    <CRow>
                                        <CCol><b>{{ technique.name }}</b></CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol>{{ technique.external_id }}</CCol>
                                        <CCol class="text-right" style="font-size: 14px;">
                                        <CBadge class="tag tag-sm" :style="{'background-color': getDetectionColorFromScale(getDetectionCount(technique, tactic.shortname)), 'color': getFontColorFromScale(getDetectionCount(technique,
                                            tactic.shortname))}"><i class="fas fa-shield"></i> {{ getDetectionCount(technique,
                                            tactic.shortname)}}</CBadge>&nbsp;
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
                            <CCard class="technique-card"  v-else>
                                <CCardBody class="technique-card-body"
                                    @click="showDrawer(technique.external_id)">
                                    <CRow>
                                        <CCol><b>{{ technique.name }}</b></CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol>{{ technique.external_id }}</CCol>
                                        <CCol class="text-right" style="font-size: 14px;">
                                        <CBadge class="tag tag-sm" :style="{'background-color': getDetectionColorFromScale(getDetectionCount(technique, tactic.shortname)), 'color': getFontColorFromScale(getDetectionCount(technique,
                                            tactic.shortname))}"><i class="fas fa-shield"></i> {{ getDetectionCount(technique,
                                            tactic.shortname)}}</CBadge>&nbsp;
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
            inputs: []
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
        //this.getDetections()
        this.getInputs()
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
        getDetectionCount(technique, tactic) {
            if (technique.external_id in this.mitre_mapping['techniques']) {
                return this.mitre_mapping['techniques'][technique.external_id]
            }
            return 0
        },
        getFontColorFromScale(count) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of black. */
            if (count == 0) {
                return '#fff'
            } 
            return "#3c4b64"
        },
        getInputColorFromScale(count) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of green. */
            
            let max = 10;
            let min = 1;
            let scale = chroma.scale(['#b2ffb2', '#00ff00']).domain([min, max]).colors(10);
            let index = Math.round((count - min) / (max - min) * 10);
            if (index > 9) {
                index = 9;
            }
            
            if (count == 0) {
                return '#ff0000'
            }
            return scale[index];
        },
        getDetectionColorFromScale(count) {
            /* Create a color gradient based on the number of detections for a technique, the should 
            be based on shades of green. */
            let techniques = this.mitre_mapping['techniques'];
            let max = Math.max(...Object.values(techniques));
            let min = 1;
            let scale = chroma.scale(['#b2ffb2', '#00ff00']).domain([min, max]).colors(10);
            let index = Math.round((count - min) / (max - min) * 10);
            if (index > 9) {
                index = 9;
            }
            if (count == 0) {
                return '#ff0000'
            }
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
            this.loading = true
            if(this.current_user.default_org) {
                this.$store.dispatch('getDetectionMitreMapping', { organization: this.organization }).then(() => {
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
            } else {
                this.$store.dispatch('getDetectionMitreMapping', {}).then(() => {
                    this.loading = false
                }).catch(() => {
                    this.loading = false
                })
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