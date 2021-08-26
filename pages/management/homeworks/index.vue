<template>
  <div>
    <AdminTable item-id="homeworkId" heading="Управление домашними заданиями" sort="homeworkId" :columns="columns" item="homeworks" extras="subject" />
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
          field: 'homeworkId',
          type: 'number',
          width: '5%',
        },
        {
          label: 'Предмет #',
          field: 'subjectId',
          width: '10%',
        },
        {
          label: 'Предмет задания',
          field: 'subject.name',
          width: '20%',
        },
        {
          label: 'Дата сдачи',
          field: 'date',
          formatFn (value) {
            return self.$moment(value, 'DD/MM/YYYY').format('DD MMMM YYYY')
          },
          width: '30%',
        },
        {
          label: 'Дата создания',
          field: 'created',
          formatFn (value) {
            return self.$moment(value).format('DD MMMM YYYY')
          },
          width: '30%',
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
