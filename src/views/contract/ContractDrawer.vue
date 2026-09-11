<template>
  <a-drawer v-model:visible="visible" :width="860" title="合同详情" unmount-on-close>
    <a-descriptions v-if="contract" :column="3" bordered size="small" class="contract-summary">
      <a-descriptions-item label="合同编号">{{ contract.contractNo }}</a-descriptions-item>
      <a-descriptions-item label="合同名称">{{ contract.name }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ contract.status }}</a-descriptions-item>
      <a-descriptions-item label="合同总额">{{ contract.currency }} {{ contract.totalAmount }}</a-descriptions-item>
      <a-descriptions-item label="生效日期">{{ contract.effectiveFrom || '-' }}</a-descriptions-item>
      <a-descriptions-item label="失效日期">{{ contract.effectiveTo || '-' }}</a-descriptions-item>
    </a-descriptions>
    <GiTable title="合同快照" row-key="id" :data="lines" :columns="columns" :loading="loading" :pagination="false"
      :scroll="{ x: '100%', y: 520, minWidth: 760 }" @refresh="loadLines" />
  </a-drawer>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { ContractItem, ContractLine } from '@/apis/business/contract'
import { getContractLines } from '@/apis/business/contract'

const visible = ref(false)
const loading = ref(false)
const contract = ref<ContractItem>()
const lines = ref<ContractLine[]>([])
const loadLines = async () => {
  if (!contract.value) return
  try {
    loading.value = true
    lines.value = (await getContractLines(contract.value.id)).data
  } finally {
    loading.value = false
  }
}
const open = (record: ContractItem) => {
  contract.value = record
  visible.value = true
  loadLines()
}
const columns: TableColumnData[] = [
  { title: '#', dataIndex: 'lineNo', width: 60, align: 'center' },
  { title: 'SKU', dataIndex: 'sku', width: 130 },
  { title: '产品', dataIndex: 'productName', width: 180 },
  { title: '数量', dataIndex: 'quantity', width: 90, align: 'right' },
  { title: '单价', dataIndex: 'unitPrice', width: 110, align: 'right' },
  { title: '金额', dataIndex: 'lineAmount', width: 120, align: 'right' }
]

defineExpose({ open })
</script>

<style scoped>
.contract-summary {
  margin-bottom: var(--margin);
}
</style>
