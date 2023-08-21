<template>
    <div>
        <CRow>
            <CCol>
                <h2>Asset Details</h2>
            </CCol>
        </CRow>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "AssetDetails",
    computed: mapState(["settings", "current_user"]),
    data() {
        return {
            asset: {
                "id": 1,
                "hostname": "testhost",
                "domain": "testdomain",
                "ip_address": "",
                "mac_address": "00:00:00:00:00:00",
                "asset_type": "server",
                "asset_subtype": "linux",
                "asset_group": "testgroup",
            }
        }
    }
}
</script>
