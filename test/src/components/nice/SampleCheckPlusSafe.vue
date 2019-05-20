<template>
  <div class="nice-checkplussafe">
    <NiceCheckPlusSafe debug
      target="popupChk"
      :callbackUrl="callbackUrl"
      :encData="encData">본인인증</NiceCheckPlusSafe>

    <p v-if="resultData"> Result : {{JSON.stringify(resultData)}} </p>
    <p v-if="error"> Error : {{error}} </p>

  </div>
</template>

<script>
import NiceCheckPlusSafe from '@motif/client/components/Nice/CheckPlusSafe'

export default {
  components: {
    NiceCheckPlusSafe
  },
  data() {
    return {
      encData: '',
      error: '',
      resultData: null
    }
  },
  created() {
    this.$http.post('http://localhost:3100/v1/nuskin/now/cp')
      .then(res => {
        let { data } = res.data
        this.$data.encData = data.encData
      })
      .catch(e => {
        console.error(e)
      })
  },
  mounted() {
    global.CheckPlusSafe = this
  },
  destroyed() {
    global.CheckPlusSafe = null
  },
  computed: {
    callbackUrl() {
      return 'http://localhost:8080/#/nice/sample/check-plus-safe/handler'
    }
  },
  methods: {
    onSuccess(data) {
      console.log( 'onSuccess', data )
      this.$data.resultData = data
    },
    onError(error) {
      console.log( 'onError', error )
      this.$data.error = error
    }
  }
}
</script>
