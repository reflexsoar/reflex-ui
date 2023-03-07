<template>
  <div>
    <CRow style="padding: 10px">
      <CCol>
        <CButton color="primary" @click="createRepositoryModal()">New Repository</CButton>
      </CCol>
      <CCol col="5" class="text-right"> </CCol>
    </CRow>
    <CDataTable
      :items="detection_repositories"
      :fields="fields"
      :items-per-page="10"
      :sorter="{ external: false, resetable: true }"
      :loading="loading"
      column-filter
      pagination
      style="border-top: 1px solid #cfcfcf"
    >
      <template #actions="{ item }">
        <td style="min-width: 25px" class="text-right">
          <CButton color="info" @click="editRepository(item.uuid)" size="sm"
            ><CIcon name="cilPencil" /></CButton
          >&nbsp;
          <CButton color="danger" @click="deleteRepository(item.uuid)" size="sm"
            ><CIcon name="cilTrash"
          /></CButton>
        </td>
      </template>
      <template #repo_type="{ item }">
        <td>
          <CBadge color="info" class="tag" size="sm">{{ item.repo_type }}</CBadge>
        </td>
        </template>
      <template #share_type="{ item }">
        <td>
          <CBadge color="info" class="tag" size="sm">{{ item.share_type }}</CBadge>
        </td>
        </template>
        <template #tags="{ item }">
        <td>
          <li
              style="display: inline; margin-right: 2px"
              v-for="tag in item.tags"
              :key="tag"
            >
              <CButton color="primary" size="sm" disabled>{{ tag }}</CButton>
            </li>
        </td>
        </template>
    </CDataTable>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "DetectionRepositoryList",
  computed: {
    ...mapState(["detection_repositories"]),
  },
  created: function () {
    if (this.detection_repositories.length == 0) {
      this.$store.dispatch("getDetectionRepositories", {}).then(() => {
        this.loading = false;
      });
    }
  },
  data() {
    return {
      fields: [
        "name",
        "description",
        { key: "repo_type", label: "Type" },
        { key: "share_type", label: "Access Mode" },
        'tags',
        { key: "actions", label: "Manage", filter: false },
      ],
      page: 1,
      page_size: 25,
      loading: false,
    };
  },
  methods: {
    editRepository(uuid) {
      alert("Not implemented yet");
    },
    deleteRepository(uuid) {
      alert("Not implemented yet");
    },
    createRepositoryModal() {
      alert("Not implemented yet");
    },
  },
};
</script>
