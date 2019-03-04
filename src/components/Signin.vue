<template>
  <div class="layout">

    <Row type="flex" align="middle" class="content">
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
      <i-col :xs="20" :sm="20" :md="18" :lg="16" class="content-inner">
        <div class="logo-box">
          <div class="logo"></div>
          <Row type="flex" align="middle">
            <!-- <i-col>
              <h1>为亿万用户插上大数据的翅膀</h1>
              <br/>
              <h3>很多人还没搞清楚什么是PC互联网，移动互联网来了</h3>
              <h3>我们还没搞清楚移动互联的时候，大数据时代又来了</h3>
            </i-col> -->
          </Row>
        </div>
        <signinpanel style="width: 420px;"></signinpanel>
      </i-col>
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
    </Row>

    <!-- <Row type="flex" align="middle" class="articles">
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
      <i-col :xs="20" :sm="20" :md="18" :lg="16" style="text-align: center">
        <article class="ivu-article">
          <h1>我们能为您做什么</h1>
          <h2>不管您有什么问题, 万码易联都能够为您提供解决方案.</h2>

          <Row type="flex" justify="space-between" align="top">
            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>

            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>

            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>
          </Row>
        </article>

        <article class="ivu-article">
          <h1>我们能为您做什么</h1>
          <h2>不管您有什么问题, 万码易联都能够为您提供解决方案.</h2>

          <Row type="flex" justify="space-between" align="top">
            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>

            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>

            <i-col span="6" class="item-col">
              <Icon type="ios-body" class="item-icon"></Icon>
              <h2>线下客户</h2>
              <h4>客户组成、消费习惯？请放心！我们可以为您记录每一条消费信息，让您知道每一件产品的去向。</h4>
            </i-col>
          </Row>
        </article>
      </i-col>
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
    </Row> -->

    <Row type="flex" align="middle" class="footer">
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
      <i-col :xs="20" :sm="20" :md="18" :lg="16" style="text-align: center">
        <a href="http://www.erathink.com">关于浪新</a>&nbsp;&nbsp;|&nbsp;&nbsp;
        <router-link :to="{ path: 'http://www.erathink.com' }">服务协议</router-link>&nbsp;&nbsp;|&nbsp;&nbsp;
        <router-link :to="{ path: 'http://www.erathink.com' }">联系客服</router-link>&nbsp;&nbsp;|&nbsp;&nbsp;
        蜀ICP证XXXXXX号&nbsp;&nbsp;|&nbsp;&nbsp;
        Copyright &copy; 2016-2017 Erathink. All Rights Reserved. -version-
      </i-col>
      <i-col :xs="2" :sm="2" :md="3" :lg="4"></i-col>
    </Row>
  </div>
</template>

<script>
  import signinpanel from '@/components/common/SigninPanel'

  export default {
    name: 'signin',
    components: {signinpanel},
    data () {
      return {
      }
    }
  }
</script>

<style lang="less" scoped>
  .layout{
    height: 100% !important;
  }
  .content {
    padding: 20px 0;
    // height: 500px;
    background: url("../../static/images/background.jpg");
    background-position: center center;
    background-size: cover;
    position: absolute;
    right: 0;
    left: 0;
    top:0;
    bottom:0;
    z-index: 2;

    > .content-inner {
      height: 100%;

      > .ivu-row-flex {
        height: 100%;
      }
    }
  }

  .logo-box {

    .logo {
      width: 220px;
      height: 96px;
      margin-top: 26px;
      background: url("../../static/images/logo.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: top left;

      + .ivu-row-flex {
        height: 360px;
      }
    }

    h1, h3 {
      color: white;
      font-weight: lighter;
      line-height: 150%;
    }
  }

  .articles {
    article {
      padding: 70px 0;
      border-bottom: #e2e2e2 solid 1px;

      &:last-child {
        border-bottom: none;
      }

      h1 {
        font-size: 42px;
        font-weight: 400;
      }

      .item-col {
        margin-top: 50px;
      }

      .item-icon {
        font-size: 42px;
        width: 64px;
        height: 64px;
        line-height: 64px;
        color: white;
        background-color: #2d8cf0;
        border-radius: 50%;

        + h2 {
          margin: 5px 0;
        }
      }
    }
  }

  .footer {
    background-color: rgba(0, 0, 0, .1);
    height: 64px;
    color: #657180;
    position: fixed;
    z-index: 3;
    bottom:0;
    width: 100%;
    a {
      color: #657180;

      &:hover {
        color: #3399ff;
      }
    }
  }
</style>
