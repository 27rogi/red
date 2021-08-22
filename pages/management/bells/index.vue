<template>
  <div>
    <AdminTable item-id="bellId" heading="Управление звонками" sort="bellId" :columns="columns" item="bells" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          label: '#',
          field: 'bellId',
          type: 'number',
        },
        {
          label: 'Начало звонка',
          field: 'starts',
        },
        {
          label: 'Конец звонка',
          field: 'ends',
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
