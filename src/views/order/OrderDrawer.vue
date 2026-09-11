<template>
  <a-drawer v-model:visible="visible" :width="900" title="销售订单详情" unmount-on-close>
    <a-descriptions v-if="order" :column="3" bordered size="small" class="order-summary">
      <a-descriptions-item label="订单编号">{{ order.orderNo }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ order.status }}</a-descriptions-item>
      <a-descriptions-item label="订单总额">{{ order.currency }} {{ order.totalAmount }}</a-descriptions-item>
      <a-descriptions-item v-if="order.closeReason" label="关闭原因" :span="3">{{ order.closeReason }}</a-descriptions-item>
    </a-descriptions>
    <a-tabs default-active-key="lines">
      <a-tab-pane key="lines" title="订单明细">
        <GiTable row-key="id" :data="lines" :columns="lineColumns" :loading="loading" :pagination="false" />
      </a-tab-pane>
      <a-tab-pane key="cancellations" title="取消申请">
        <GiTable row-key="id" :data="cancellations" :columns="cancellationColumns" :loading="loading" :pagination="false" />
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { OrderCancellation, SalesOrderItem, SalesOrderLine } from '@/apis/business/order'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { decideOrderCancel, getOrderCancellations, getSalesOrderLines } from '@/apis/business/order'
import { useUserStore } from '@/stores'

const emit = defineEmits<{ success: [] }>()
const userStore = useUserStore()
const visible = ref(false)
const loading = ref(false)
const order = ref<SalesOrderItem>()
const lines = ref<SalesOrderLine[]>([])
const cancellations = ref<OrderCancellation[]>([])
const canApprove = computed(() => userStore.permissions.includes('order:approve-cancel'))
const load = async () => {
  if (!order.value) return
  try {
    loading.value = true
    const [lineRes, cancellationRes] = await Promise.all([getSalesOrderLines(order.value.id), getOrderCancellations(order.value.id)])
    lines.value = lineRes.data
    cancellations.value = cancellationRes.data
  } finally {
    loading.value = false
  }
}
const open = (record: SalesOrderItem) => {
  order.value = record
  visible.value = true
  load()
}
const decide = (cancellation: OrderCancellation, approved: boolean) => {
  if (!order.value) return
  Modal.warning({
    title: approved ? '批准取消' : '驳回取消',
    content: `确认${approved ? '批准' : '驳回'}取消申请“${cancellation.cancelNo}”？`,
    hideCancel: false,
    onBeforeOk: async () => {
      if (!order.value) return false
      order.value = (await decideOrderCancel(order.value, cancellation, approved, approved ? undefined : '管理员驳回')).data
      Message.success(approved ? '订单已取消' : '取消申请已驳回')
      await load()
      emit('success')
      return true
    }
  })
}
const lineColumns: TableColumnData[] = [
  { title: '#', dataIndex: 'lineNo', width: 60, align: 'center' },
  { title: 'SKU', dataIndex: 'sku', width: 130 },
  { title: '产品', dataIndex: 'productName', width: 180 },
  { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
  { title: '单价', dataIndex: 'unitPrice', width: 110, align: 'right' },
  { title: '金额', dataIndex: 'lineAmount', width: 120, align: 'right' }
]
const cancellationColumns: TableColumnData[] = [
  { title: '申请编号', dataIndex: 'cancelNo', width: 180 },
  { title: '原因', dataIndex: 'reason', width: 220, ellipsis: true, tooltip: true },
  { title: '状态', width: 110, render: ({ record }) => <Tag>{record.status}</Tag> },
  { title: '申请时间', dataIndex: 'requestedAt', width: 180 },
  { title: '操作', width: 140, render: ({ record }) => canApprove.value && record.status === 'PENDING'
    ? (
        <Space>
          <Button type="text" size="small" onClick={() => decide(record as OrderCancellation, true)}>批准</Button>
          <Button type="text" status="danger" size="small" onClick={() => decide(record as OrderCancellation, false)}>驳回</Button>
        </Space>
      )
    : null }
]

defineExpose({ open })
</script>

<style scoped>
.order-summary {
  margin-bottom: var(--margin);
}
</style>
