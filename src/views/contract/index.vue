<template>
  <GiPageLayout margin>
    <GiTable title="合同列表" row-key="id" :data="contracts" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1250 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('contract:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateContractModal ref="createModalRef" :quotations="quotations" @success="refresh" />
    <ContractDrawer ref="drawerRef" />
    <VoidContractModal ref="voidModalRef" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { ContractItem } from '@/apis/business/contract'
import type { QuotationItem } from '@/apis/business/quotation'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { getContractList, signContract, submitContractSignature, withdrawContractSignature } from '@/apis/business/contract'
import { getQuotationList } from '@/apis/business/quotation'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import ContractDrawer from './ContractDrawer.vue'
import CreateContractModal from './CreateContractModal.vue'
import VoidContractModal from './VoidContractModal.vue'

defineOptions({ name: 'ContractIndex' })
const userStore = useUserStore()
const quotations = ref<QuotationItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateContractModal>>()
const drawerRef = ref<InstanceType<typeof ContractDrawer>>()
const voidModalRef = ref<InstanceType<typeof VoidContractModal>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: contracts, pagination, refresh } = useTable({ listAPI: getContractList })
const statusColor = (status: string) => ({ DRAFT: 'gray', PENDING_SIGNATURE: 'orange', SIGNED: 'green', VOIDED: 'red' }[status] || 'blue')
const transition = (record: ContractItem, action: 'submit' | 'sign' | 'withdraw') => {
  const config = {
    submit: { title: '提交签署', api: submitContractSignature, success: '合同已提交签署' },
    sign: { title: '确认签署', api: signContract, success: '合同已签署' },
    withdraw: { title: '撤回签署', api: withdrawContractSignature, success: '合同已撤回至草稿' }
  }[action]
  Modal.warning({ title: config.title, content: `确认操作合同“${record.name}”？`, hideCancel: false, onBeforeOk: async () => {
    await config.api(record)
    Message.success(config.success)
    refresh()
    return true
  } })
}
const columns: TableColumnData[] = [
  { title: '合同编号', dataIndex: 'contractNo', width: 180 },
  { title: '合同名称', dataIndex: 'name', width: 220 },
  { title: '状态', width: 130, align: 'center', render: ({ record }) => <Tag color={statusColor(record.status)}>{record.status}</Tag> },
  { title: '合同总额', width: 150, align: 'right', render: ({ record }) => <span>{`${record.currency} ${Number(record.totalAmount).toFixed(2)}`}</span> },
  { title: '生效日期', dataIndex: 'effectiveFrom', width: 120 },
  { title: '失效日期', dataIndex: 'effectiveTo', width: 120 },
  { title: '操作', width: 300, fixed: 'right', render: ({ record }) => {
    const item = record as ContractItem
    return (
      <Space>
        <Button type="text" size="small" onClick={() => drawerRef.value?.open(item)}>详情</Button>
        {item.status === 'DRAFT' && has('contract:submit-signature') ? <Button type="text" size="small" onClick={() => transition(item, 'submit')}>提交签署</Button> : null}
        {item.status === 'PENDING_SIGNATURE' && has('contract:sign') ? <Button type="text" size="small" onClick={() => transition(item, 'sign')}>确认签署</Button> : null}
        {item.status === 'PENDING_SIGNATURE' && has('contract:withdraw-signature') ? <Button type="text" size="small" onClick={() => transition(item, 'withdraw')}>撤回</Button> : null}
        {['DRAFT', 'PENDING_SIGNATURE', 'SIGNED'].includes(item.status) && has('contract:void') ? <Button type="text" status="danger" size="small" onClick={() => voidModalRef.value?.open(item)}>作废</Button> : null}
      </Space>
    )
  } }
]

getQuotationList({ page: 1, size: 200 }).then((res) => {
  quotations.value = res.data.records
})
</script>
