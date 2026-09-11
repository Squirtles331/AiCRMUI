<template>
  <GiPageLayout margin>
    <GiTable title="销售订单" row-key="id" :data="orders" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1150 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('order:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateOrderModal ref="createModalRef" :contracts="contracts" @success="refreshAll" />
    <OrderReasonModal ref="reasonModalRef" @success="refresh" />
    <OrderDrawer ref="drawerRef" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { ContractItem } from '@/apis/business/contract'
import type { SalesOrderItem } from '@/apis/business/order'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { getContractList } from '@/apis/business/contract'
import { confirmSalesOrder, getSalesOrderList } from '@/apis/business/order'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateOrderModal from './CreateOrderModal.vue'
import OrderDrawer from './OrderDrawer.vue'
import OrderReasonModal from './OrderReasonModal.vue'

defineOptions({ name: 'OrderIndex' })
const userStore = useUserStore()
const contracts = ref<ContractItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateOrderModal>>()
const reasonModalRef = ref<InstanceType<typeof OrderReasonModal>>()
const drawerRef = ref<InstanceType<typeof OrderDrawer>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: orders, pagination, refresh } = useTable({ listAPI: getSalesOrderList })
const statusColor = (status: string) => ({ DRAFT: 'gray', CONFIRMED: 'green', CANCELLING: 'orange', CANCELLED: 'red', CLOSED: 'blue' }[status] || 'gray')
const loadContracts = async () => {
  contracts.value = (await getContractList({ page: 1, size: 200 })).data.records
}
const refreshAll = () => {
  refresh()
  loadContracts()
}
const confirm = (record: SalesOrderItem) => Modal.warning({
  title: '确认销售订单',
  content: `确认订单“${record.orderNo}”？`,
  hideCancel: false,
  onBeforeOk: async () => {
    await confirmSalesOrder(record)
    Message.success('销售订单已确认')
    refresh()
    return true
  }
})
const columns: TableColumnData[] = [
  { title: '订单编号', dataIndex: 'orderNo', width: 180 },
  { title: '合同 ID', dataIndex: 'contractId', width: 170 },
  { title: '状态', width: 120, align: 'center', render: ({ record }) => <Tag color={statusColor(record.status)}>{record.status}</Tag> },
  { title: '订单总额', width: 150, align: 'right', render: ({ record }) => <span>{`${record.currency} ${Number(record.totalAmount).toFixed(2)}`}</span> },
  { title: '确认时间', dataIndex: 'confirmedAt', width: 180 },
  { title: '关闭时间', dataIndex: 'closedAt', width: 180 },
  { title: '操作', width: 270, fixed: 'right', render: ({ record }) => {
    const item = record as SalesOrderItem
    return (
      <Space>
        <Button type="text" size="small" onClick={() => drawerRef.value?.open(item)}>详情</Button>
        {item.status === 'DRAFT' && has('order:confirm') ? <Button type="text" size="small" onClick={() => confirm(item)}>确认</Button> : null}
        {item.status === 'CONFIRMED' && has('order:cancel') ? <Button type="text" status="danger" size="small" onClick={() => reasonModalRef.value?.open('cancel', item)}>申请取消</Button> : null}
        {item.status === 'CONFIRMED' && has('order:close') ? <Button type="text" size="small" onClick={() => reasonModalRef.value?.open('close', item)}>关闭</Button> : null}
      </Space>
    )
  } }
]

loadContracts()
</script>
