<template>
  <GiPageLayout margin>
    <a-tabs v-model:active-key="scope" type="rounded" class="scope-tabs" @change="search">
      <a-tab-pane key="private" title="我的线索" />
      <a-tab-pane key="public" title="线索公海" />
    </a-tabs>
    <GiTable title="线索列表" row-key="id" :data="leads" :columns="columns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1250 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="has('lead:create')" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateLeadModal ref="createModalRef" :channels="channels" @success="refresh" />
    <LeadActionModal ref="actionModalRef" :pools="pools" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { LeadItem } from '@/apis/business/lead'
import type { AcquisitionChannelItem } from '@/apis/config/acquisition-channel'
import type { PublicPoolItem } from '@/apis/directory'
import { Button, Message, Modal, Space, Tag } from '@arco-design/web-vue'
import { claimLead, getLeadList } from '@/apis/business/lead'
import { getAcquisitionChannelList } from '@/apis/config/acquisition-channel'
import { getPublicPools } from '@/apis/directory'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateLeadModal from './CreateLeadModal.vue'
import LeadActionModal from './LeadActionModal.vue'

defineOptions({ name: 'LeadIndex' })
const userStore = useUserStore()
const scope = ref<'private' | 'public'>('private')
const channels = ref<AcquisitionChannelItem[]>([])
const pools = ref<PublicPoolItem[]>([])
const createModalRef = ref<InstanceType<typeof CreateLeadModal>>()
const actionModalRef = ref<InstanceType<typeof LeadActionModal>>()
const has = (permission: string) => userStore.permissions.includes(permission)
const { loading, tableData: leads, pagination, search, refresh } = useTable({ listAPI: (page) => getLeadList(scope.value, page) })
const claim = (record: LeadItem) => Modal.warning({
  title: '认领线索',
  content: `确认认领“${record.name}”？`,
  hideCancel: false,
  onBeforeOk: async () => {
    await claimLead(record)
    Message.success('线索认领成功')
    refresh()
    return true
  }
})
const columns: TableColumnData[] = [
  { title: '线索编号', dataIndex: 'leadNo', width: 180 },
  { title: '线索名称', dataIndex: 'name', width: 150 },
  { title: '公司', dataIndex: 'companyName', width: 180, ellipsis: true, tooltip: true },
  { title: '手机号', dataIndex: 'mobile', width: 140 },
  { title: '来源', dataIndex: 'sourceType', width: 120 },
  { title: '渠道', dataIndex: 'acquisitionChannelCode', width: 130 },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={record.status === 'ACTIVE' ? 'green' : 'gray'}>{record.status}</Tag> },
  { title: '下次跟进', dataIndex: 'nextFollowUpAt', width: 180 },
  { title: '操作', width: 220, fixed: 'right', render: ({ record }) => {
    const item = record as LeadItem
    if (scope.value === 'public') return has('lead:claim') ? <Button type="text" size="small" onClick={() => claim(item)}>认领</Button> : null
    return (
      <Space>
        {has('lead:convert') && item.status === 'ACTIVE' ? <Button type="text" size="small" onClick={() => actionModalRef.value?.open('convert', item)}>转客户</Button> : null}
        {has('lead:release') && item.status === 'ACTIVE' ? <Button type="text" size="small" onClick={() => actionModalRef.value?.open('release', item)}>释放</Button> : null}
        {has('lead:invalidate') && item.status === 'ACTIVE' ? <Button type="text" status="danger" size="small" onClick={() => actionModalRef.value?.open('invalidate', item)}>无效</Button> : null}
      </Space>
    )
  } }
]

Promise.all([getAcquisitionChannelList(), getPublicPools('LEAD')]).then(([channelRes, poolRes]) => {
  channels.value = channelRes.data
  pools.value = poolRes.data
})
</script>

<style scoped>
.scope-tabs {
  flex: none;
  margin-bottom: var(--margin);
}
</style>
