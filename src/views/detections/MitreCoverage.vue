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
                    :value.sync="organization" :options="formattedOrganizations()" @change="getDetections()"
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
                    <CRow v-for="technique in getTechniquesPerPhase(tactic)" :key="technique.id">
                        <CCol class="technique-col"
                            v-if="((hide_empty_techniques && getDetectionCount(technique, tactic.shortname) > 0) || !hide_empty_techniques) && (hide_empty_data_sources && getInputCount(technique.data_sources) || ! hide_empty_data_sources)">
                            <CCard class="technique-card"
                                v-if="getDetectionCount(technique, tactic.shortname) == 0"
                                @click="showDrawer(technique.external_id)">
                                <CCardBody class="technique-card-body">
                                    <span class="text-muted"><b>{{ technique.name }}</b>&nbsp;(I: {{ getInputCount(technique.data_sources) }})<br>{{ technique.external_id }}</span>
                                </CCardBody>
                            </CCard>
                            <CCard class="technique-card has-detections" v-else>
                                <CCardBody class="technique-card-body"
                                    @click="showDrawer(technique.external_id)">
                                    <span><b>{{ technique.name }}</b>&nbsp;(D: {{ getDetectionCount(technique,
                                            tactic.shortname)}}) (I: {{ getInputCount(technique.data_sources) }})<br>{{ technique.external_id }}
                                        </span>
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
        ...mapState(['mitre_tactics', 'mitre_techniques', 'detections', 'mitre_technique', 'current_user', 'organizations', 'inputs'])
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
            search: null
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
        this.getDetections()
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
            //console.log(this.filtered_techniques)
            return this.filtered_techniques.filter(technique => technique.phase_names.includes(tactic.shortname))
        },
        getDetectionCount(technique, tactic) {
            let count = 0
            for (let i in this.detections) {
                let detection = this.detections[i]
                let detection_tactics = detection.tactics ? detection.tactics.map(t => t.shortname) : []
                let detection_techniques = detection.techniques ? detection.techniques.map(t => t.external_id) : []
                if (detection_techniques.includes(technique.external_id)) {
                    count++
                }
            }
            return count
        },
        getInputCount(data_sources) {
            let count = 0
            for (let i in this.inputs) {
                let input = this.inputs[i]
                for (let data_source in data_sources) {
                    
                    if (input.mitre_data_sources.includes(data_sources[data_source])) {
                        count++
                    }
                }
            }
            return count
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
                this.$store.dispatch('getInputs', { page_size: 1000, organization: this.organization })
            } else {
                this.$store.dispatch('getInputs', { page_size: 1000 })
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