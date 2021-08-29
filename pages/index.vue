<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="today">
        <h1>Сегодняшний <span v-if="isEven">четный</span><span v-else>нечетный</span> день,
          {{$moment(Date.now()).format('dddd DD MMMM')}}</h1>
        <!-- Subjects -->
        <div v-if="!noSchedules" class="today--blocks">
          <div class="today--block">
            <transition name="fade" mode="out-in">
              <div v-if="currentSchedule" class="today--subject">
                <h2>Текущий урок <span v-if="isReplaced(currentSchedule)">(замена)</span></h2>
                <div class="today--info">
                  <nuxt-link
                    :to="`/subjects/${(isReplaced(currentSchedule)) ? currentSchedule.replacement.subject.subjectId : currentSchedule.subjectId}`"
                    class="today--schedule today--schedule__current">
                    <h2 v-if="isReplaced(currentSchedule)">{{currentSchedule.replacement.subject.name}}</h2>
                    <h2 v-else>{{currentSchedule.subject.name}}</h2>
                    <p>Кабинет <b>№{{getLocation(currentSchedule)}}</b></p>
                    <p>Преподаватель: <b>{{getTeacher(currentSchedule)}}</b></p>
                  </nuxt-link>
                  <p>До окончания пары осталось <b>{{ timeLeft }}</b></p>
                </div>
              </div>
              <div v-else-if="!currentSchedule && schedules.length > 0" class="today--subject">
                <h2>Следующий урок <span v-if="isReplaced(schedules[0])">(замена)</span></h2>
                <div class="today--info">
                  <nuxt-link
                    :to="`/subjects/${(isReplaced(schedules[0])) ? schedules[0].replacement.subject.subjectId : schedules[0].subjectId}`"
                    class="today--schedule">
                    <h2 v-if="isReplaced(schedules[0])">{{schedules[0].replacement.subject.name}}</h2>
                    <h2 v-else>{{schedules[0].subject.name}}</h2>
                    <p>Кабинет <b>№{{getLocation(schedules[0])}}</b></p>
                    <p>Преподаватель: <b>{{getTeacher(schedules[0])}}</b></p>
                  </nuxt-link>
                  <p>До начала пары осталось <b>{{ timeLeft }}</b></p>
                </div>
              </div>
              <div v-else class="today--subject today--block__empty">
                <h2 class="empty">Уроки на сегодня закончились</h2>
              </div>
            </transition>
          </div>
          <!-- Homeworks -->
          <div class="today--block">
            <transition name="fade" mode="out-in">
              <div v-if="currentSchedule && currentSchedule.homeworks && currentSchedule.homeworks.length > 0"
                class="today--subject">
                <h2>Домашнее задание</h2>
                <div class="today--info">
                  <nuxt-link v-for="homework in currentSchedule.homeworks" :key="homework.homeworkId"
                    :to="`/subjects/${homework.homeworkId}`" class="today--homework">
                    <h2>Задание до {{$moment(homework.date, 'DD/MM/YYYY').format('DD MMMM')}}</h2>
                    <p><b>Задано</b>: {{$moment(homework.created).format('DD MMMM')}}</p>
                    <p><b>Цель задания</b>:</p>
                    <p>{{homework.mission}}</p>
                  </nuxt-link>
                </div>
              </div>
              <div v-else-if="!currentSchedule && schedules.length > 0 && schedules[0].homeworks.length > 0"
                class="today--subject">
                <h2>Домашнее задание</h2>
                <div class="today--info">
                  <nuxt-link v-for="homework in schedules[0].homeworks" :key="homework.homeworkId"
                    :to="`/subjects/${homework.homeworkId}`" class="today--homework">
                    <h2>Задание до {{$moment(homework.date, 'DD/MM/YYYY').format('DD MMMM')}}</h2>
                    <p><b>Задано</b>: {{$moment(homework.created).format('DD MMMM')}}</p>
                    <p><b>Цель задания</b>:</p>
                    <p>{{homework.mission}}</p>
                  </nuxt-link>
                </div>
              </div>
              <div v-else-if="(currentSchedule && currentSchedule.homeworks === 0) || schedules.length > 0">
                <h2 class="empty">Домашнего задания к этому предмету нет</h2>
              </div>
              <div v-else class="today--subject">
                <h2 class="empty">Домашнее задание закончилось</h2>
              </div>
            </transition>
          </div>
        </div>
        <div v-else>
          <h1>Уроков сегодня нет :)</h1>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  // сделать подсветку урока который скоро начнется и текущего урока
  export default {
    data() {
      return {
        noSchedules: false,
        schedules: null,
        currentSchedule: null,
        scheduleTimeLeft: null,
        timer: null,
        timeoutTimer: null,
      }
    },
    async fetch() {
      this.$data.currentSchedule = null;
      this.$data.scheduleTimeLeft = null;
      this.$data.isStarting = false;
      this.$data.noSchedules = false;

      const currentDate = this.$moment(Date.now());

      const isEven = Math.abs(currentDate.week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1
      const schedules = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules?isEven=${isEven}&weekDay=${currentDate.isoWeekday()}&sortBy=bellId%3Aasc&limit=9999&page=1&extras=bell,subject,replacements,homeworks`,
      )).results

      const replacements = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/replacements?limit=9999&sortBy=date%3Aasc&page=1&extras=subject`)).results;

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
            homeworkProvider = await this.$axios.$get(`http://localhost:3050/v1/diary/subjects/${schedule.replacement.replacingSubject}?extras=homeworks`);
          }

          const activeHomeworks = [];
          await homeworkProvider.homeworks.forEach((homework) => {
            if (currentDate.isBetween(this.$moment(homework.created).day(-1), this.$moment(homework.date,
                'DD/MM/YYYY'))) {
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
            'HH:mm'))) {
          this.$data.currentSchedule = schedule;

          const endTime = this.$moment(schedule.bell.ends, 'HH:mm').add('1', 'minute');
          const startTime = currentDate;
          this.$data.scheduleTimeLeft = this.calculateTimeLeft(endTime, startTime);

          return true;
        }

        if (currentDate.isAfter(this.$moment(schedule.bell.ends, 'HH:mm'))) {
          console.log(
            `(${schedule.subject.name}) current time ${currentDate.format('HH:mm')} is before ${this.$moment(schedule.bell.ends, 'HH:mm').format('HH:mm')}, removing`
            )
        }

        if (currentDate.isBefore(this.$moment(schedule.bell.starts, 'HH:mm'))) {
          return true;
        }

        return false;
      });

      if (!this.$data.scheduleTimeLeft && filtered.length > 0) {
        const endTime = this.$moment(filtered[0].bell.starts, 'HH:mm').add('1', 'minute');
        const startTime = currentDate;
        this.$data.scheduleTimeLeft = this.calculateTimeLeft(endTime, startTime);
      }

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
      if (this.$data.timeoutTimer) {
        clearTimeout(this.$data.timeoutTimer);
      }
      if (this.$data.timer) {
        clearInterval(this.$data.timer);
      }
    },
    mounted() {
      const self = this;
      const time = new Date();
      const secondsRemaining = ((60 - time.getSeconds()) * 1000) + 1;

      this.$data.timeoutTimer = setTimeout(() => {
        self.$fetch();
        this.$data.timer = setInterval(self.$fetch, 60000);
      }, secondsRemaining);
    },
    methods: {
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
    @apply flex flex-col gap-2;

    .today--blocks {
      @apply flex flex-col lg:flex-row gap-6 items-start;

      .today--block {
        @apply flex-1 w-full lg:w-1/2 bg-mariner-100 p-6 rounded-2xl font-medium;

        h2 {
          @apply text-water-600 font-semibold text-2xl mb-4;
          &.empty {
            @apply mb-0;
          }
        }

        .today--info {
          @apply flex flex-col gap-4 text-water-500;

          h2 {
            @apply text-xl;
          }

          b {
            @apply text-water-700;
          }

          .today--schedule {
            @apply -m-2 p-4 bg-water-200 rounded-2xl;

            &__current {
              @apply bg-mariner-500 text-white text-opacity-60;

              h2 {
                @apply text-white;
              }

              b {
                @apply text-white;
              }
            }
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
            @apply bg-water-dark-700;

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
            @apply bg-water-dark-700;
          }
        }
  }

</style>
