<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="replacements">
        <h1>Замены в расписании</h1>
        <div v-if="Object.keys(replacements).length === 0" class="replacement">
          <h2 class="replacement--date">Замены отсутствуют!</h2>
        </div>
        <div v-for="(value, index) in replacements" v-else :key="index" class="replacement">
          <h2 class="replacement--date">{{ $moment(index, 'YYYYMMDD').format('DD MMMM') }}</h2>
          <div v-for="replace in value" :key="replace.replacementId" class="replacement--item">
            <div class="replacement--info">
              <p class="replacement--title">{{replace.schedule.subject.name}} <ArrowNarrowRightIcon /> {{replace.subject.name}}</p>
              <p v-if="replace.teacher">Преподаватель <b>{{replace.teacher}}</b></p>
              <p v-else>Преподаватель <b>{{replace.schedule.subject.teacher}}</b></p>
              <p v-if="replace.location">Кабинет <b>№{{replace.location}}</b></p>
              <p v-else>Кабинет <b>№{{replace.schedule.subject.location}}</b></p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ArrowNarrowRightIcon } from "@vue-hero-icons/outline"
  export default {
    components: {
      ArrowNarrowRightIcon,
    },
    data() {
      return {
        replacements: {},
      }
    },
    async fetch() {
      const replacements = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/replacements?sortBy=replacementId%3Aasc&limit=9999&page=1&extras=subject,schedule`,
      )).results
      const schedules = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules?sortBy=replacementId%3Aasc&limit=9999&page=1&extras=subject`,
      )).results
      const bells = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/bells?sortBy=bellId%3Aasc&limit=9999&page=1`,
      )).results

      // sorting replacements by date
      replacements.sort((currentReplacement, nextReplacement) => {
        const currentDate = this.$moment(currentReplacement.date, 'DD/MM');
        const nextDate = this.$moment(nextReplacement.date, 'DD/MM');

        if (!currentDate.isAfter(nextDate)) return -1;
        else if (currentDate.isAfter(nextDate)) return 1;
        else return 0;
      });

      replacements.forEach((replacement) => {
        if(this.$moment(replacement.date, 'DD/MM/YYYY').isBefore(Date.now())) return;
        const date = this.$moment(replacement.date, 'DD/MM/YYYY').format("YYYYMMDD");

        if (!this.replacements[date]) {
          this.replacements[date] = [];
        }

        bells.forEach((bell) => {
          if (replacement.schedule.bellId === bell.bellId) replacement.bell = bell;
        });
        schedules.forEach((schedule) => {
          if (replacement.schedule.scheduleId === schedule.scheduleId) replacement.schedule = schedule;
        });
        this.replacements[date].push(replacement);

        this.replacements[date].sort((currentReplacement, nextReplacement) => {
          const currentTime = this.$moment(currentReplacement.bell.starts, 'HH:mm');
          const nextTime = this.$moment(nextReplacement.bell.starts, 'HH:mm');

          if (!currentTime.isAfter(nextTime)) return -1;
          else if (currentTime.isAfter(nextTime)) return 1;
          else return 0;
        })
      });
    },
  }

</script>

<style lang="scss" scoped>
  .replacements {
    @apply flex flex-col gap-4;

    .replacement {
      @apply flex flex-col gap-2 p-4 bg-mariner-500 bg-opacity-10 rounded-2xl;

      .replacement--date {
        @apply px-2 py-2 font-semibold text-xl text-water-600;
      }

      .replacement--item {
        @apply bg-mariner-light-100 p-4 flex flex-col items-start rounded-2xl;

        .replacement--info {
          @apply text-water-500 font-medium;

          b {
            @apply text-water-800 font-medium;
          }

          .replacement--title {
            @apply inline-flex gap-2 justify-center items-center text-water-600 text-xl font-semibold;
          }
        }
      }
    }
  }

</style>
