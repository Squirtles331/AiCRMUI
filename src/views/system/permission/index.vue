<template>
  <GiPageLayout margin>
    <a-row justify="end" class="g-row-tool">
      <a-space wrap>
        <a-input-search v-model="keyword" placeholder="权限编码、名称或资源" allow-clear style="width: 280px" />
        <GiButton type="reset" @click="keyword = ''" />
      </a-space>
    </a-row>
    <GiTable title="权限清单" row-key="code" :data="filteredList" :columns="tableColumns" :loading="loading"
      :pagination="false" :scroll="{ x: '100%', y: '100%', minWidth: 900 }" @refresh="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import { Tag } from '@arco-design/web-vue'
import { getPermissionList } from '@/apis/system/permission'
import { useTable } from '@/hooks'

defineOptions({ name: 'SystemPermission' })
const keyword = ref('')
const { loading, tableData: permissionList, refresh } = useTable({ listAPI: getPermissionList })
const filteredList = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  return value ? permissionList.value.filter((item) => [item.code, item.name, item.resourceType].some((field) => field?.toLowerCase().includes(value))) : permissionList.value
})
const tableColumns: TableColumnData[] = [
  { title: '权限名称', dataIndex: 'name', width: 180 },
  { title: '权限编码', dataIndex: 'code', width: 260 },
  { title: '资源类型', dataIndex: 'resourceType', width: 150 },
  { title: '动作', dataIndex: 'action', width: 130 },
  { title: '状态', width: 90, align: 'center', render: ({ record }) => <Tag color={record.status === 1 ? 'green' : 'red'}>{record.status === 1 ? '正常' : '停用'}</Tag> },
  { title: '说明', dataIndex: 'description', ellipsis: true, tooltip: true }
]
</script>
