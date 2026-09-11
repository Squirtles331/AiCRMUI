<template>
  <GiPageLayout margin>
    <a-tabs v-model:active-key="scope" type="rounded" class="scope-tabs" @change="search">
      <a-tab-pane key="private" title="我的客户" />
      <a-tab-pane key="public" title="客户公海" />
    </a-tabs>
    <GiTable title="客户列表" row-key="id" :data="customers" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1050 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('customer:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateCustomerModal ref="createModalRef" :pools="pools" @success="refresh" />
    <CustomerDrawer ref="drawerRef" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { CustomerItem } from '@/apis/business/customer'
import type { PublicPoolItem } from '@/apis/directory'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { claimCustomer, getCustomerList } from '@/apis/business/customer'
import { getPublicPools } from '@/apis/directory'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateCustomerModal from './CreateCustomerModal.vue'
import CustomerDrawer from './CustomerDrawer.vue'

defineOptions({ name: 'CustomerIndex' })
const userStore = useUserStore()
const scope = ref<'private' | 'public'>('private')
const pools = ref<PublicPoolItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateCustomerModal>>()
const drawerRef = ref<InstanceType<typeof CustomerDrawer>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: customers, pagination, search, refresh } = useTable({ listAPI: (page) => getCustomerList(scope.value, page) })
const claim = (record: CustomerItem) => Modal.warning({
  title: '认领客户',
  content: `确认认领“${record.name}”？`,
  hideCancel: false,
  onBeforeOk: async () => {
    await claimCustomer(record)
    Message.success('客户认领成功')
    refresh()
    return true
  }
})
const columns: TableColumnData[] = [
  { title: '客户编号', dataIndex: 'customerNo', width: 180 },
  { title: '客户名称', dataIndex: 'name', width: 200 },
  { title: '行业', dataIndex: 'industry', width: 130 },
  { title: '区域', dataIndex: 'region', width: 130 },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={record.status === 'ACTIVE' ? 'green' : 'gray'}>{record.status}</Tag> },
  { title: '下次跟进', dataIndex: 'nextFollowUpAt', width: 180 },
  { title: '操作', width: 150, fixed: 'right', render: ({ record }) => {
    const item = record as CustomerItem
    return (
      <Space>
        <Button type="text" size="small" onClick={() => drawerRef.value?.open(item)}>详情</Button>
        {scope.value === 'public' && has('customer:claim') ? <Button type="text" size="small" onClick={() => claim(item)}>认领</Button> : null}
      </Space>
    )
  } }
]

getPublicPools('CUSTOMER').then((res) => {
  pools.value = res.data
})
</script>

<style scoped>
.scope-tabs {
  flex: none;
  margin-bottom: var(--margin);
}
</style>
