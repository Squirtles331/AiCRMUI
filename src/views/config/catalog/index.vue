<template>
  <GiPageLayout :size="'350px'" collapsed>
    <template #left>
      <GiTable title="产品分类" row-key="id" :data="categories" :columns="categoryColumns" :loading="categoryLoading"
        :pagination="false" :scroll="{ y: '100%' }" @refresh="loadCategories">
        <template #custom-extra>
          <GiButton v-if="canWrite" type="add" size="small" @click="categoryModalRef?.open()" />
        </template>
      </GiTable>
    </template>
    <GiTable title="产品列表" row-key="id" :data="products" :columns="productColumns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 950 }" @refresh="refresh">
      <template #custom-extra>
        <GiButton v-if="canWrite" type="add" size="small" @click="productModalRef?.open()" />
      </template>
    </GiTable>
    <CreateCategoryModal ref="categoryModalRef" :categories="categories" @success="loadCategories" />
    <CreateProductModal ref="productModalRef" :categories="categories" @success="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import { Tag } from '@arco-design/web-vue'
import { getCategoryList, getProductList, type CategoryItem } from '@/apis/config/catalog'
import { useTable } from '@/hooks'
import { useUserStore } from '@/stores'
import CreateCategoryModal from './CreateCategoryModal.vue'
import CreateProductModal from './CreateProductModal.vue'

defineOptions({ name: 'ConfigCatalog' })
const userStore = useUserStore()
const canWrite = computed(() => userStore.permissions.includes('catalog:write'))
const categories = ref<CategoryItem[]>([])
const categoryLoading = ref(false)
const categoryModalRef = ref<InstanceType<typeof CreateCategoryModal>>()
const productModalRef = ref<InstanceType<typeof CreateProductModal>>()
const categoryNames = computed(() => new Map(categories.value.map((item) => [item.id, item.name])))
const loadCategories = async () => {
  try {
    categoryLoading.value = true
    categories.value = (await getCategoryList()).data
  } finally {
    categoryLoading.value = false
  }
}
const { loading, tableData: products, pagination, refresh } = useTable({ listAPI: getProductList })
const categoryColumns: TableColumnData[] = [
  { title: '分类名称', dataIndex: 'name', width: 150 },
  { title: '编码', dataIndex: 'code', width: 120 },
  { title: '排序', dataIndex: 'sortOrder', width: 70, align: 'center' }
]
const productColumns: TableColumnData[] = [
  { title: '产品编号', dataIndex: 'productNo', width: 170 },
  { title: 'SKU', dataIndex: 'sku', width: 140 },
  { title: '产品名称', dataIndex: 'name', width: 180 },
  { title: '分类', width: 140, render: ({ record }) => <span>{categoryNames.value.get(record.categoryId) || '-'}</span> },
  { title: '规格型号', dataIndex: 'specification', width: 160, ellipsis: true, tooltip: true },
  { title: '单位', dataIndex: 'unit', width: 90 },
  { title: '可销售', width: 90, align: 'center', render: ({ record }) => <Tag color={record.saleEnabled ? 'green' : 'gray'}>{record.saleEnabled ? '是' : '否'}</Tag> },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => <Tag color={record.status === 'ACTIVE' ? 'green' : 'gray'}>{record.status}</Tag> }
]

loadCategories()
</script>
