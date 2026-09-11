<template>
  <main class="g-page workbench">
    <header class="workbench__header">
      <div>
        <h1>销售工作台</h1>
        <p>{{ rangeLabel }} 的 CRM 经营概览</p>
      </div>
      <a-range-picker v-model="range" format="YYYY-MM-DD" value-format="YYYY-MM-DD" allow-clear @change="load" />
    </header>

    <section class="workbench__metrics">
      <article v-for="item in metrics" :key="item.label" class="metric">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section class="workbench__content">
      <a-card title="销售漏斗">
        <div class="funnel">
          <div v-for="item in funnel" :key="item.label" class="funnel__item">
            <span>{{ item.label }}</span>
            <b>{{ item.value }}</b>
          </div>
        </div>
      </a-card>
      <a-card title="待处理事项">
        <a-empty v-if="!summary.overdueFollowUps" description="暂无逾期跟进事项" />
        <div v-else class="overdue">
          <strong>{{ summary.overdueFollowUps }}</strong>
          <span>项跟进已逾期，请及时处理。</span>
          <a-button type="primary" @click="router.push('/crm/leads')">查看线索</a-button>
        </div>
      </a-card>
    </section>
  </main>
</template>

<script setup lang="ts">
import http from '@/utils/http'

defineOptions({ name: 'CrmDashboard' })

interface Summary {
  leadsCreated: number
  customersCreated: number
  openOpportunities: number
  opportunitiesWon: number
  opportunitiesLost: number
  quotesSubmitted: number
  quotesApproved: number
  contractsSigned: number
  ordersConfirmed: number
  ordersCancelled: number
  ordersClosed: number
  overdueFollowUps: number
}

const router = useRouter()
const range = ref<string[]>([])
const summary = reactive<Summary>({
  leadsCreated: 0, customersCreated: 0, openOpportunities: 0, opportunitiesWon: 0,
  opportunitiesLost: 0, quotesSubmitted: 0, quotesApproved: 0, contractsSigned: 0,
  ordersConfirmed: 0, ordersCancelled: 0, ordersClosed: 0, overdueFollowUps: 0
})
const rangeLabel = computed(() => range.value?.length === 2 ? `${range.value[0]} 至 ${range.value[1]}` : '全部时间')
const metrics = computed(() => [
  { label: '新增线索', value: summary.leadsCreated },
  { label: '新增客户', value: summary.customersCreated },
  { label: '进行中商机', value: summary.openOpportunities },
  { label: '已签合同', value: summary.contractsSigned },
  { label: '已确认订单', value: summary.ordersConfirmed },
  { label: 'CRM 内部关闭订单', value: summary.ordersClosed }
])
const funnel = computed(() => [
  { label: '进行中商机', value: summary.openOpportunities },
  { label: '赢单商机', value: summary.opportunitiesWon },
  { label: '已提交报价', value: summary.quotesSubmitted },
  { label: '已审批报价', value: summary.quotesApproved },
  { label: '已签合同', value: summary.contractsSigned },
  { label: '已确认订单', value: summary.ordersConfirmed }
])

async function load() {
  const params = range.value?.length === 2 ? { from: range.value[0], to: range.value[1] } : undefined
  const res = await http.get<Summary>('/workbench/summary', params)
  Object.assign(summary, res.data)
}

onMounted(load)
</script>

<style lang="scss" scoped>
.workbench { display: grid; gap: 16px; }
.workbench__header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
.workbench__header h1 { margin: 0; font-size: 24px; }
.workbench__header p { margin: 6px 0 0; color: var(--color-text-3); }
.workbench__metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.metric { display: grid; gap: 8px; padding: 18px; background: var(--color-bg-1); border: 1px solid var(--color-border-2); border-radius: 6px; }
.metric span { color: var(--color-text-3); font-size: 13px; }.metric strong { font-size: 26px; }
.workbench__content { display: grid; grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); gap: 16px; }
.funnel { display: grid; gap: 12px; }.funnel__item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border-1); }.funnel__item:last-child { border-bottom: 0; }
.overdue { display: grid; gap: 12px; align-items: start; }.overdue strong { font-size: 32px; color: rgb(var(--danger-6)); }
@media (width <= 1200px) { .workbench__metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (width <= 768px) { .workbench__header, .workbench__content { display: grid; grid-template-columns: 1fr; }.workbench__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
