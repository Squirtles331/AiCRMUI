<template>
  <a-drawer v-model:visible="visible" :width="860" title="报价详情" unmount-on-close>
    <a-descriptions v-if="quotation" :column="3" bordered size="small" class="quote-summary">
      <a-descriptions-item label="报价编号">{{ quotation.quoteNo }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ quotation.status }}</a-descriptions-item>
      <a-descriptions-item label="当前版本">V{{ quotation.currentVersionNo }}</a-descriptions-item>
    </a-descriptions>
    <a-tabs v-model:active-key="activeVersion" @change="loadLines">
      <a-tab-pane v-for="item in versions" :key="item.versionNo" :title="`V${item.versionNo} · ${item.status}`" />
    </a-tabs>
    <GiTable title="报价快照" row-key="id" :data="lines" :columns="columns" :loading="loading" :pagination="false"
      :scroll="{ x: '100%', y: 480, minWidth: 760 }" @refresh="loadLines" />
  </a-drawer>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { QuotationItem, QuotationLine, QuotationVersion } from '@/apis/business/quotation'
import { getQuotationLines, getQuotationVersions } from '@/apis/business/quotation'

const visible = ref(false)
const loading = ref(false)
const quotation = ref<QuotationItem>()
const versions = ref<QuotationVersion[]>([])
const lines = ref<QuotationLine[]>([])
const activeVersion = ref(1)
const loadLines = async () => {
  if (!quotation.value) return
  try {
    loading.value = true
    lines.value = (await getQuotationLines(quotation.value.id, activeVersion.value)).data
  } finally {
    loading.value = false
  }
}
const open = async (record: QuotationItem) => {
  quotation.value = record
  visible.value = true
  versions.value = (await getQuotationVersions(record.id)).data
  activeVersion.value = record.currentVersionNo
  await loadLines()
}
const columns: TableColumnData[] = [
  { title: '#', dataIndex: 'lineNo', width: 60, align: 'center' },
  { title: 'SKU', dataIndex: 'sku', width: 130 },
  { title: '产品', dataIndex: 'productName', width: 180 },
  { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
  { title: '单价', dataIndex: 'unitPrice', width: 110, align: 'right' },
  { title: '税率', width: 90, align: 'right', render: ({ record }) => <span>{`${Number(record.taxRate) * 100}%`}</span> },
  { title: '金额', dataIndex: 'lineAmount', width: 120, align: 'right' }
]

defineExpose({ open })
</script>

<style scoped>
.quote-summary {
  margin-bottom: var(--margin);
}
</style>
