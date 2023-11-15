<template>
    <CRow>
      <CCol>
        <CCard style="margin-top: 5px">
          <CDataTable
            :items="fim_rules"
            :fields="columns"
            :responsive="false"
            pagination
            :items-per-page="10"
            :sorter="{ external: true, resetable: true }"
          >
            <template #name="{ item }">
              <td>
                <CBadge v-if="item.active" color="success" class="tag tag-sm" size="sm"
                  >Active</CBadge
                >
                <CBadge v-if="!item.active" color="danger" class="tag tag-sm" size="sm"
                  >Disabled</CBadge
                >
                &nbsp;{{ item.name }}
              </td>
            </template>
            <template #actions="{ item }">
              <td class="text-right">
                <CDropdown toggler-text="Actions" color="secondary" size="sm">
                  <CDropdownItem
                    @click="editRule(item.uuid)"
                    v-if="current_user.permissions['update_benchmark_rule']"
                    >Edit</CDropdownItem
                  >
                  <CDropdownItem
                    v-if="!item.active && current_user.permissions['delete_benchmark_rule']"
                    @click="deleteRule(item.uuid)"
                    >Delete</CDropdownItem
                  >
                </CDropdown>
              </td>
            </template>
            <template #paths="{ item }">
              <td>
                <TagBucket :tags="item.paths" iconName="cil-folder"></TagBucket>
              </td>
            </template>
            <template #exclude_patterns="{ item }">
              <td>
                <TagBucket :tags="item.exclude_patterns" :countOnly="true"></TagBucket>
              </td>
            </template>
            <template #include_patterns="{ item }">
              <td>
                <TagBucket :tags="item.include_patterns" :countOnly="true"></TagBucket>
              </td>
            </template>
            <template #organization="{ item }">
              <td>
                <OrganizationBadge :uuid="item.organization"></OrganizationBadge>
              </td>
            </template>
          </CDataTable>
        </CCard>
      </CCol>
    </CRow>
</template>