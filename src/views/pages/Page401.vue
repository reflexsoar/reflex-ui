<template>
    <CRow class="">
      <CCol lg="12" style="margin-top: 10%; text-align:center; verticle-align:middle;">
        <h1 class="display-1">401</h1>
        <h4>Houston, we have a problem!</h4>
        <p class="text-muted">You are not authorized to view this page!</p>
        <CButton color="info" @click='$router.go(-2)'>Go Back</CButton>       
      </CCol>
    </CRow>
</template>

<script>
export default {
  name: 'Page500'
}
</script>
