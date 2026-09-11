<template><CrmListPage title="产品目录" description="查看可用于报价的产品、SKU 与目录信息" endpoint="/catalog/products" :columns="columns" /></template>
<script setup lang="ts">
import type { CrmColumn } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '产品编号', dataIndex: 'productNo' }, { title: 'SKU', dataIndex: 'sku' }, { title: '产品名称', dataIndex: 'name' }, { title: '单位', dataIndex: 'unit' }, { title: '状态', dataIndex: 'status' }, { title: '操作', dataIndex: 'operations' }]
</script>
