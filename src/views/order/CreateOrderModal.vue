<template>
  <a-modal v-model:visible="visible" title="新增销售订单" :width="540" :on-before-ok="submit" @close="form.contractId = ''">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { ContractItem } from '@/apis/business/contract'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createSalesOrder } from '@/apis/business/order'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ contracts: ContractItem[] }>()
const emit = defineEmits<{ success: [] }>()
const visible = ref(false)
const form = reactive({ contractId: '' })
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'contractId', label: '已签合同', type: 'select', required: true, props: { options: props.contracts.filter((item) => item.status === 'SIGNED').map((item) => ({ label: `${item.contractNo} - ${item.name}`, value: item.id })), allowSearch: true } }
])
const open = () => {
  form.contractId = ''
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createSalesOrder(form.contractId)
  Message.success('销售订单创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
