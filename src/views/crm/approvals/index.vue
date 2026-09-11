<template>
  <main class="g-page approvals"><header><div><h1>审批任务</h1><p>处理当前用户待审批的销售业务任务</p></div><a-button @click="load">刷新</a-button></header><a-card><a-table :data="tasks" :loading="loading" :pagination="false" row-key="id"><a-table-column title="任务 ID" data-index="id" /><a-table-column title="节点" data-index="nodeName" /><a-table-column title="审批方式" data-index="decisionMode" /><a-table-column title="状态" data-index="status" /><a-table-column title="操作"><template #cell="{ record }"><a-space><a-button type="text" status="success" @click="decide(record, 'approve')">批准</a-button><a-button type="text" status="danger" @click="decide(record, 'reject')">驳回</a-button></a-space></template></a-table-column></a-table></a-card></main>
</template>
<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import http from '@/utils/http'
defineOptions({ name: 'CrmApprovals' })
const tasks = ref<Record<string, any>[]>([]); const loading = ref(false)
async function load() { loading.value = true; try { const res = await http.get<Record<string, any>[]>('/approval-tasks/pending'); tasks.value = res.data } finally { loading.value = false } }
async function decide(task: Record<string, any>, action: 'approve' | 'reject') { await http.post(`/approval-tasks/${task.id}/actions/${action}`, { version: task.version }); Message.success(action === 'approve' ? '已批准' : '已驳回'); await load() }
onMounted(load)
</script>
<style lang="scss" scoped>.approvals { display:grid; gap:16px; }.approvals header { display:flex; justify-content:space-between; align-items:end; gap:16px; }.approvals h1 { margin:0; font-size:24px; }.approvals p { margin:6px 0 0; color:var(--color-text-3); }</style>
