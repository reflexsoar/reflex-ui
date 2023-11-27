<template>
    <div>
        <CRow>
            <CCol class="text-center" >
                <CBadge color="info" class="tag" v-c-tooltip="{'content': 'Total Assets'}">{{ score.total }}</CBadge>
            </CCol>
            <CCol class="text-center" >
                <CBadge color="success" class="tag" v-c-tooltip="{'content': 'Passed'}">{{ score.passed }}</CBadge>
            </CCol>
            <CCol class="text-center" >    
                <CBadge color="danger" class="tag" v-c-tooltip="{'content': 'Failed'}">{{ score.failed }}</CBadge>
            </CCol>
            <CCol class="text-center" >
                <CBadge color="warning" class="tag" v-c-tooltip="{'content': 'Error'}">{{ score.error }}</CBadge>
            </CCol>
            <CCol class="text-center" >
                <CBadge color="secondary" class="tag" v-c-tooltip="{'content': 'Skipped'}">{{ score.skipped }}</CBadge>
            </CCol>
        </CRow>
    </div>
</template>

<script>
import { mapState } from "vuex";

import ObjectAttribute from "../components/ObjectAttribute.vue";

export default {
    name: "BenchmarkScore",
    computed: mapState(["current_user"]),
    components: {
        ObjectAttribute,
    },
    props: {
        score: {
            type: Object,
            required: true,
            default: () => {
                return {
                    total: 0,
                    success: 0,
                    warning: 0,
                    danger: 0,
                };
            },
        },
    },
    data() {
        return {
        };
    }
};
</script>
