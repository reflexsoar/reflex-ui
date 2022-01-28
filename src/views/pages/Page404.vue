<template>
  <CRow class="">
      <CCol lg="12" style="margin-top: 10%; text-align:center; verticle-align:middle;">
        <h1 class="display-1">404</h1>
        <h4>Oops, you appear lost!</h4>
        <p class="text-muted">The page you were looking for was not found!</p>
        <CButton color="info" @click='$router.go(-2)'>Go Back</CButton>       
      </CCol>
    </CRow>
  
</template>

<script>
export default {
  name: 'Page404'
}
</script>
