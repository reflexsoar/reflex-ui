<template>
    <div>
        <CRow class="page-heading page-heading-row page-heading-no-nav">
      <CCol>
        <h1>Data Source Templates<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/data_source_templates')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h1>
      </CCol>
    </CRow>
    <CRow>
        <CCol>
            <DataSourceTemplateList></DataSourceTemplateList>
        </CCol>
    </CRow>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import DataSourceTemplateList from '@/views/data_sources/TemplateList.vue';

export default {
    name: 'DataSourceTemplates',
    components: {
        DataSourceTemplateList
    },
    data() {
        return {
            
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>