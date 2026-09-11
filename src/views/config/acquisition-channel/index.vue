<template>
  <GiPageLayout margin>
    <GiTable title="获客渠道" row-key="id" :data="filteredChannels" :columns="columns" :loading="loading"
      :pagination="false" :scroll="{ x: '100%', y: '100%', minWidth: 950 }" @refresh="loadChannels">
      <template #custom-extra>
        <a-input-search v-model="keyword" placeholder="搜索渠道" allow-clear style="width: 220px" />
        <GiButton v-if="canManage" type="add" size="small" @click="createModalRef?.open()" />
      </template>
    </GiTable>
    <CreateChannelModal ref="createModalRef" @success="loadChannels" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { AcquisitionChannelItem } from '@/apis/config/acquisition-channel'
import { Button, Message, Modal, Tag } from '@arco-design/web-vue'
import {

  activateAcquisitionChannel,
  disableAcquisitionChannel,
  getAcquisitionChannelList
} from '@/apis/config/acquisition-channel'
import { useUserStore } from '@/stores'
import CreateChannelModal from './CreateChannelModal.vue'

defineOptions({ name: 'ConfigAcquisitionChannel' })
const userStore = useUserStore()
const canManage = computed(() => userStore.permissions.includes('channel:manage'))
const loading = ref(false)
const channels = ref<AcquisitionChannelItem[]>([])
const keyword = ref('')
const createModalRef = ref<InstanceType<typeof CreateChannelModal>>()
const filteredChannels = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  return value ? channels.value.filter((item) => `${item.code} ${item.name} ${item.sourceType}`.toLowerCase().includes(value)) : channels.value
})
const statusText = (status: string) => ({ DRAFT: '草稿', ACTIVE: '启用', DISABLED: '停用' }[status] || status)
const statusColor = (status: string) => ({ DRAFT: 'gray', ACTIVE: 'green', DISABLED: 'red' }[status] || 'gray')
const loadChannels = async () => {
  try {
    loading.value = true
    channels.value = (await getAcquisitionChannelList()).data
  } finally {
    loading.value = false
  }
}
const changeStatus = (record: AcquisitionChannelItem) => {
  const activating = record.status !== 'ACTIVE'
  Modal.warning({
    title: activating ? '启用渠道' : '停用渠道',
    content: `确认${activating ? '启用' : '停用'}“${record.name}”？`,
    hideCancel: false,
    onBeforeOk: async () => {
      const api = activating ? activateAcquisitionChannel : disableAcquisitionChannel
      await api(record.id, record.version)
      Message.success(`渠道已${activating ? '启用' : '停用'}`)
      await loadChannels()
      return true
    }
  })
}
const columns: TableColumnData[] = [
  { title: '渠道编码', dataIndex: 'code', width: 170 },
  { title: '渠道名称', dataIndex: 'name', width: 200 },
  { title: '来源类型', dataIndex: 'sourceType', width: 160 },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={statusColor(record.status)}>{statusText(record.status)}</Tag> },
  { title: '更新时间', dataIndex: 'updatedAt', width: 190 },
  { title: '操作', width: 110, align: 'center', render: ({ record }) => canManage.value ? <Button type="text" size="small" onClick={() => changeStatus(record as AcquisitionChannelItem)}>{record.status === 'ACTIVE' ? '停用' : '启用'}</Button> : null }
]

loadChannels()
</script>
