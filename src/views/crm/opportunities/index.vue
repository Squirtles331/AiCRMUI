<template><CrmListPage title="商机" description="跟踪销售机会、阶段与赢单结果" endpoint="/opportunities" :columns="columns" :create-fields="fields" create-endpoint="/opportunities" :actions="actions" /></template>
<script setup lang="ts">
import type { CrmAction, CrmColumn, CrmField } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '商机编号', dataIndex: 'opportunityNo' }, { title: '商机名称', dataIndex: 'name' }, { title: '阶段', dataIndex: 'stage' }, { title: '金额', dataIndex: 'expectedAmount' }, { title: '概率', dataIndex: 'probability' }, { title: '状态', dataIndex: 'status' }, { title: '预计成交日', dataIndex: 'expectedCloseDate' }, { title: '操作', dataIndex: 'operations' }]
const fields: CrmField[] = [{ key: 'customerId', label: '客户 ID', required: true }, { key: 'name', label: '商机名称', required: true }, { key: 'expectedAmount', label: '预计金额', required: true, type: 'number', precision: 2 }, { key: 'currency', label: '币种', required: true, options: [{ label: 'CNY', value: 'CNY' }] }, { key: 'probability', label: '赢单概率', required: true, type: 'number', precision: 0 }, { key: 'expectedCloseDate', label: '预计成交日', required: true, type: 'date' }]
const actions: CrmAction[] = [{ label: '赢单', path: row => `/opportunities/${row.id}/actions/win`, visible: row => row.status === 'OPEN' }, { label: '输单', path: row => `/opportunities/${row.id}/actions/lose`, needsReason: true, visible: row => row.status === 'OPEN' }, { label: '重启', path: row => `/opportunities/${row.id}/actions/restart`, visible: row => row.status === 'LOST' }]
</script>
