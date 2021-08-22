<template>
  <div>
    <AdminTable item-id="subjectId" heading="Управление предметами" sort="scheduleId" :columns="columns" item="subjects" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          label: '#',
          field: 'subjectId',
          type: 'number',
          width: '10%',
        },
        {
          label: 'Название предмета',
          field: 'name',
        },
        {
          label: 'Преподаватель',
          field: 'teacher',
        },
        {
          label: 'Номер кабинета',
          field: 'location',
          type: 'number',
          width: '10%',
        },
        {
          label: 'Действия',
          field: 'actionButtons',
          width: '10%',
        },
      ]
    }
  }
}
</script>
