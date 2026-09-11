<template>
  <a-drawer v-model:visible="visible" :width="760" title="价目表明细" unmount-on-close>
    <a-descriptions v-if="detail" :column="2" bordered size="small" class="detail-summary">
      <a-descriptions-item label="编码">{{ detail.code }}</a-descriptions-item>
      <a-descriptions-item label="名称">{{ detail.name }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ detail.currency }}</a-descriptions-item>
      <a-descriptions-item label="状态"><a-tag :color="statusColor(detail.status)">{{ statusText(detail.status) }}</a-tag></a-descriptions-item>
    </a-descriptions>
    <GiTable title="价格项" row-key="id" :data="items" :columns="columns" :loading="loading" :pagination="false"
      :scroll="{ x: '100%', y: 500, minWidth: 680 }" @refresh="loadItems">
      <template #custom-extra>
        <GiButton v-if="canWrite && detail?.status === 'DRAFT'" type="add" size="small" @click="itemModalRef?.open(detail.id)" />
        <a-button v-if="canPublish && detail?.status === 'DRAFT'" type="primary" size="small" :loading="publishing" @click="publish">发布</a-button>
      </template>
    </GiTable>
    <AddPriceItemModal ref="itemModalRef" :products="products" @success="loadItems" />
  </a-drawer>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { PriceItem, PriceListItem, ProductItem } from '@/apis/config/catalog'
import { Message, Modal, Tag } from '@arco-design/web-vue'
import { getPriceItems, getProductList, publishPriceList } from '@/apis/config/catalog'
import { useUserStore } from '@/stores'
import AddPriceItemModal from './AddPriceItemModal.vue'

const emit = defineEmits<{ success: [] }>()
const userStore = useUserStore()
const canWrite = computed(() => userStore.permissions.includes('catalog:write'))
const canPublish = computed(() => userStore.permissions.includes('catalog:publish'))
const visible = ref(false)
const loading = ref(false)
const publishing = ref(false)
const detail = ref<PriceListItem>()
const items = ref<PriceItem[]>([])
const products = ref<ProductItem[]>([])
const itemModalRef = ref<InstanceType<typeof AddPriceItemModal>>()
const productNames = computed(() => new Map(products.value.map((item) => [item.id, `${item.sku} - ${item.name}`])))
const statusText = (status: string) => ({ DRAFT: '草稿', ACTIVE: '已发布', EXPIRED: '已过期', DISABLED: '已停用' }[status] || status)
const statusColor = (status: string) => ({ DRAFT: 'gray', ACTIVE: 'green', EXPIRED: 'orange', DISABLED: 'red' }[status] || 'gray')
const loadItems = async () => {
  if (!detail.value) return
  try {
    loading.value = true
    const [itemRes, productRes] = await Promise.all([getPriceItems(detail.value.id), getProductList({ page: 1, size: 200 })])
    items.value = itemRes.data
    products.value = productRes.data.records
  } finally {
    loading.value = false
  }
}
const open = (record: PriceListItem) => {
  detail.value = { ...record }
  visible.value = true
  loadItems()
}
const publish = () => {
  if (!detail.value) return
  Modal.warning({
    title: '发布价目表',
    content: '发布后价目表将用于正式报价，确认继续？',
    hideCancel: false,
    onBeforeOk: async () => {
      if (!detail.value) return false
      publishing.value = true
      try {
        detail.value = (await publishPriceList(detail.value.id, detail.value.version)).data
        Message.success('价目表发布成功')
        emit('success')
        return true
      } finally {
        publishing.value = false
      }
    }
  })
}
const columns: TableColumnData[] = [
  { title: '产品', width: 220, render: ({ record }) => <span>{productNames.value.get(record.productId) || record.productId}</span> },
  { title: '标准价', dataIndex: 'listPrice', width: 110, align: 'right' },
  { title: '最低价', dataIndex: 'minimumPrice', width: 110, align: 'right' },
  { title: '税率', width: 90, align: 'right', render: ({ record }) => <span>{`${Number(record.taxRate) * 100}%`}</span> },
  { title: '状态', width: 90, align: 'center', render: ({ record }) => <Tag color={record.status === 'ACTIVE' ? 'green' : 'gray'}>{record.status}</Tag> }
]

defineExpose({ open })
</script>

<style scoped>
.detail-summary {
  margin-bottom: var(--margin);
}
</style>
