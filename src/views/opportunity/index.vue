<template>
  <GiPageLayout margin>
    <GiTable title="商机列表" row-key="id" :data="opportunities" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1200 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('opportunity:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateOpportunityModal ref="createModalRef" :customers="customers" @success="refresh" />
    <OpportunityActionModal ref="actionModalRef" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { CustomerItem } from '@/apis/business/customer'
import type { OpportunityItem } from '@/apis/business/opportunity'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { getCustomerList } from '@/apis/business/customer'
import { getOpportunityList, restartOpportunity, winOpportunity } from '@/apis/business/opportunity'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateOpportunityModal from './CreateOpportunityModal.vue'
import OpportunityActionModal from './OpportunityActionModal.vue'

defineOptions({ name: 'OpportunityIndex' })
const userStore = useUserStore()
const customers = ref<CustomerItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateOpportunityModal>>()
const actionModalRef = ref<InstanceType<typeof OpportunityActionModal>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: opportunities, pagination, refresh } = useTable({ listAPI: getOpportunityList })
const statusText = (status: string) => ({ OPEN: '进行中', WON: '赢单', LOST: '输单' }[status] || status)
const runAction = (record: OpportunityItem, action: 'win' | 'restart') => Modal.warning({
  title: action === 'win' ? '确认赢单' : '重启商机',
  content: `确认操作商机“${record.name}”？`,
  hideCancel: false,
  onBeforeOk: async () => {
    await (action === 'win' ? winOpportunity(record) : restartOpportunity(record))
    Message.success(action === 'win' ? '商机已赢单' : '商机已重启')
    refresh()
    return true
  }
})
const columns: TableColumnData[] = [
  { title: '商机编号', dataIndex: 'opportunityNo', width: 180 },
  { title: '商机名称', dataIndex: 'name', width: 200 },
  { title: '阶段', dataIndex: 'stage', width: 140 },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={record.status === 'WON' ? 'green' : record.status === 'LOST' ? 'red' : 'blue'}>{statusText(record.status)}</Tag> },
  { title: '预计金额', width: 140, align: 'right', render: ({ record }) => <span>{`${record.currency} ${Number(record.expectedAmount).toFixed(2)}`}</span> },
  { title: '概率', width: 90, align: 'right', render: ({ record }) => <span>{`${record.probability}%`}</span> },
  { title: '预计成交日', dataIndex: 'expectedCloseDate', width: 130 },
  { title: '操作', width: 240, fixed: 'right', render: ({ record }) => {
    const item = record as OpportunityItem
    return (
      <Space>
        {item.status === 'OPEN' && has('opportunity:stage') ? <Button type="text" size="small" onClick={() => actionModalRef.value?.open('stage', item)}>推进</Button> : null}
        {item.status === 'OPEN' && has('opportunity:win') ? <Button type="text" size="small" onClick={() => runAction(item, 'win')}>赢单</Button> : null}
        {item.status === 'OPEN' && has('opportunity:lose') ? <Button type="text" status="danger" size="small" onClick={() => actionModalRef.value?.open('lose', item)}>输单</Button> : null}
        {item.status === 'LOST' && has('opportunity:restart') ? <Button type="text" size="small" onClick={() => runAction(item, 'restart')}>重启</Button> : null}
      </Space>
    )
  } }
]

getCustomerList('private', { page: 1, size: 200 }).then((res) => {
  customers.value = res.data.records
})
</script>
