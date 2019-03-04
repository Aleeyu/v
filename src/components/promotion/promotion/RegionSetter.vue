<template>
  <Row>
    <Row v-if="!disabled">
      <Button type="ghost" @click="addRegion">添加区域</Button>
      <br><br>
    </Row>
    <Row v-for="region in localRegionList" :key="region.id" 
      class="group">
      <CityPicker class="citypicker" placeholder="请选择区域" 
        :disableCity="true"
        :disableArea="true"
        :multiple="false"
        :leafOnly="true"
        :clearable="false"
        :province.sync="region.province"
        @input="onInput"></CityPicker>
      <Button type="warning" class="btn-delete" @click="deleteRegion(region.id)">删除</Button>
    </Row>
  </Row>
</template>

<script>
import CityPicker from '@/components/common/CityPicker'

const jsonCopy = obj => JSON.parse(JSON.stringify(obj))

export default {
  components: { CityPicker },
  data () {
    return {
      localRegionList: []
    }
  },
  props: {
    regionList: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    init () {
      this.localRegionList = jsonCopy(this.regionList)
      this.localRegionList.forEach(d => {
        if (!d.id) {
          d.id = this.$uuid()
        }
      })
    },
    addRegion () {
      this.localRegionList.push({
        id: this.$uuid(),
        province: '110000'
      })
    },
    deleteRegion (id) {
      let i = this.localRegionList.findIndex(d => d.id === id)
      if (i !== -1) {
        this.localRegionList.splice(i, 1)
        this.onInput()
      }
    },
    onInput () {
      this.$nextTick(() => {
        this.$emit('on-change', jsonCopy(this.localRegionList))
      })
    }
  },
  watch: {
    regionList: {
      deep: true,
      handler (val, oldVal) {
        this.init()
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>
.group {
  margin-bottom: 10px;
}

.citypicker {
  width: 100%;
  padding-right: 90px;
}

.btn-delete {
  position: absolute;
  right: 0;
  top: 0;
  width: 80px;
}
</style>
