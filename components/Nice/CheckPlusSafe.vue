<template>
  <div>
    <button :disabled="!encData" @click="onSubmit"><slot></slot></button>

    <div v-if="">
      {{encData}}
    </div>

    <form ref="form" method="post">
      <input type="hidden" name="m" value="checkplusSerivce" />
      <input type="hidden" name="EncodeData" :value="encData" />
      <input type="hidden" name="param_r1" :value="callbackUrl" />
      <input type="hidden" name="param_r2" value="" />
      <input type="hidden" name="param_r3" value="" />
	  </form>
  </div>
</template>

<script>

export default {
  props: {
    encData: String,
    callbackUrl: String,
    target: {
      type: String,
      default: 'popupChk',
      required: false
    },
    autoPopup: {
      type: Boolean,
      default: false,
      required: false
    },
    debug: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  mounted() {

    if (this.$props.autoPopup) {
      setTimeout(() => {
        this.onSubmit()
      }, 100)
    }
  },
  destroyed() {

  },
  methods: {
    onSubmit() {
      if (this.$refs.form) {
        window.open('', 'popupChk', 'width=500, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no')

        this.$refs.form.action = "https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb"
        this.$refs.form.target = this.$props.target

        this.$refs.form.submit()
      }
    }
  }
}
</script>
