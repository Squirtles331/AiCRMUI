<template>
  <a-modal v-model:visible="visible" title="新增产品分类" :width="520" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createCategory, type CategoryItem } from '@/apis/config/catalog'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ categories: CategoryItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ parentId: undefined as string | undefined, code: '', name: '', sortOrder: 0 })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'parentId', label: '上级分类', type: 'select', props: { options: props.categories.map((item) => ({ label: item.name, value: item.id })) } },
  { field: 'code', label: '分类编码', type: 'input', required: true },
  { field: 'name', label: '分类名称', type: 'input', required: true },
  { field: 'sortOrder', label: '排序', type: 'input-number', required: true, props: { min: 0, precision: 0 } }
])
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createCategory({ ...form, code: form.code.trim(), name: form.name.trim() })
  Message.success('产品分类创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
