<template>
    <span>&nbsp;<CBadge class="tag" :shape="shape" :size="size" :color="color">{{orgName(uuid)}}</CBadge></span>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'OrganizationBadge',
    props: {
        uuid: String,
        shape: {
            type: String,
            default: ""
        },
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
