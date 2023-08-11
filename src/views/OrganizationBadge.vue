<template>
    <span><CBadge class="tag" :shape="shape" :size="size" :color="color">{{orgName(uuid)}}</CBadge></span>
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
            // Check the store for the org name if it's not there, fetch it
            let org = this.$store.getters.org_name(uuid)
            if (org === 'Unknown') {
                this.$store.dispatch('getOrganizations', uuid).then(() => {
                    org = this.$store.getters.org_name(uuid)
                    return org
                })
            }
            return org
        }

    }
}
</script>
