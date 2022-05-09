<template>
  <div>
    <AdminTable
      item-id="scheduleId"
      heading="Управление уроками"
      sort="scheduleId"
      :columns="columns"
      item="schedules"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          label: '#',
          field: 'scheduleId',
          type: 'number',
        },
        {
          label: 'Неделя',
          field: 'weekDate',
          type: 'number',
        },
        {
          label: 'Действия',
          field: 'actionButtons',
        },
      ]
    }
  }
}
</script>
