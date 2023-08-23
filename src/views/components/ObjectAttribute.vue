<template>
    <CRow style="margin-bottom: 16px">
        <CCol>
            <slot name="label"><small class="text-muted" style="text-transform: uppercase"><b>{{ label }}</b></small></slot><br>
            <slot name="value">{{ value }}</slot>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: "ObjectAttribute",
    props: {
        label: String,
        value: String
    }
}
</script>