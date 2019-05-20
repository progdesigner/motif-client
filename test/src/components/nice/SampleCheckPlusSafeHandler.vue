<template>
  <div class="nice-checkplussafe-handler">

  </div>
</template>

<script>

export default {
  components: {

  },
  data() {
    return {

    }
  },
  created() {

    const params = {
      token: this.$route.query.token
    }

    this.$http.get('http://localhost:3100/v1/nuskin/now/cp/verity', { params })
      .then(res => {
        let { data } = res.data

        alert('본인인증 되었습니다.')

        if (opener && opener.CheckPlusSafe) {
          typeof opener.CheckPlusSafe.onSuccess === 'function' && opener.CheckPlusSafe.onSuccess(data)
        }

        // window.close()
      })
      .catch(e => {
        console.error(e)

        alert(e.message)

        if (opener && opener.CheckPlusSafe) {
          typeof opener.CheckPlusSafe.onError === 'function' && opener.CheckPlusSafe.onError(e.message)
        }

        // window.close()
      })
  },
  methods: {

  }
}
</script>
