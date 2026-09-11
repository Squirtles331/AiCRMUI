<template>
  <a-modal v-model:visible="visible" :title="mode === 'cancel' ? '申请取消订单' : '关闭销售订单'" :width="520" :on-before-ok="submit" @close="form.reason = ''">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { SalesOrderItem } from '@/apis/business/order'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { closeSalesOrder, requestOrderCancel } from '@/apis/business/order'
import GiForm from '@/components/GiForm/GiForm.vue'

type Mode = 'cancel' | 'close'
const emit = defineEmits<{ success: [] }>()
const visible = ref(false)
const mode = ref<Mode>('cancel')
const record = ref<SalesOrderItem>()
const form = reactive({ reason: '' })
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [{ field: 'reason', label: mode.value === 'cancel' ? '取消原因' : '关闭原因', type: 'textarea', required: true }])
const open = (nextMode: Mode, item: SalesOrderItem) => {
  mode.value = nextMode
  record.value = item
  form.reason = ''
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || !record.value) return false
  if (mode.value === 'cancel') await requestOrderCancel(record.value, form.reason.trim())
  else await closeSalesOrder(record.value, form.reason.trim())
  Message.success(mode.value === 'cancel' ? '取消申请已提交' : '销售订单已关闭')
  emit('success')
  return true
}

defineExpose({ open })
</script>
