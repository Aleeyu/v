<template>
  <Card dis-hover>
    <p slot="title">
      <Breadcrumb>
        <BreadcrumbItem>营销活动</BreadcrumbItem>
        <BreadcrumbItem>营销活动</BreadcrumbItem>
        <BreadcrumbItem v-if="current === 'FORM'">活动详情</BreadcrumbItem>
      </Breadcrumb>
    </p>
    <Row v-if="current === 'LIST'">
      <Row v-if="!error">
        <Row type="flex" justify="space-between" align="middle">
          <Col>
            <Row>
              <Button type="primary" @click="edit()">新建营销活动</Button>
            </Row>
          </Col>
          <Col>
            <Row type="flex" justify="end" align="middle">
              <Col style="margin-right: 10px;">
                <span>活动名称：</span>
                <Input style="width: 150px;" 
                  placeholder="活动名称" 
                  v-model="condition.eventName"
                  @on-enter="getList(1)">
                </Input>
              </Col>
              <Col style="margin-right: 10px;">
                <span>状态：</span>
                <Select style="width: 150px;" v-model="condition.status">
                  <Option v-for="option in condition.statusOptions" 
                    :key="option.value" 
                    :value="option.value">{{ option.text }}</Option>
                </Select>
              </Col>
              <Col style="margin-right: 10px;">
                <span>时间范围：</span>
                <DatePicker type="daterange" 
                  placeholder="创建时间" 
                  style="width: 180px" 
                  placement="bottom-end"
                  @on-change="handleDateChange">
                </DatePicker>
              </Col>
              <Col>
                <Button @click="getList(1)">搜索</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Table stripe :columns="list.columns" :data="list.data"></Table>
        <Row type="flex" justify="end">
          <Page size="small"
            show-elevator
            show-total
            :current="list.page"
            :page-size="list.pageSize"
            :total="list.totalCount"
            @on-change="getList">
          </Page>
        </Row>
      </Row>
      <error-view v-if="error" :error="error" :loading="errorLoading" @action="getList"></error-view>
    </Row>
    
    <PromotionForm v-if="current === 'FORM'" :id="currentId"
      @on-back="handleFormBack"
      @on-success="handleFormSuccess"></PromotionForm>
  </Card>
</template>

<script>
import PromotionForm from '@/components/promotion/promotion/PromotionForm'

export default {
  components: { PromotionForm },
  data () {
    return {
      error: null,
      errorLoading: false,
      list: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        data: [],
        columns: [
          {
            title: '活动信息',
            render: (h, p) => <row>
              <row style="margin-bottom: 10px;">
                <i-col>
                  <span>活动名称：{ p.row.eventName }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>开始时间：{ this.filterDate(p.row.beginTime) }</span>
                </i-col>
                <i-col span="12">
                  <span>结束时间：{ this.filterDate(p.row.endTime) }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>创建时间：{ this.filterDateTime(p.row.createdTime) }</span>
                </i-col>
                <i-col span="12">
                  <span>状态：{ this.filterStatus(p.row.status) }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>最大中奖人次：{ p.row.maxNumber }</span>
                </i-col>
                <i-col span="12">
                  <span>奖池总金额（元）：{ this.filterToYuan(p.row.totalPrize) }</span>
                </i-col>
              </row>
              <row style="margin-bottom: 10px;">
                <i-col span="12">
                  <span>红包最小金额（元）：{ this.filterToYuan(p.row.redpackBegin) }</span>
                </i-col>
                <i-col span="12">
                  <span>红包最大金额（元）：{ this.filterToYuan(p.row.redpackEnd) }</span>
                </i-col>
              </row>
            </row>
          },
          {
            title: '操作',
            width: 250,
            align: 'center',
            render: (h, p) => {
              let startBtn = <i-button type="primary" onClick={ () => this.start(p.row.id) }>开启</i-button>
              let stopBtn = <i-button onClick={ () => this.stop(p.row.id) }>结束</i-button>
              let editBtn = <i-button onClick={ () => this.edit(p.row.id) }>编辑</i-button>
              let deleteBtn = <i-button type="warning" onClick={ () => this.delete(p.row.id) }>删除</i-button>
              let viewBtn = <i-button onClick={ () => this.edit(p.row.id) }>查看详情</i-button>

              return <button-group>
                { p.row.status === 0 ? [startBtn, editBtn, deleteBtn] : undefined }
                { p.row.status === 1 ? [stopBtn, viewBtn] : undefined }
                { p.row.status === 2 ? [startBtn, viewBtn] : undefined }
                { p.row.status === null ? [deleteBtn] : undefined }
              </button-group>
            }
          }
        ]
      },
      condition: {
        eventName: null,
        startTime: null,
        endTime: null,
        status: -1,
        statusOptions: [
          { value: -1, text: '全部' },
          { value: 0, text: '创建中' },
          { value: 1, text: '已开始' },
          { value: 2, text: '已结束' }
        ]
      },
      current: 'LIST',
      currentId: null
    }
  },
  methods: {
    filterToYuan (val) {
      return (val / 100).toFixed(2);
    },
    filterStatus (val) {
      switch (val) {
        case 0:
          return '创建中'
        case 1:
          return '已开始'
        case 2:
          return '已结束'
        default:
          return '-'
      }
    },
    filterDate (val) {
      if (!val) {
        return '-'
      }
      let date = new Date(val)
      let dateString = date.toLocaleDateString()
      return dateString === 'Invalid Date' ? '-' : dateString
    },
    filterDateTime (val) {
      if (!val) {
        return '-'
      }
      let date = new Date(val)
      let dateString = date.toLocaleString()
      return dateString === 'Invalid Date' ? '-' : dateString
    },
    handleDateChange (dateList) {
      if (dateList[1] !== undefined) {
        dateList[0] += ' 00:00:00'
        dateList[1] += ' 23:59:59'
        this.condition.startTime = new Date(dateList[0]).getTime()
        this.condition.endTime = new Date(dateList[1]).getTime()
      } else {
        this.condition.startTime = this.condition.endTime = null
      }
    },
    getList (page = this.list.page) {
      let data = {
        _loading: true,
        page,
        size: this.list.pageSize,
        orderBy: [
          { property: 'createdTime', order: 'desc' }
        ],
        queryFilter: []
      }

      if (this.condition.eventName) {
        data.queryFilter.push({
          property: 'eventName',
          op: 'like',
          value: this.condition.eventName
        })
      }

      if (this.condition.status !== -1) {
        data.queryFilter.push({
          property: 'status',
          op: '=',
          value: this.condition.status
        })
      }

      if (this.condition.startTime) {
        data.queryFilter.push({
          property: 'createdTime',
          op: '>=',
          value: this.condition.startTime
        })
      }

      if (this.condition.endTime) {
        data.queryFilter.push({
          property: 'createdTime',
          op: '<=',
          value: this.condition.endTime
        })
      }

      if (this.error) {
        this.errorLoading = true
      }

      this.$http.post('/promo/event/search', data).then(res => {
        this.list.data = res.content
        this.list.page = res.page
        this.list.totalCount = res.totalCount

        this.error = null
      }).catch(error => {
        console.error(error)
        this.error = this.$Err.unhandled()
      }).finally(() => {
        this.errorLoading = false
      })
    },
    start (id) {
      this.$http.post(`/promo/updateStatus?id=${id}&status=1`, true).then(res => {
        this.$Message.success('活动开始成功！')
        let d = this.list.data.find(e => e.id === id)
        if (d) d.status = 1
      }).catch(error => {
        console.error(error)
        this.$Message.error(error.message || '活动开始失败，请稍后重试！')
      })
    },
    stop (id) {
      this.$http.post(`/promo/updateStatus?id=${id}&status=2`, true).then(res => {
        this.$Message.success('活动结束成功！')
        let d = this.list.data.find(e => e.id === id)
        if (d) d.status = 2
      }).catch(error => {
        console.error(error)
        this.$Message.error('活动结束失败，请稍后重试！')
      })
    },
    edit (id) {
      this.$router.push({
        path: this.$route.path,
        query: {
          id: id
        }
      })
      this.currentId = id ? id : null
      this.current = 'FORM'
    },
    delete (id) {
      this.$Modal.confirm({
        title: '确认删除？',
        content: '<p>确定删除活动吗？</p>',
        onOk: () => {
          this.$http.delete(`/promo/deleteProm?id=${id}`, true).then(res => {
            this.$Message.success('活动删除成功！')
            this.getList()
          }).catch(error => {
            console.error(error)
            this.$Message.error(error.message || '活动删除失败，请稍后重试！')
          })
        }
      })
    },
    handleFormBack () {
      this.currentId = null
      this.current = 'LIST'
      this.$router.push({
        path: this.$route.path
      })
      this.getList()
    },
    handleFormSuccess () {
      this.$Message.success('活动保存成功！')
      this.handleFormBack()
    }
  },
  mounted () {
    if (this.$route.query.id) {
      this.edit(this.$route.query.id)
    } else {
      this.getList()
    }
  }
}
</script>
