<template>
    <div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
        <label>Organization</label><br>
        <multiselect 
            :value="org"
            label="name" 
            :options="org_list" 
            track-by="uuid" 
            :searchable="true"
            :internal-search="false"
            :options-limit="10"
            :show-no-results="true"
            @select="selectOrganization"
            @search-change="searchOrganization"
            placeholder="Select an organization">
        </multiselect>{{org}}
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'OrganizationMultiSelect',
    props: {
        organization: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            org: null
        }
    },
    computed: {
        org_list: function () {
            return this.organizations.map(item => { return {uuid: item.uuid, name: item.name }})
        },
        ...mapState(['organizations'])
    },
    created () {

    },
    methods: {
        selectOrganization(event) {
            this.$emit('update:organization', event.uuid)
        },
        searchOrganization(event) {
            console.log(event)
        }
    }
}
</script>
