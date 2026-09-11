<template>
  <GiPageLayout margin>
    <a-row justify="end" class="g-row-tool">
      <a-space wrap>
        <a-input-search v-model="keyword" placeholder="部门编码或名称" allow-clear style="width: 240px" />
        <GiButton type="reset" @click="keyword = ''" />
      </a-space>
    </a-row>
    <GiTable title="部门列表" row-key="id" :data="filteredList" :columns="tableColumns" :loading="loading"
      :pagination="false" :default-expand-all-rows="true" :scroll="{ x: '100%', y: '100%', minWidth: 850 }" @refresh="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { ListItem } from '@/apis/system/dept'
import { Tag } from '@arco-design/web-vue'
import { getDepartmentList } from '@/apis/system/dept'
import { useTable } from '@/hooks'

defineOptions({ name: 'SystemDept' })
const keyword = ref('')
const toTree = (items: ListItem[]) => {
  const nodes = new Map(items.map((item) => [item.id, { ...item, children: [] as ListItem[] }]))
  const roots: ListItem[] = []
  nodes.forEach((item) => {
    const parent = item.parentId ? nodes.get(item.parentId) : undefined
    parent ? parent.children?.push(item) : roots.push(item)
  })
  return roots
}
const { loading, tableData: departmentList, refresh } = useTable({ listAPI: getDepartmentList, formatResult: toTree })
const filterTree = (items: ListItem[], value: string): ListItem[] => items.flatMap((item) => {
  const children = filterTree(item.children || [], value)
  return item.name.toLowerCase().includes(value) || item.code.toLowerCase().includes(value) || children.length ? [{ ...item, children }] : []
})
const filteredList = computed(() => keyword.value.trim() ? filterTree(departmentList.value, keyword.value.trim().toLowerCase()) : departmentList.value)
const tableColumns: TableColumnData[] = [
  { title: '部门名称', dataIndex: 'name', width: 220 },
  { title: '部门编码', dataIndex: 'code', width: 180 },
  { title: '组织路径', dataIndex: 'path', ellipsis: true, tooltip: true },
  { title: '状态', width: 90, align: 'center', render: ({ record }) => <Tag color={record.status === 1 ? 'green' : 'red'}>{record.status === 1 ? '正常' : '停用'}</Tag> },
  { title: '创建时间', dataIndex: 'createdAt', width: 190 }
]
</script>
