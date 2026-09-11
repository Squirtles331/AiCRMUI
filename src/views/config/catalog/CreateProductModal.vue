<template>
  <a-modal v-model:visible="visible" title="新增产品" :width="560" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createProduct, type CategoryItem } from '@/apis/config/catalog'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ categories: CategoryItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ categoryId: undefined as string | undefined, sku: '', name: '', specification: '', unit: '' })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'categoryId', label: '产品分类', type: 'select', props: { options: props.categories.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.id })) } },
  { field: 'sku', label: 'SKU', type: 'input', required: true },
  { field: 'name', label: '产品名称', type: 'input', required: true },
  { field: 'specification', label: '规格型号', type: 'input' },
  { field: 'unit', label: '计量单位', type: 'input', required: true }
])
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createProduct({
    categoryId: form.categoryId,
    sku: form.sku.trim(),
    name: form.name.trim(),
    specification: form.specification.trim() || undefined,
    unit: form.unit.trim()
  })
  Message.success('产品创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
