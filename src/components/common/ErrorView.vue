<template>
  <div class="error-view" v-if="error">
    <div class="img">
    </div>
    <h2 v-if="error.title">{{error.title.format(name) }}</h2>
    <h4 v-if="error.content" v-html="error.content.format(name)">{{error.content.format(name) }}</h4>
    <Button size="large" type="primary" v-if="error.action" @click.stop="action"
            :loading="loading">
      {{error.action.format(name) }}
    </Button>
    <Button size="large" v-if="error.cancel" @click.stop="cancel">
      {{error.cancel.format(name) }}
    </Button>
  </div>
</template>

<script>
  export default {
    data () {
      return {}
    },
    props: {
      error: Object,
      name: String,
      loading: Boolean
    },
    methods: {
      action: function (e) {
        this.$emit('action')
      },
      cancel: function (e) {
        this.$emit('cancel')
      }
    }
  }
</script>

<style scoped>
  .error-view {
    margin-top: 24px;
    text-align: center;
    padding: 30px;
  }

  h2 {
    margin-bottom: 8px;
    color: #1c2438;
  }

  h4 {
    margin-bottom: 24px;
    font-weight: normal;
    color: #80848f;
  }

  .img {
    margin: 0 auto 20px auto;
    width: 225px;
    height: 170px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
    background-image: url(/static/images/error.gif);
  }
</style>
