<template>
  <a-modal v-model:visible="visible" title="新增报价" :width="900" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
    <a-divider orientation="left">报价明细</a-divider>
    <a-table row-key="key" :data="lines" :pagination="false" size="small" bordered>
      <template #columns>
        <a-table-column title="价格项" :width="300">
          <template #cell="{ record }">
            <a-select v-model="record.priceItemId" :options="priceItemOptions" allow-search @change="selectPriceItem(record)" />
          </template>
        </a-table-column>
        <a-table-column title="数量" :width="130">
          <template #cell="{ record }"><a-input-number v-model="record.quantity" :min="0.0001" :precision="4" /></template>
        </a-table-column>
        <a-table-column title="成交单价" :width="150">
          <template #cell="{ record }"><a-input-number v-model="record.unitPrice" :min="0" :precision="2" /></template>
        </a-table-column>
        <a-table-column title="折扣率" :width="130">
          <template #cell="{ record }"><a-input-number v-model="record.discountRate" :min="0" :max="1" :precision="4" /></template>
        </a-table-column>
        <a-table-column title="操作" :width="70" align="center">
          <template #cell="{ rowIndex }">
            <a-button type="text" status="danger" :disabled="lines.length === 1" @click="lines.splice(rowIndex, 1)"><template #icon><icon-delete /></template></a-button>
          </template>
        </a-table-column>
      </template>
    </a-table>
    <a-button type="text" class="add-line" @click="addLine"><template #icon><icon-plus /></template>添加明细</a-button>
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance, SelectOptionData } from '@arco-design/web-vue'
import type { OpportunityItem } from '@/apis/business/opportunity'
import type { CreateQuotationLine } from '@/apis/business/quotation'
import type { PriceItem, PriceListItem, ProductItem } from '@/apis/config/catalog'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createQuotation } from '@/apis/business/quotation'
import { getPriceItems, getPriceList, getProductList } from '@/apis/config/catalog'
import GiForm from '@/components/GiForm/GiForm.vue'

interface EditLine extends CreateQuotationLine { key: string }
const props = defineProps<{ opportunities: OpportunityItem[] }>()
const emit = defineEmits<{ success: [] }>()
const visible = ref(false)
const priceLists = ref<PriceListItem[]>([])
const priceItems = ref<PriceItem[]>([])
const products = ref<ProductItem[]>([])
let lineKey = 0
const emptyLine = (): EditLine => ({ key: String(++lineKey), productId: '', priceItemId: '', quantity: 1, unitPrice: 0, discountRate: 0 })
const getInitForm = () => ({ opportunityId: '', priceListId: '', validUntil: '' })
const form = reactive(getInitForm())
const lines = ref<EditLine[]>([emptyLine()])
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'opportunityId', label: '商机', type: 'select', required: true, props: { options: props.opportunities.filter((item) => item.status === 'OPEN').map((item) => ({ label: `${item.opportunityNo} - ${item.name}`, value: item.id })), allowSearch: true } },
  { field: 'priceListId', label: '价目表', type: 'select', required: true, props: { options: priceLists.value.filter((item) => item.status === 'ACTIVE').map((item) => ({ label: `${item.code} - ${item.name}`, value: item.id })) } },
  { field: 'validUntil', label: '报价有效期', type: 'date-picker', props: { valueFormat: 'YYYY-MM-DD' } }
])
const productNames = computed(() => new Map(products.value.map((item) => [item.id, `${item.sku} - ${item.name}`])))
const priceItemOptions = computed<SelectOptionData[]>(() => priceItems.value.map((item) => ({ label: `${productNames.value.get(item.productId) || item.productId} / ${item.listPrice}`, value: item.id })))
watch(() => form.priceListId, async (id) => {
  priceItems.value = id ? (await getPriceItems(id)).data : []
  lines.value = [emptyLine()]
})
const addLine = () => lines.value.push(emptyLine())
const selectPriceItem = (line: EditLine) => {
  const item = priceItems.value.find((value) => value.id === line.priceItemId)
  if (!item) return
  line.productId = item.productId
  line.unitPrice = Number(item.listPrice)
}
const reset = () => {
  Object.assign(form, getInitForm())
  priceItems.value = []
  lines.value = [emptyLine()]
}
const open = async () => {
  reset()
  const [listRes, productRes] = await Promise.all([getPriceList({ page: 1, size: 200 }), getProductList({ page: 1, size: 200 })])
  priceLists.value = listRes.data.records
  products.value = productRes.data.records
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  if (lines.value.some((item) => !item.priceItemId || !item.productId || item.quantity <= 0)) {
    Message.warning('请完整填写报价明细')
    return false
  }
  await createQuotation({
    ...form,
    validUntil: form.validUntil || undefined,
    lines: lines.value.map(({ key: _key, ...item }) => item)
  })
  Message.success('报价创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>

<style scoped>
.add-line {
  margin-top: 8px;
}
</style>
