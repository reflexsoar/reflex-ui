<template>
  <div>
    <CRow>
      <CCol>
        <h2>Asset Manager</h2>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCard>
          <CCardBody>
            <CRow>
              <CCol col>
                <h1><i class="fas fa-user"></i></h1>
              </CCol>
              <CCol col="10">
                <h2>{{ asset_count_by_type("user") }}</h2>
                <small> Users</small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>
        <CCard>
          <CCardBody>
            <CRow>
              <CCol col>
                <h1><i class="fas fa-user-group"></i></h1>
              </CCol>
              <CCol col="10">
                <h2>{{ asset_count_by_type("group") }}</h2>
                <small> Groups</small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>
        <CCard>
          <CCardBody>
            <CRow>
              <CCol col>
                <h1><i class="fas fa-server"></i></h1>
              </CCol>
              <CCol col="10">
                <h2>{{ asset_count_by_type("computer") }}</h2>
                <small> Servers</small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol>
        <CCard>
          <CCardBody>
            <CRow>
              <CCol col>
                <h1><i class="fas fa-desktop"></i></h1>
              </CCol>
              <CCol col="10">
                <h2>{{ asset_count_by_type("computer") }}</h2>
                <small> Computers</small>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader> Assets </CCardHeader>
          <CTabs>
            <CTab title="Users">
              <CDataTable
                :items="assets_by_type('user')"
                :fields="user_fields"
                :items-per-page="10"
                :responsive="false"
              >
                <template #name="{ item }">
                  <td>{{ item.user.name }}</td>
                </template>
              </CDataTable>
            </CTab>
            <CTab title="Groups">
              <CDataTable
                :items="assets_by_type('group')"
                :fields="group_fields"
                :items-per-page="10"
                :responsive="false"
              >
                <template #name="{ item }">
                  <td>{{ item }}</td>
                </template>
                </CDataTable>
            </CTab>
            <CTab title="Computers">
              <CDataTable
                :items="assets_by_type('computer')"
                :fields="computer_fields"
                :items-per-page="10"
                :responsive="false"
              >
                <template #name="{ item }">
                  <td>{{ item.computer.name }}</td>
                </template>
                <template #domain="{ item }">
                  <td>{{ item.computer.domain }}</td>
                </template>
                <template #ip_address="{ item }">
                  <td><TagBucket label="IP Addresses" :tags="item.computer.ip"/></td>
                </template>
                <template #mac_address="{ item }">
                  <td><TagBucket label="MAC Addresses" :tags="item.computer.mac"/></td>
                </template>
                <template #os="{ item }">
                  <td>{{ item.computer.os.name }}</td>
                </template>
                <template #asset_type="{ item }">
                  <td>{{ item.asset_type }}</td>
                </template>
                <template #form_factor="{ item }">
                  <td>{{ item.computer.form_factor }}</td>
                </template>
              </CDataTable>
            </CTab>
          </CTabs>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as demoData from "./demo-data.js";
import TagBucket from "../components/TagBucket.vue";

export default {
  name: "AssetManager",
  computed: mapState(["settings", "current_user"]),
    components: {
        TagBucket,
    },
  data() {
    return {
      assets: demoData.assets,
      user_fields: [
        { key: "id", label: "ID", _style: "width: 10%" },
        { key: "name", label: "Display Name", _style: "width: 20%" },
        { key: "domain", label: "Domain", _style: "width: 20%" },
        { key: "ip_address", label: "IP Address", _style: "width: 20%" },
        { key: "mac_address", label: "MAC Address", _style: "width: 20%" },
        { key: "asset_type", label: "Type", _style: "width: 10%" },
      ],
      group_fields: [],
      computer_fields: [
        { key: "id", label: "ID"},
        { key: "name", label: "Hostname"},
        { key: "domain", label: "Domain"},
        { key: "ip_address", label: "IP Address"},
        { key: "mac_address", label: "MAC Address"},
        { key: "asset_type", label: "Type"},
        { key: "os", label: "Operating System"},
        "asset_type",
        "form_factor"
      ],
    };
  },
  methods: {
    asset_count_by_type: function (asset_type) {
      return this.assets.filter((asset) => asset.asset_type == asset_type).length;
    },
    assets_by_type: function (asset_type) {
      return this.assets.filter((asset) => asset.asset_type == asset_type);
    },
  },
};
</script>
