<template>
  <div v-visibility-change="visibilityChanged">
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error && $fetchState.error.message !== 'Request failed with status code 404'">{{ $fetchState.error }}</p>
      <div v-else class="today">
        <!-- Subjects -->
        <div class="today--blocks">
          <div class="today--block">
            <div class="today--subject">
              <h2>Уроки на сегодня</h2>
              <div v-if="$data.schedule && $data.schedule.length > 0" class="subjects">
                <div
                  v-for="(subject, index) in $data.schedule"
                  :key="index"
                  class="subjects__subject"
                  :class="{ active: subject.subjectId === currentSubjectId }"
                >
                  <div class="subject__header">
                    <div class="subject__title">
                      <h3 v-if="subject.replacement">{{ subject.replacement.subject.name }} (замена)</h3>
                      <h3 v-else>{{ subject.subject.name }}</h3>
                    </div>
                    <div v-if="subject.subjectId === nextSubjectId" class="ml-auto badge">
                      <p>
                        <b>Следующий</b>
                      </p>
                    </div>
                  </div>
                  <div class="subject__body">
                    <div class="subject__body-item subject__time">
                      <v-icon name="md-accesstime-twotone" />
                      <p>
                        Начало в
                        <b>{{ subject.bell.starts }}</b>
                      </p>
                    </div>
                    <div class="subject__body-item subject__teacher">
                      <v-icon name="md-face-twotone" />
                      <p
                        v-if="subject.replacement"
                      >{{ subject.replacement.teacher ? subject.replacement.teacher : subject.replacement.subject.teacher }}</p>
                      <p v-else>{{ subject.subject.teacher }}</p>
                    </div>
                    <div class="subject__body-item subject__location">
                      <v-icon name="md-locationon-twotone" />
                      <p
                        v-if="subject.replacement"
                      >Кабинет №{{ subject.replacement.location ? subject.replacement.location : subject.replacement.subject.location }}</p>
                      <p v-else>Кабинет № {{ subject.subject.location }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="subjects">
                <div class="subjects__subject">
                  <div class="subject__header">
                    <div class="subject__title">
                      <h3>Уроков на сегодня нет</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="today--block today--block__blocks">
            <div class="today--block today--block__blue">
              <h2>День сегодня</h2>
              <div class="today--info">
                <p>
                  <b>
                    <span
                      style="text-transform: capitalize;"
                    >{{ $moment(Date.now()).format('dddd DD MMMM') }}</span>
                  </b>
                  <span>({{ isEven ? "четный" : "нечетный" }} день)</span>
                </p>
                <div class="info__nowtime">
                  <p>Текущее время:</p>
                  <h1>{{ $moment().format("H:mm") }}</h1>
                </div>
              </div>
            </div>
            <div class="today--block" v-if="timeLeft && !currentSubjectId">
              <div class="block__time">
                <v-icon name="md-accesstime-twotone" />
                <p>
                  Осталось
                  <b>{{ timeLeft }}</b> до начала следующего урока
                </p>
              </div>
            </div>
            <div class="today--block" v-if="timeLeft && currentSubjectId">
              <div class="block__time">
                <v-icon name="md-accesstime-twotone" />
                <p>
                  Осталось
                  <b>{{ timeLeft }}</b> до окончания урока
                </p>
              </div>
            </div>
          </div>
          <!-- Homeworks -->
          <!-- <div class="today--block">
            <transition name="fade" mode="out-in">
              <div
                v-if="currentSchedule && currentSchedule.homeworks && currentSchedule.homeworks.length > 0"
                class="today--subject"
              >
                <h2>Домашнее задание</h2>
                <div class="today--info">
                  <nuxt-link
                    v-for="homework in currentSchedule.homeworks"
                    :key="homework.homeworkId"
                    :to="`/subjects/${homework.homeworkId}`"
                    class="today--homework"
                  >
                    <h2>Задание до {{ $moment(homework.date, 'DD/MM/YYYY').format('DD MMMM') }}</h2>
                    <p>
                      <b>Задано</b>
                      : {{ $moment(homework.created).format('DD MMMM') }}
                    </p>
                    <p>
                      <b>Цель задания</b>:
                    </p>
                    <p>{{ homework.mission }}</p>
                  </nuxt-link>
                </div>
              </div>
              <div
                v-else-if="!currentSchedule && schedules.length > 0 && schedules[0].homeworks.length > 0"
                class="today--subject"
              >
                <h2>Домашнее задание</h2>
                <div class="today--info">
                  <nuxt-link
                    v-for="homework in schedules[0].homeworks"
                    :key="homework.homeworkId"
                    :to="`/subjects/${homework.homeworkId}`"
                    class="today--homework"
                  >
                    <h2>Задание до {{ $moment(homework.date, 'DD/MM/YYYY').format('DD MMMM') }}</h2>
                    <p>
                      <b>Задано</b>
                      : {{ $moment(homework.created).format('DD MMMM') }}
                    </p>
                    <p>
                      <b>Цель задания</b>:
                    </p>
                    <p>{{ homework.mission }}</p>
                  </nuxt-link>
                </div>
              </div>
              <div
                v-else-if="(currentSchedule && currentSchedule.homeworks === 0) || schedules.length > 0"
              >
                <h2 class="empty">Домашнего задания к этому предмету нет</h2>
              </div>
              <div v-else class="today--subject">
                <h2 class="empty">Домашнее задание закончилось</h2>
              </div>
            </transition>
          </div>-->
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
      schedules: null,
      currentSubjectId: null,
      nextSubjectId: null,
      scheduleTimeLeft: null,
      timer: null,
      timeoutTimer: null,
    }
  },
  async fetch() {
    this.$data.currentSubjectId = null;
    this.$data.scheduleTimeLeft = null;
    this.$data.isStarting = false;

    const currentDate = this.$moment(Date.now());

    const schedule = (await this.$axios.$get(
      `${process.env.baseUrl}/v1/diary/schedules/date/${this.$moment().startOf('isoWeek').format("DD-MM-YYYY")}`,
    )).days[this.$moment().isoWeekday()].subjects;

    if (schedule) this.$data.schedule = schedule;

    schedule.forEach((schedule, index) => {
      // if (schedule.homeworks) {
      //   let homeworkProvider = schedule;
      //   if (schedule.replacement) {
      //     homeworkProvider = await this.$axios.$get(`${process.env.baseUrl}/v1/diary/subjects/${schedule.replacement.replacingSubject}?extras=homeworks`);
      //   }

      //   homeworkProvider.homeworks.sort((currentHomework, nextHomework) => {
      //     if (this.$moment(currentHomework.date, 'DD/MM/YYYY').isBefore(this.$moment(nextHomework.date, 'DD/MM/YYYY')))
      //       return -1
      //     else
      //       return 1;
      //   });

      //   const activeHomeworks = [];
      //   await homeworkProvider.homeworks.forEach((homework) => {
      //     if (currentDate.isBetween(this.$moment(homework.created).day(-1), this.$moment(homework.date,
      //       'DD/MM/YYYY'), undefined, '[]')) {
      //       activeHomeworks.push(homework);
      //     }
      //   });
      //   schedule.homeworks = activeHomeworks;
      // }
    });

    schedule.sort((currentSchedule, nextSchedule) => {
      const currentBellTime = currentSchedule.bell.starts.split(':');
      const nextBellTime = nextSchedule.bell.starts.split(':');

      if (currentBellTime[0] < nextBellTime[0]) return -1;
      if (currentBellTime[0] > nextBellTime[0]) return 1;

      if (currentBellTime[1] < nextBellTime[1]) return -1;
      if (currentBellTime[1] > nextBellTime[1]) return 1;

      return 0;
    });

    const filtered = schedule.filter((schedule, index) => {
      if (currentDate.isBetween(this.$moment(schedule.bell.starts, 'HH:mm'), this.$moment(schedule.bell.ends,
        'HH:mm'), undefined, '[]')) {
        this.$data.currentSubjectId = schedule.subjectId;

        const endTime = this.$moment(schedule.bell.ends, 'HH:mm').add('1', 'minute');
        const startTime = currentDate;
        this.$data.scheduleTimeLeft = this.calculateTimeLeft(endTime, startTime);

        return true;
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
      this.$data.nextSubjectId = filtered[0].subjectId;
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
    this.removeTimers()
  },
  mounted() {
    this.setTimers();
  },
  methods: {
    visibilityChanged(evt, hidden) {
      if (hidden === false) {
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
      if (this.isReplaced(schedule)) {
        return (schedule.replacement.teacher) ? schedule.replacement.teacher : schedule.replacement.subject.teacher
      }
      return schedule.subject.teacher
    },
    getLocation(schedule) {
      if (this.isReplaced(schedule)) {
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
    @apply flex flex-col-reverse gap-6 items-start lg:flex-row;

    .today--block {
      @apply rounded-xl font-medium bg-background-400/50 flex-1 w-full p-4;

      h2 {
        @apply font-extrabold mb-4 text-[calc(1vw+0.8rem)] text-primary-400;
        &.empty {
          @apply mb-0;
        }
      }

      &__blocks {
        @apply bg-transparent flex flex-col p-0 gap-6;
      }

      &__blue {
        @apply bg-primary-400;
        h2 {
          @apply text-primary-50;
        }
      }

      .block__time {
        @apply flex flex-row gap-2 items-center;
        b {
          @apply text-primary-300;
        }
      }

      .today--info {
        .info__nowtime {
          h1 {
            @apply text-white leading-tight text-[calc(1vw+2rem)];
          }
        }
      }

      .subjects {
        @apply flex flex-col gap-2;
        .subjects__subject {
          @apply rounded-md flex flex-col bg-background-200/20 p-4 gap-4;
          &.active {
            @apply bg-background-50 text-white;
            .subject__body {
              @apply bg-background-500/20 text-white/90;
            }
          }
          .subject__header {
            @apply flex flex-row gap-2;
            .subject__title h3 {
              @apply font-extrabold text-gray-50;
            }
          }
          .subject__body {
            @apply rounded-md flex flex-col bg-background-200/10 -mx-4 -mb-4 p-4 gap-1;
            .subject__body-item {
              @apply flex flex-row gap-2 items-center;
            }
          }
        }
      }
    }
  }
}
</style>
