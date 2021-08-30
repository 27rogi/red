<template>
  <div class="schedule-container">
    <transition name="fade" mode="out-in">
    <uiLoader v-if="$fetchState.pending" />
    <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
    <div v-else-if="date && !$fetchState.pending" class="schedules">
      <h1 v-if="isEven" class="page-title">Расписание на четную учебную неделю</h1>
      <h1 v-else class="page-title">Расписание на нечетную учебную неделю</h1>
      <div class="schedules--controls">
        <nuxt-link class="button" :to="{query: {date: previousWeek}}">Прошлая неделя</nuxt-link>
        <p>Текущая неделя с {{$moment(date).startOf('isoWeek').format('DD MMMM')}} по {{$moment(date).endOf('isoWeek').format('DD MMMM')}}</p>
        <nuxt-link class="button" :to="{query: {date: nextWeek}}">Следующая неделя</nuxt-link>
      </div>
      <uiCollapsedSchedule v-for="(week, index) in weekDates" :key="week.day" :schedules="schedules[index + 1]"
        :index="index" :date="week" :active-date="date" />
    </div>
    </transition>
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

      for (let num = 0; num < 7; num++) {
        this.schedules[num+1].splice(0, this.schedules[num+1].length);
      }

      const isEven = Math.abs(this.$moment(this.date).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1
      const schedules = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/schedules?isEven=${isEven}&sortBy=bellId%3Aasc&limit=9999&page=1&extras=bell,subject,replacements,homeworks`,
      )).results

      schedules.forEach((elem) => {
        this.schedules[elem.weekDay].push(elem)
      })
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
      previousWeek() {
        return this.$moment(this.date).subtract(1, 'weeks').startOf('isoWeek').isoWeekday(1).format('DD-MM-YYYY');
      },
      nextWeek() {
        return this.$moment(this.date).add(1, 'weeks').startOf('isoWeek').isoWeekday(1).format('DD-MM-YYYY');
      }
    },
    watch: {
      $route(to, from) {
        this.$fetch();
      }
    },
    created() {
      this.$data.date = this.$moment(Date.now());
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
    @apply flex flex-col;
    h1 {
      @apply mb-6;
    }
    .schedules--controls {
      @apply flex flex-col md:flex-row gap-2 md:gap-4 mb-6 items-center justify-center;
      p {
        @apply text-lg md:text-base font-medium text-center flex-shrink-0 flex-grow-0 md:w-2/4;
      }
      a.button,
        button {
          @apply w-full md:w-1/4 text-center px-6 py-2;
        }
    }
  }

</style>
