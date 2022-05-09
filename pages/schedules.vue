<template>
  <div class="schedule-container">
    <div class="schedules--controls">
      <nuxt-link class="button" :to="{ query: { date: previousWeek } }">
        <v-icon name="md-arrowback-twotone" scale="1" />
      </nuxt-link>
      <p>
        Текущая
        <b>{{ isEven ? "четная" : "нечетная" }}</b>
        неделя с {{ $moment(weekDate).startOf('isoWeek').format('DD MMMM') }} по {{ $moment(weekDate).endOf('isoWeek').format('DD MMMM') }}
      </p>
      <nuxt-link class="button" :to="{ query: { date: nextWeek } }">
        <v-icon name="md-arrowforward-twotone" scale="1" />
      </nuxt-link>
    </div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p
          v-if="$fetchState.error.message != 'Request failed with status code 404'"
        >{{ $fetchState.error }}</p>
        <p v-else>Расписание на данную неделю не опубликовано.</p>
      </div>
      <div v-else-if="weekDate && !$fetchState.pending" class="schedules">
        <uiCollapsedSchedule
          v-for="(week, index) in weekDates"
          :key="week.day"
          :day="schedule.days[index + 1]"
          :index="index"
          :date="week"
        />
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
      weekDate: null,
      schedule: null
    }
  },
  async fetch() {
    if (this.$route.query.date && this.$moment(this.$route.query.date, "DD-MM-YYYY", true).isValid()) {
      this.$data.weekDate = this.$moment(this.$route.query.date, "DD-MM-YYYY", true).startOf('isoWeek');
    } else {
      this.$data.weekDate = this.$moment().startOf('isoWeek');
    }

    const schedule = (await this.$axios.$get(
      `${process.env.baseUrl}/v1/diary/schedules/date/${this.$data.weekDate.clone().startOf('isoWeek').format("DD-MM-YYYY")}`,
    ));

    if (schedule) this.$data.schedule = schedule;
  },
  head: {
    title: 'Расписание предметов'
  },
  computed: {
    weekDates() {
      const start = this.$moment(this.weekDate).startOf('isoWeek')
      const end = this.$moment(this.weekDate).endOf('isoWeek')

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
      return Math.abs(this.$moment(this.weekDate).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1;
    },
    previousWeek() {
      return this.$moment(this.weekDate).subtract(1, 'weeks').startOf('isoWeek').isoWeekday(1).format('DD-MM-YYYY');
    },
    nextWeek() {
      return this.$moment(this.weekDate).add(1, 'weeks').startOf('isoWeek').isoWeekday(1).format('DD-MM-YYYY');
    }
  },
  watch: {
    $route(to, from) {
      this.$fetch();
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
.schedule-container {
  .schedules--controls {
    @apply flex mb-6 gap-2 items-center justify-center;
    p {
      @apply font-medium text-lg text-center w-5/6 md:text-base;
      b {
        @apply font-extrabold text-primary-400;
      }
    }
    a.button,
    button {
      @apply text-center py-2 px-6 w-1/6;
    }
  }

  .schedules {
    @apply flex flex-col;
    h1 {
      @apply mb-6;
    }
  }
}
</style>
