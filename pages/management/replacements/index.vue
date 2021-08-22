<template>
  <div>
    <AdminTable item-id="replacementId" heading="Управление заменами" sort="replacementId" :columns="columns" item="replacements" extras="schedule,subject" />
  </div>
</template>

<script>
export default {
  data() {
    const self = this;
    return {
      columns: [
        {
          label: '#',
          field: 'replacementId',
          type: 'number',
          width: '5%',
        },
        {
          label: 'Заменяет урок #',
          field: 'schedule.scheduleId',
          width: '20%',
        },
        {
          label: 'Заменяющий предмет',
          field: 'subject.name',
          width: '20%',
        },
        {
          label: 'Дата замены',
          field: 'date',
          formatFn (value) {
            return self.$moment(value, 'DD/MM/YYYY').format('DD MMMM YYYY')
          },
          width: '30%',
        },
        {
          label: 'Заменяющий кабинет',
          field: 'location',
          width: '10%',
        },
        {
          label: 'Заменяющий преподаватель',
          field: 'teacher',
          width: '10%',
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
