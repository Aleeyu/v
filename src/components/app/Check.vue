<template>
  <div class="app-checking">
    <img src="/static/images/app-logo.png"/>
  </div>
</template>

<script>
  export default {
    data () {
      return {}
    },
    methods: {
      shown: function () {
        this.$parent.setBusy('正在检测帐号信息')
        this.$http.get('/system/app/user/current').then(res => {
          if (res) {
            let comp = null
            switch (res.roleName) {
              case 'OPERATOR':
                comp = 'production'
                break
              case 'PRODUCTION_MANAGER':
                comp = 'stockin'
                break
            }
            this.$parent.updateUser(res)
            this.$router.replace({
              path: '/app/' + comp
            })
          } else {
            this.$router.replace({
              path: '/app/signin'
            })
          }
        }).catch(() => {
          this.$router.replace({
            path: '/app/signin'
          })
        }).finally(() => {
          this.$parent.setBusy()
        })
      }
    }
  }
</script>

<style lang="less">
  .app-checking {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5rem 0;

    img {
      height: 5rem;
    }
  }
</style>
