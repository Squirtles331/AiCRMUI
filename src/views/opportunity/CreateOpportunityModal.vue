<template>
  <a-modal v-model:visible="visible" title="新增商机" :width="620" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { CustomerItem } from '@/apis/business/customer'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createOpportunity } from '@/apis/business/opportunity'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ customers: CustomerItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ customerId: '', name: '', expectedAmount: undefined as number | undefined, currency: 'CNY', probability: 10, expectedCloseDate: '' })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'customerId', label: '客户', type: 'select', required: true, props: { options: props.customers.map((item) => ({ label: `${item.customerNo} - ${item.name}`, value: item.id })), allowSearch: true } },
  { field: 'name', label: '商机名称', type: 'input', required: true },
  { field: 'expectedAmount', label: '预计金额', type: 'input-number', required: true, props: { min: 0, precision: 2 } },
  { field: 'currency', label: '币种', type: 'select', required: true, props: { options: [{ label: '人民币 CNY', value: 'CNY' }, { label: '美元 USD', value: 'USD' }, { label: '欧元 EUR', value: 'EUR' }] } },
  { field: 'probability', label: '成交概率', type: 'slider', props: { min: 0, max: 100 } },
  { field: 'expectedCloseDate', label: '预计成交日', type: 'date-picker', props: { valueFormat: 'YYYY-MM-DD' } }
])
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || form.expectedAmount === undefined) return false
  await createOpportunity({ ...form, name: form.name.trim(), expectedAmount: form.expectedAmount, expectedCloseDate: form.expectedCloseDate || undefined })
  Message.success('商机创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
