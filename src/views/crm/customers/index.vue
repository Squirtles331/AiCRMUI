<template><CrmListPage title="客户" description="沉淀客户资料与客户经营信息" endpoint="/customers/private" :columns="columns" :create-fields="fields" create-endpoint="/customers" /></template>
<script setup lang="ts">
import type { CrmColumn, CrmField } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '客户编号', dataIndex: 'customerNo' }, { title: '客户名称', dataIndex: 'name' }, { title: '行业', dataIndex: 'industry' }, { title: '区域', dataIndex: 'region' }, { title: '状态', dataIndex: 'status' }, { title: '下次跟进', dataIndex: 'nextFollowUpAt' }, { title: '操作', dataIndex: 'operations' }]
const fields: CrmField[] = [{ key: 'name', label: '客户名称', required: true }, { key: 'industry', label: '所属行业' }, { key: 'region', label: '所属区域' }]
</script>
