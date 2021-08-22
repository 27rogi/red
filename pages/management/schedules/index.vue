<template>
  <div>
    <AdminTable item-id="scheduleId" heading="Управление уроками" sort="scheduleId" :columns="columns" item="schedules" extras="bell,subject,replacement" />
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
          width: '10%',
        },
        {
          label: 'Номер предмета',
          field: 'subject.subjectId',
          width: '10%',
        },
        {
          label: 'Предмет',
          field: 'subject.name',
          width: '30%',
        },
        {
          label: 'День недели',
          field: 'weekDay',
          type: 'number',
          width: '10%',
        },
        {
          label: 'Номер звонка',
          field: 'bellId',
          type: 'number',
          width: '10%',
        },
        {
          label: 'Четная?',
          field: 'isEven',
          formatFn (value) {
            if (value) return "Да"
            else return "Нет"
          },
          width: '5%',
        },
        {
          label: 'Время начала',
          field: 'bell.starts',
          width: '20%',
        },
        {
          label: 'Номер замены',
          field: 'replacement.replacementId',
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
