<template>
  <a-modal v-model:visible="visible" title="添加价格项" :width="560" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { ProductItem } from '@/apis/config/catalog'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { addPriceItem } from '@/apis/config/catalog'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ products: ProductItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ productId: '', listPrice: undefined as number | undefined, minimumPrice: undefined as number | undefined, taxRate: 0 })
const visible = ref(false)
const priceListId = ref('')
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'productId', label: '产品', type: 'select', required: true, props: { options: props.products.map((item) => ({ label: `${item.sku} - ${item.name}`, value: item.id })), allowSearch: true } },
  { field: 'listPrice', label: '标准价', type: 'input-number', required: true, props: { min: 0, precision: 2 } },
  { field: 'minimumPrice', label: '最低价', type: 'input-number', props: { min: 0, precision: 2 } },
  { field: 'taxRate', label: '税率（0-1）', type: 'input-number', required: true, props: { min: 0, max: 1, precision: 4, step: 0.01 } }
])
const reset = () => Object.assign(form, getInitForm())
const open = (id: string) => {
  reset()
  priceListId.value = id
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || form.listPrice === undefined) return false
  await addPriceItem(priceListId.value, {
    productId: form.productId,
    listPrice: form.listPrice,
    minimumPrice: form.minimumPrice,
    taxRate: form.taxRate
  })
  Message.success('价格项添加成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
