<template>
  <CRow class="">
      <CCol lg="12" style="margin-top: 10%; text-align:center; verticle-align:middle;">
        <h1 class="display-1">403</h1>
        <h4>Ah Ah Ah!.  You didn't say the magic word!</h4>
        <p class="text-muted">Actually you just don't have permission to perform this action, contact your administrator for assistance.</p>
        <CButton color="info" @click='$router.go(-1)'>Go Back</CButton>       
      </CCol>
    </CRow>
  
</template>

<script>
export default {
  name: 'Page403'
}
</script>
