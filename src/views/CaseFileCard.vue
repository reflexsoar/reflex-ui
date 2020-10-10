<template>
  <CCard>
    <CCardHeader class="bg-light">
      <CRow>
        <CCol col="2" class="filename">
          <b>{{case_file.filename}}</b>
        </CCol>
        <CCol col="10" class="text-right">
          <CButtonGroup>
            <CButton color="secondary" size="sm" @click="collapse = !collapse" @mouseover="view_hover = true" @mouseleave="view_hover = false"><CIcon name='cilMagnifyingGlass'/><span v-if="view_hover">&nbsp;View Details</span></CButton>
            <CButton color="success" size="sm" @mouseover="download_hover = true" @mouseleave="download_hover = false"><CIcon name='cilCloudDownload'/><span v-if="download_hover">&nbsp;Download</span></CButton>
            <CButton color="danger" size="sm" @mouseover="delete_hover = true" @mouseleave="delete_hover = false"><CIcon name='cilTrash'/><span v-if="delete_hover">&nbsp; Delete</span></CButton>
          </CButtonGroup>
        </CCol>
      </CRow>
    </CCardHeader>
    <CCollapse :show.sync="collapse">
      <CCardBody>
        <CRow>
          <CCol col="6">
            <label>MD5 Hash:</label> {{case_file.hash_md5}}<br>
            <label>SHA1 Hash:</label> {{case_file.hash_sha1}}<br>
            <label>SHA256 Hash:</label> {{case_file.hash_sha256}}<br>
          </CCol>
          <CCol col="6">
            <label>Upload Date:</label> {{case_file.created_at | moment('LLLL')}}<br>
            <label>Uploaded By:</label> {{case_file.created_by.username}}
          </CCol>
        </CRow>
        <CRow>
          <CCol col="12">
            <label>Description</label><br>
            FOOBAR
          </CCol>
        </CRow>
      </CCardBody>
    </CCollapse>
  </CCard>
</template>
<style scoped>
.filename {
  vertical-align: middle;
  line-height:30px;
}
</style>

<script>
import { mapState } from "vuex";
export default {
  name: "CaseFileCard",
  computed: mapState(["current_user", "settings"]),
  props: {
    case_file: Object,
    deleteAction: Function,
    download_hover: false,
    delete_hover: false,
    view_hover: false
  },
  data() {
    return {
      collapse: false
    }
  },
  methods: {

  }
};
</script>