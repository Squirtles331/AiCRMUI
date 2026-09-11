<template>
  <GiPageLayout margin>
    <GiTable title="价目表" row-key="id" :data="priceLists" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1050 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="canWrite" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreatePriceListModal ref="createModalRef" @success="refresh" />
    <PriceListDrawer ref="detailDrawerRef" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import { Button, Tag } from '@arco-design/web-vue'
import { getPriceList, type PriceListItem } from '@/apis/config/catalog'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreatePriceListModal from './CreatePriceListModal.vue'
import PriceListDrawer from './PriceListDrawer.vue'

defineOptions({ name: 'ConfigPriceList' })
const userStore = useUserStore()
const canWrite = computed(() => userStore.permissions.includes('catalog:write'))
const createModalRef = ref<InstanceType<typeof CreatePriceListModal>>()
const detailDrawerRef = ref<InstanceType<typeof PriceListDrawer>>()
const { loading, tableData: priceLists, pagination, refresh } = useTable({ listAPI: getPriceList })
const statusText = (status: string) => ({ DRAFT: '草稿', ACTIVE: '已发布', EXPIRED: '已过期', DISABLED: '已停用' }[status] || status)
const statusColor = (status: string) => ({ DRAFT: 'gray', ACTIVE: 'green', EXPIRED: 'orange', DISABLED: 'red' }[status] || 'gray')
const formatTime = (value?: string) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
const columns: TableColumnData[] = [
  { title: '编码', dataIndex: 'code', width: 150 },
  { title: '名称', dataIndex: 'name', width: 200 },
  { title: '币种', dataIndex: 'currency', width: 90, align: 'center' },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={statusColor(record.status)}>{statusText(record.status)}</Tag> },
  { title: '生效时间', width: 170, render: ({ record }) => <span>{formatTime(record.effectiveFrom)}</span> },
  { title: '失效时间', width: 170, render: ({ record }) => <span>{formatTime(record.effectiveTo)}</span> },
  { title: '操作', width: 90, align: 'center', render: ({ record }) => <Button type="text" size="small" onClick={() => detailDrawerRef.value?.open(record as PriceListItem)}>明细</Button> }
]
</script>
