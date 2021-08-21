<template>
  <div class="container">
    <h1 v-if="isEven" class="page-title">Расписание на четную учебную неделю</h1>
    <h1 v-else class="page-title">Расписание на нечетную учебную неделю</h1>
    <p v-if="$fetchState.pending">Fetching mountains...</p>
    <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
    <div v-else class="schedules">
      <uiCollapsedSchedule v-for="(date, index) in weekDates" :key="date.day" :schedules="schedules[index + 1]" :index="index" :date="date" :class="{'active': $moment().day() == index+1}" />
    </div>
  </div>
</template>

<script>
// добавить подсветку текущего/следующего урока
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      schedules: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
      },
    }
  },
  async fetch() {
    const isEven = Math.abs(this.$moment(Date.now()).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1
    const schedules = (await this.$axios.$get(
      `http://localhost:3050/v1/diary/schedules?isEven=${isEven}&sortBy=bellId%3Aasc&limit=9999&page=1&extras=bell%2Csubject%2Creplacement`,
    )).results

    console.log(schedules);

    schedules.forEach((elem) => {
      this.schedules[elem.weekDay].push(elem)
    })

    for (let i = 1; i <= 7; i++) {
      this.schedules[i].sort((elemFirst, elemNext) => {
        return elemFirst.bellId - elemNext.bellId
      })
    }
  },
  computed: {
    weekDates() {
      const start = this.$moment().startOf('isoWeek')
      const end = this.$moment().endOf('isoWeek')

      const iterationDay = start.clone()
      const dates = []

      while (!iterationDay.isAfter(end)) {
        dates.push({
          day: iterationDay.format('DD'),
          month: iterationDay.format('MM'),
        })
        iterationDay.add(1, 'day')
      }

      return dates
    },
    isEven() {
      return Math.abs(this.$moment(Date.now()).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1;
    }
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 30000) {
      this.$fetch()
    }
  },
})
</script>

<style lang="scss" scoped>
.schedules {
  @apply flex flex-col mt-6;
}
</style>
