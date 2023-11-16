<template>
    <router-view></router-view>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "Benchmark",
    computed: mapState(["current_user"]),
    data() {
        return {
        };
    }
};
</script>