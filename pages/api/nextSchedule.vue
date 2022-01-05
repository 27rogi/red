<template>
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="today">
        <!-- Subjects -->
        <div v-if="!noSchedules" class="today--blocks">
          <div class="today--block">
              <div v-if="schedules.length > 0" class="today--subject">
                <h2>Через 5 минут начнется урок</h2>
                <div class="today--info">
                  <div
                    class="today--schedule">
                    <h2 v-if="isReplaced(schedules[0])">{{schedules[0].replacement.subject.name}} (замена)</h2>
                    <h2 v-else>{{schedules[0].subject.name}}</h2>
                    <p>🗺️ Кабинет <b>№{{getLocation(schedules[0])}}</b></p>
                    <p>🧑‍🏫 Преподаватель: <b>{{getTeacher(schedules[0])}}</b></p>
                    <p>⏰ Начало урока в <b>{{schedules[0].bell.starts}}</b></p>
                    <p v-if="schedules[0].homeworks.length > 0">🙀 По этому уроку есть {{schedules[0].homeworks.length}} домашних заданий!</p>
                  </div>
                </div>
              </div>
              <div v-else class="today--subject today--block__empty">
                <h2 class="empty">🙀 Уроки на сегодня закончились 🥵</h2>
              </div>
          </div>
        </div>
        <div v-else>
          <h1>Уроков сегодня нет :)</h1>
        </div>
      </div>
</template>

<script>
  export default {
    layout: 'api',
    data() {
      return {
        noSchedules: false,
        schedules: null,
        timer: null,
        timeoutTimer: null,
      }
    },
    async fetch() {
      const currentDate = this.$moment(Date.now());

      const isEven = Math.abs(currentDate.week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1
      const schedules = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/schedules?isEven=${isEven}&weekDay=${currentDate.isoWeekday()}&sortBy=bellId%3Aasc&limit=9999&page=1&extras=bell,subject,replacements,homeworks`,
      )).results

      const replacements = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/replacements?limit=9999&sortBy=date%3Aasc&page=1&extras=subject`)).results;

      if (schedules.length <= 0) {
        this.$data.noSchedules = true;
        return;
      }

      schedules.forEach(async (schedule, index) => {
        if (schedule.replacements) {
          schedule.replacements.forEach((replacement) => {
            if (this.$moment(replacement.date, 'DD/MM/YYYY').format('DD MM') !== currentDate.format(
              'DD MM')) return;
            replacements.forEach((item) => {
              if (item.replacementId === replacement.replacementId) this.$set(schedule, 'replacement',
                item)
            });
          });
        }

        if (schedule.homeworks) {
          let homeworkProvider = schedule;
          if(schedule.replacement) {
            homeworkProvider = await this.$axios.$get(`https://api.ryzhenkov.space/v1/diary/subjects/${schedule.replacement.replacingSubject}?extras=homeworks`);
          }

          homeworkProvider.homeworks.sort((currentHomework, nextHomework) => {
              if (this.$moment(currentHomework.date, 'DD/MM/YYYY').isBefore(this.$moment(nextHomework.date, 'DD/MM/YYYY')))
                  return -1
              else
                  return 1;
          });

          const activeHomeworks = [];
          await homeworkProvider.homeworks.forEach((homework) => {
            if (currentDate.isBetween(this.$moment(homework.created).day(-1), this.$moment(homework.date,
                'DD/MM/YYYY'), undefined, '[]')) {
              activeHomeworks.push(homework);
            }
          });
          schedule.homeworks = activeHomeworks;
        }
      });

      schedules.sort((currentSchedule, nextSchedule) => {
        const currentBellTime = currentSchedule.bell.starts.split(':');
        const nextBellTime = nextSchedule.bell.starts.split(':');

        if (currentBellTime[0] < nextBellTime[0]) return -1;
        if (currentBellTime[0] > nextBellTime[0]) return 1;

        if (currentBellTime[1] < nextBellTime[1]) return -1;
        if (currentBellTime[1] > nextBellTime[1]) return 1;

        return 0;
      });

      const filtered = schedules.filter((schedule, index) => {
        if (currentDate.isBetween(this.$moment(schedule.bell.starts, 'HH:mm'), this.$moment(schedule.bell.ends,
            'HH:mm'), undefined, '[]')) {
          return true;
        }

        if (currentDate.isBefore(this.$moment(schedule.bell.starts, 'HH:mm'))) {
          return true;
        }

        return false;
      });

      this.$data.schedules = filtered;
    },
    computed: {
      isEven() {
        return Math.abs(this.$moment(Date.now()).week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1;
      },
      timeLeft() {
        if (this.$moment(this.$data.scheduleTimeLeft).isValid()) return this.$moment(this.$data.scheduleTimeLeft)
          .format('H [ч.] m [мин.]')
        else return null
      },
    },
    beforeDestroy() {
      this.removeTimers()
    },
    mounted() {
      this.setTimers();
    },
    methods: {
      visibilityChanged (evt, hidden) {
        if(hidden === false) {
          console.log('Visibility changed back to page, reloading timers...');
          this.removeTimers();
          this.$fetch();
          this.setTimers();
        }
      },
      setTimers() {
        const self = this;
        const time = new Date();
        const secondsRemaining = ((60 - time.getSeconds()) * 1000) + 1;

        console.log('Setting up timers for automated updates...')
        this.$data.timeoutTimer = setTimeout(() => {
          self.$fetch();
          this.$data.timer = setInterval(self.$fetch, 60000);
        }, secondsRemaining);
      },
      removeTimers() {
        console.log('Removing timers...')
        if (this.$data.timeoutTimer) {
          clearTimeout(this.$data.timeoutTimer);
        }
        if (this.$data.timer) {
          clearInterval(this.$data.timer);
        }
      },
      getTeacher(schedule) {
        if(this.isReplaced(schedule)) {
          return (schedule.replacement.teacher) ? schedule.replacement.teacher : schedule.replacement.subject.teacher
        }
        return schedule.subject.teacher
      },
      getLocation(schedule) {
        if(this.isReplaced(schedule)) {
          return (schedule.replacement.location) ? schedule.replacement.location : schedule.replacement.subject.location
        }
        return schedule.subject.location
      },
      calculateTimeLeft(endTime, startTime) {
        const hoursLeft = endTime.diff(startTime, 'hours');
        const minutesLeft = this.$moment.utc(this.$moment(endTime, "HH:mm").diff(this.$moment(startTime, "HH:mm")))
          .format("mm")
        return this.$moment(`${hoursLeft}:${minutesLeft}`, 'HH:mm');
      },
      isReplaced(schedule) {
        if (!schedule) return false;
        if (!schedule.replacement) return false;

        return true;
      },
      isSameSubject(schedule) {
        if (!schedule) return false;
        if (!schedule.replacement) return false;
        return schedule.replacement.subject.subjectId === schedule.subject.subjectId;
      },
    },
  }

</script>

<style lang="scss">
  .today {
    width: 600px;
    @apply flex flex-col gap-2;

    .today--blocks {
      @apply flex flex-col lg:flex-row gap-6 items-start;

      .today--block {
        @apply flex-1 w-full lg:w-1/2 bg-mariner-dark-900 p-4 rounded-2xl font-medium;

        h2 {
          @apply text-water-100 font-semibold text-lg mb-4;
          &.empty {
            @apply mb-0;
          }
        }

        .today--info {
          @apply flex flex-col gap-4 text-water-100;

          h2 {
            @apply text-xl;
          }

          b {
            @apply text-mariner-light-400;
          }

          .today--schedule {
            @apply -m-2 p-4 bg-water-dark-700 rounded-2xl;
          }

          .today--homework {
            @apply -m-2 p-4 bg-water-200 rounded-2xl mb-2;
          }
        }
      }
    }
  }

  .dark .today .today--blocks .today--block {
        @apply bg-water-dark-800;

        h2 {
          @apply text-mariner-dark-200;
        }

        .today--info {
          @apply text-mariner-300 text-opacity-60;

          b {
            @apply text-mariner-500;
          }

          .today--schedule {
            @apply bg-water-dark-500 bg-opacity-30;

            &__current {
              @apply bg-mariner-dark-200 text-white text-opacity-60;

              h2 {
                @apply text-white;
              }

              b {
                @apply text-white;
              }
            }
          }

          .today--homework {
            @apply bg-water-dark-500 bg-opacity-30;
          }
        }
  }

</style>
