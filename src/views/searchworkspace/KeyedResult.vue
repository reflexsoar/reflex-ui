<template>
    <div>
        <span v-for="(v, k) in result" :key="k">
            <span class="reflex-badge reflex-badge-secondary">{{ k }}</span>
            <span v-if="v == undefined" class="reflex-badge empty-value">empty</span>
            <span v-else class="reflex-badge">{{ v }}</span>
        </span>
    </div>
</template>

<style scoped>
.empty-value {
  color: #aaa;
}
</style>

<script>
export default {
    name: "KeyedResult",
    props: {
        result: {
            type: Object,
            default: () => {},
        }
    },
}
</script>