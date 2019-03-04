<template>
    <Badge :count="count">
      <Button type="text" icon="chatbubble-working" @click="message" :style="{color: foreground}"></Button>
    </Badge>
</template>

<script>
  export default {
    data () {
      return {
        count: 0
      }
    },
    props: {
      foreground: {
        type: String,
        default: null
      }
    },
    methods: {
      getMsgNum: function () {
        this.$http.get('/base/msg/UnReadNums').then(res => {
          this.count = res;
        })
      },
      message: function () {
        if (this.count !== 0) {
          this.$router.push({
            path: '/mallapp/message',
            query: {
              unread: 'unread'
            }
          })
        } else {
          this.$router.push({
            path: '/mallapp/message'
          })
        }
      }
    },
    shown: function () {
      this.getMsgNum()
    }
  }
</script>
