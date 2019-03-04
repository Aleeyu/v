<template>
  <div class="app-address app-common-layout">
    <div class="app-banner bottom-border">
      <v-touch class="app-banner-button" @tap="back">
        <Button type="text" icon="chevron-left"></Button>
      </v-touch>
      <div class="app-banner-title">
        <h1 v-if="modify">编辑收货地址</h1>
        <h1 v-else>新建收货地址</h1>
      </div>
      <div class="app-banner-button right">
        <Button type="text" v-if="modify" @click.stop="remove">删除</Button>
      </div>
    </div>

    <list-panel class="app-body app-common-body" :refreshable="false" :pageable="false">
      <Form v-if="model" ref="form" :model="model" :rules="rules" class="app-setting-form" label-position="left">
        <Form-item class="bottom-border" prop="contactUser" label="收货人">
          <Input :maxlength="10" v-model.trim="model.contactUser" placeholder="请输入收货人姓名"/>
        </Form-item>
        <Form-item class="bottom-border" prop="mobile" label="手机号码">
          <Input :maxlength="11" v-model.trim="model.mobile" placeholder="请输入能联系收货人的手机号码"/>
        </Form-item>
        <Form-item class="bottom-border" prop="area" label="所在地区">
          <city-picker :mobile="true" :multiple="false" :fullPath="true" :leafOnly="true"
                       :province.sync="model.province" :provinceName.sync="model.provinceName"
                       :city.sync="model.city" :cityName.sync="model.cityName"
                       :area.sync="model.area" :areaName.sync="model.areaName"
                       placeholder="请选择送货的目的地"></city-picker>
        </Form-item>
        <Form-item class="bottom-border" prop="address" label="详细地址">
          <Input type="textarea" :maxlength="100" v-model.trim="model.address" placeholder="请输入街道、楼牌号等"/>
        </Form-item>
      </Form>
    </list-panel>

    <div class="app-menus">
      <Button class="primary horizontal" @click.stop="save">保存</Button>
    </div>
  </div>
</template>

<script>
  import ListPanel from '@/components/mallapp/ListPanel'

  export default {
    components: {ListPanel},
    data () {
      return {
        busy: false,
        model: null,
        modify: false,
        rules: {
          contactUser: [{required: true, message: '收货人为必填'}],
          mobile: [
            {required: true, message: '手机号码为必填项'},
            {pattern: /^\d{11}$/, message: '手机号码不正确'}
          ],
          area: [{required: true, message: '所在地区为必填'}],
          address: [{required: true, message: '详细地址为必填'}]
        }
      }
    },
    methods: {
      /**
       * 后退至上一页
       */
      back: function () {
        this.$router.back()
      },
      shown: function () {
        this.model = null
        this.modify = this.$route.query.id != null && this.$route.query.id !== ''
        if (this.modify) {
          this.load()
        } else {
          setTimeout(() => {
            this.model = {
              mobile: '',
              contactUser: '',
              province: '',
              provinceName: '',
              city: '',
              cityName: '',
              area: '',
              areaName: '',
              address: '',
              selected: 0,
              tag: ''
            }
          }, 50)
        }
      },
      load: function () {
        if (!this.busy) {
          this.busy = true
          this.$http.post('/wechat/customer/address/search', {
            page: 1,
            size: 10,
            queryFilter: [{property: 'addressId', op: '=', value: this.$route.query.id}]
          }).then(res => {
            if (res && this.$isArray(res.content, true)) {
              this.model = res.content[0]
            } else {
              throw new Error('Not found')
            }
          }).catch(err => {
            console.log(err)
            this.$Message.error('获取信息失败')
            this.back()
          }).finally(() => {
            this.busy = false
          })
        }
      },
      save: function () {
        if (!this.busy) {
          this.$refs.form.validate(valid => {
            if (valid) {
              this.busy = true
              this.$http[this.modify ? 'put' : 'post'](this.modify ? `/wechat/customer/address/${this.$route.query.id}` : '/wechat/customer/address', Object.assign({}, this.model, {_loading: true})).then(res => {
                this.$Message.success('保存收货地址成功')
                if (this.$isPlainObject(this.$parent.receivingAddress) && this.$parent.receivingAddress.addressId === this.$route.query.id) {
                  Object.assign(this.$parent.receivingAddress, this.model)
                }
                this.back()
              }).catch(err => {
                this.$Message.error(err.message || err.msg || '保存收货地址失败')
              }).finally(() => {
                this.busy = false
              })
            }
          })
        }
      },
      remove: function () {
        if (!this.busy && this.$isPlainObject(this.model)) {
          this.$parent.confirm('确定删除该地址吗？').then(() => {
            this.busy = true
            this.$http.delete(`/wechat/customer/address/${this.model.addressId}`, true).then(res => {
              this.$Message.success('删除地址成功')
              this.back()
            }).catch(err => {
              this.$message.error(err.message || err.msg || '删除地址失败，请稍候重试')
            }).finally(() => {
              this.busy = false
            })
          })
        }
      }
    }
  }
</script>
