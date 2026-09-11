<template>
  <a-modal v-model:visible="visible" title="新增客户" :width="560" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { PublicPoolItem } from '@/apis/directory'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createCustomer } from '@/apis/business/customer'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ pools: PublicPoolItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ name: '', industry: '', region: '', publicPoolId: undefined as string | undefined })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'name', label: '客户名称', type: 'input', required: true },
  { field: 'industry', label: '所属行业', type: 'input' },
  { field: 'region', label: '所属区域', type: 'input' },
  { field: 'publicPoolId', label: '初始归属', type: 'select', props: { options: [{ label: '我的私海', value: undefined }, ...props.pools.map((item) => ({ label: item.name, value: item.id }))] } }
])
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createCustomer({ name: form.name.trim(), industry: form.industry.trim() || undefined, region: form.region.trim() || undefined, publicPoolId: form.publicPoolId })
  Message.success('客户创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
