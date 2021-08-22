<template>
  <div class="container">
    <p v-if="$fetchState.pending"><uiLoader /></p>
    <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
    <div v-else-if="date && !$fetchState.pending" class="schedules">
      <h1 v-if="isEven" class="page-title">Расписание на четную учебную неделю</h1>
      <h1 v-else class="page-title">Расписание на нечетную учебную неделю</h1>
      <div class="schedules--controls">
        <button @click="previousWeek">Прошлая неделя</button>
        <p>Текущая неделя с {{$moment(date).startOf('isoWeek')}}</p>
        <button @click="nextWeek">Следующая неделя</button>
      </div>
      <uiCollapsedSchedule v-for="(week, index) in weekDates" :key="week.day" :schedules="schedules[index + 1]"
        :index="index" :date="week" :active-date="date" />
    </div>
  </div>
</template>

<script>
  // добавить подсветку текущего/следующего урока
  import Vue from 'vue'

  export default Vue.extend({
    data() {
      return {
        date: null,
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
      if (this.$route.query.date && this.$moment(this.$route.query.date, "DD-MM-YYYY", true).isValid()) {
        this.$data.date = this.$moment(this.$route.query.date, "DD-MM-YYYY", true);
      }

      const isEven = Math.abs(this.$moment(this.date).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1
      const schedules = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules?isEven=${isEven}&sortBy=bellId%3Aasc&limit=9999&page=1&extras=bell%2Csubject%2Creplacement`,
      )).results

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
        const start = this.$moment(this.date).startOf('isoWeek')
        const end = this.$moment(this.date).endOf('isoWeek')

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
        return Math.abs(this.$moment(this.date).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1;
      },
    },
    created() {
      this.$data.date = this.$moment(Date.now());
    },
    activated() {
      if (this.$fetchState.timestamp <= Date.now() - 30000) {
        this.$fetch()
      }
    },
    methods: {
      previousWeek() {
        const previous = this.$moment(this.date).isoWeek(-1).startOf('isoWeek').format('DD');
        console.log("week current " + this.$moment(this.date).format('DD') + " week previ " + previous);
        // this.$router.push({query: {date: previous}})
      },
      nextWeek() {
        this.$router.push({query: {date: this.$moment(this.date).isoWeek(-1).startOf('isoWeek')}})
      }
    },
  })

</script>

<style lang="scss" scoped>
  .schedules {
    @apply flex flex-col;
    h1 {
      @apply mb-6;
    }
  }

</style>
