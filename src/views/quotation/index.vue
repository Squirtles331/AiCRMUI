<template>
  <GiPageLayout margin>
    <GiTable title="报价列表" row-key="id" :data="quotations" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1050 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('quote:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateQuotationModal ref="createModalRef" :opportunities="opportunities" @success="refresh" />
    <QuotationDrawer ref="drawerRef" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { OpportunityItem } from '@/apis/business/opportunity'
import type { QuotationItem } from '@/apis/business/quotation'
import { Button, Tag } from '@arco-design/web-vue'
import { getOpportunityList } from '@/apis/business/opportunity'
import { getQuotationList } from '@/apis/business/quotation'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateQuotationModal from './CreateQuotationModal.vue'
import QuotationDrawer from './QuotationDrawer.vue'

defineOptions({ name: 'QuotationIndex' })
const userStore = useUserStore()
const opportunities = ref<OpportunityItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateQuotationModal>>()
const drawerRef = ref<InstanceType<typeof QuotationDrawer>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: quotations, pagination, refresh } = useTable({ listAPI: getQuotationList })
const statusColor = (status: string) => ({ DRAFT: 'gray', SUBMITTED: 'orange', APPROVED: 'green', REJECTED: 'red', EXPIRED: 'purple', CANCELLED: 'gray' }[status] || 'blue')
const columns: TableColumnData[] = [
  { title: '报价编号', dataIndex: 'quoteNo', width: 180 },
  { title: '商机 ID', dataIndex: 'opportunityId', width: 170 },
  { title: '币种', dataIndex: 'currency', width: 80, align: 'center' },
  { title: '状态', width: 140, align: 'center', render: ({ record }) => <Tag color={statusColor(record.status)}>{record.status}</Tag> },
  { title: '当前版本', width: 100, align: 'center', render: ({ record }) => <span>{`V${record.currentVersionNo}`}</span> },
  { title: '有效期至', dataIndex: 'validUntil', width: 130 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 190 },
  { title: '操作', width: 90, fixed: 'right', align: 'center', render: ({ record }) => <Button type="text" size="small" onClick={() => drawerRef.value?.open(record as QuotationItem)}>详情</Button> }
]

getOpportunityList({ page: 1, size: 200 }).then((res) => {
  opportunities.value = res.data.records
})
</script>
