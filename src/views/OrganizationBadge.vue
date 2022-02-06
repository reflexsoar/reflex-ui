<template>
    <div>
        <CButton class="tag" :size="size" :color="color">{{orgName(uuid)}}</CButton>
    </div>   
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'OrganizationBadge',
    props: {
        uuid: String,
        size: {
            type: String,
            default: "lg"
        },
        color: {
            type: String,
            default: "secondary"
        }
    },
    created () {

    },
    methods: {
        orgName(uuid) {
            return this.$store.getters.org_name(uuid)
        }

    }
}
</script>
