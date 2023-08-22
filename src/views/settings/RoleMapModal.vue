<template>
  <CModal :centered="false" size="xl" :show.sync="show">
    <template #header>
      <h5 class="modal-title" style="text-transform: capitalize">{{ mode }} SSO Realm</h5>
    </template>
    <h5>Role Mapping</h5>
      <p>Role Mapping allows for the mapping of SAML attributes to roles in the system.  If a user
        authenticates with an attribute that is mapped to a role, the user will be assigned that role.
        If the user already has a role, the role will be replaced with the mapped role.
      </p>
      <p>
        <ul>
          <li><b>SAML Attribute</b>: The name of the SAML attribute that will be used for mapping.</li>
          <li><b>Value</b>: The value of the SAML attribute that will be used for mapping.  Wildcard matching using "*" is supported.</li>
          <li><b>Role</b>: The role that will be assigned to the user if the mapping is applied.</li>
        </ul>
      </p>
    <CRow>
      <CCol>
       <CInput label="Mapping Name" v-model="name" placeholder="Default User Mapping" description="A friendly name to identify this mapping policy" required/>
        </CCol>
        </CRow>
        <CRow>
          <CCol>
            <h5>Attribute Mapping</h5>
          </CCol>
          <CCol class="text-right">
            <CButton color="primary" @click="role_mapping.push({})">Add Mapping</CButton>
          </CCol>
        </CRow>
        <div v-if="role_mapping.length > 0" v-for="map, i in role_mapping" :key="i">
          <CRow>
            <CCol>
              <CInput label="SAML Attribute" v-model="map.saml_attribute" required/>
            </CCol>
            <CCol>
              <CInput label="Value" v-model="map.value" placeholder="*" required/>
            </CCol>
            <CCol>
              <CSelect label="Role" :value.sync="map.role" :options="roles.map(role => { return {label: role.name, value: role.uuid}})" required/>
            </CCol>
            <CCol col=1>
              <div role="group" class="form-group">
                <br>
                <CButton  style="margin-top: 8px" size="sm" color="danger" @click="role_mapping.splice(i, 1)"><i class="fas fa-trash-can"/></CButton>
              </div>
            </CCol>
          </CRow>
        </div>
        
        <div v-else>
          <CRow>
            <CCol>
              <p>No mappings have been configured.</p>
            </CCol>
          </CRow>
        </div>
    <template #footer>
      <CRow>
        <CCol class="text-right">
          <CButton color="secondary" @click="dismiss">Cancel</CButton>&nbsp;
          <CButton v-if="mode == 'create'" color="primary" @click="createMapping"
            >Create</CButton
          >
          <CButton v-if="mode == 'edit'" color="primary" @click="updateMapping"
            >Update</CButton
          >
        </CCol>
      </CRow>
    </template>
    </CModal>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "RoleMapModal",
  props: {
    show: Boolean,
    _mapping: {
      type: Array,
      default: () => [],
    },
    mode: {
      type: String,
      default: "create",
    },
  },
  computed: {
    ...mapState(["roles"]),
  },
  watch: {
    show: function () {
      this.$emit("update:show", this.show);
      if (this.show) {
        this.getUserRoles();
      }
    },
  },
  data() {
    return {
      loading: false,
      name: "",
      role_mapping: []
    };
  },
  methods: {
    closeModal() {
      this.$emit("update:show", false);
    },
    getUserRoles() {
      this.$store.dispatch("getRoles", {});
    },
    reset() {},
    createMapping() {
      console.log("create");
      this.closeModal();
    },
    updateMapping() {
      console.log("edit");
      this.closeModal();
    },
    dismiss() {
      console.log("dismiss");
      this.closeModal();
    },
  },
};
</script>
