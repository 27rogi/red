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
                <nuxt-link :to="`/subjects/${(isReplaced(currentSchedule)) ? currentSchedule.replacement.subject.subjectId : currentSchedule.subjectId}`" class="today--schedule">
                  <h2 v-if="isReplaced(currentSchedule)">{{currentSchedule.replacement.subject.name}}</h2>
                  <h2 v-else>{{currentSchedule.subject.name}}</h2>
                  <p v-if="isReplaced(currentSchedule) && currentSchedule.replacement.subject.location">Кабинет <b>№{{currentSchedule.replacement.subject.location}}</b></p>
                  <p v-else>Кабинет <b>№{{currentSchedule.subject.location}}</b></p>
                  <p v-if="isReplaced(currentSchedule) && currentSchedule.replacement.subject.teacher">Преподаватель: <b>{{currentSchedule.replacement.subject.teacher}}</b></p>
                  <p v-else>Преподаватель: <b>{{currentSchedule.subject.teacher}}</b></p>
                </nuxt-link>
                <p>До окончания пары осталось <b>{{ timeLeft }}</b></p>
              </div>
            </div>
            <div v-else-if="!currentSchedule && schedules.length > 0" class="today--subject">
              <h2>Следующий урок <span v-if="isReplaced(schedules[0])">(замена)</span></h2>
              <div class="today--info">
                <nuxt-link :to="`/subjects/${(isReplaced(schedules[0])) ? schedules[0].replacement.subject.subjectId : schedules[0].subjectId}`" class="today--schedule today--schedule__next">
                  <h2 v-if="isReplaced(schedules[0])">{{schedules[0].replacement.subject.name}}</h2>
                  <h2 v-else>{{schedules[0].subject.name}}</h2>
                  <p v-if="isReplaced(schedules[0]) && schedules[0].replacement.subject.location">Кабинет <b>№{{schedules[0].replacement.subject.location}}</b></p>
                  <p v-else>Кабинет <b>№{{schedules[0].subject.location}}</b></p>
                  <p v-if="isReplaced(schedules[0]) && schedules[0].replacement.subject.teacher">Преподаватель: <b>{{schedules[0].replacement.subject.teacher}}</b></p>
                  <p v-else>Преподаватель: <b>{{schedules[0].subject.teacher}}</b></p>
                </nuxt-link>
                <p>До начала пары осталось <b>{{ timeLeft }}</b></p>
              </div>
            </div>
            <div v-else class="today--subject">
              <h2>Уроки на сегодня закончились</h2>
            </div>
            </transition>
          </div>
          <!-- Homeworks -->
          <div class="today--block">
            <transition name="fade" mode="out-in">
            <div v-if="currentSchedule && currentSchedule.homeworks && currentSchedule.homeworks.length > 0" class="today--subject">
              <h2>Домашнее задание</h2>
              <div class="today--info">
                <nuxt-link v-for="homework in currentSchedule.homeworks" :key="homework.homeworkId" :to="`/subjects/${homework.homeworkId}`" class="today--homework">
                  <h2>{{currentSchedule.subject.name}}</h2>
                  <p>{{homework.mission}}</p>
                </nuxt-link>
              </div>
            </div>
            <div v-else-if="!currentSchedule && schedules.length > 0 && schedules[0].homeworks.length > 0" class="today--subject">
              <h2>Домашнее задание</h2>
              <div class="today--info">
                <nuxt-link v-for="homework in schedules[0].homeworks" :key="homework.homeworkId" :to="`/subjects/${homework.homeworkId}`" class="today--homework">
                  <h2>{{schedules[0].subject.name}}</h2>
                  <p>{{homework.mission}}</p>
                </nuxt-link>
              </div>
            </div>
            <div v-else-if="(currentSchedule && currentSchedule.homeworks === 0) || schedules.length > 0">
              <h2>Домашнего задания к этому предмету нет</h2>
            </div>
            <div v-else class="today--subject">
              <h2>Домашнее задание закончилось</h2>
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

      const replacements = (await this.$axios.$get(`http://localhost:3050/v1/diary/replacements?limit=9999&sortBy=date%3Aasc&page=1&extras=subject`)).results;

      if(schedules.length <= 0) {
        this.$data.noSchedules = true;
        return;
      }

      schedules.forEach(async (schedule, index) => {
        if (schedule.replacements) {
          schedule.replacements.forEach((replacement) => {
            console.log('trying to check ' + replacement.replacementId)
            console.log(this.$moment(replacement.date, 'DD/MM/YYYY').format('DD MM'))
            console.log(currentDate.format('DD MM'))
            if (this.$moment(replacement.date, 'DD/MM/YYYY').format('DD MM') !== currentDate.format('DD MM')) return;
            console.log('check passed')
            replacements.forEach((item) => {
              if(item.replacementId === replacement.replacementId) this.$set(schedule, 'replacement', item)
            });

            console.log(schedule.data)
          });
        }
        if (schedule.homeworks) {
          const activeHomeworks = [];
          await schedule.homeworks.forEach((homework) => {
            console.log(
              `is ${currentDate.format('DD.MM')} between ${this.$moment(homework.created).format('DD.MM')} and ${this.$moment(homework.date, 'DD/MM/YYYY').format('DD.MM')}`
            )
            if (currentDate.isBetween(this.$moment(homework.created).day(-1), this.$moment(homework.date,
                'DD/MM/YYYY'))) {
              if (schedule.replacement && schedule.replacement.replacingSubject !== schedule.subject
                .subjectId) return;

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
        console.log('checking ' + schedule.subject.name)
        console.log(`(${schedule.subject.name}) is current time ${currentDate.format('HH:mm')} is between ${this.$moment(schedule.bell.starts, 'HH:mm').format('HH:mm')} and ${this.$moment(schedule.bell.ends, 'HH:mm').format('HH:mm')}?`)
        if (currentDate.isBetween(this.$moment(schedule.bell.starts, 'HH:mm'), this.$moment(schedule.bell.ends,
            'HH:mm'))) {
              console.log(`(${schedule.subject.name}) current time ${currentDate.format('HH:mm')} is between ${this.$moment(schedule.bell.starts, 'HH:mm').format('HH:mm')} and ${this.$moment(schedule.bell.ends, 'HH:mm').format('HH:mm')}`)
          this.$data.currentSchedule = schedule;

          const endTime = this.$moment(schedule.bell.ends, 'HH:mm').add('1', 'minute');
          const startTime = currentDate;
          this.$data.scheduleTimeLeft = this.calculateTimeLeft(endTime, startTime);

          return true;
        }

        if (currentDate.isAfter(this.$moment(schedule.bell.ends, 'HH:mm'))) {
console.log(`(${schedule.subject.name}) current time ${currentDate.format('HH:mm')} is before ${this.$moment(schedule.bell.ends, 'HH:mm').format('HH:mm')}, removing`)
        }

        if (currentDate.isBefore(this.$moment(schedule.bell.starts, 'HH:mm'))) {
          console.log(`(${schedule.subject.name}) first current time ${currentDate.format('HH:mm')} is before ${this.$moment(schedule.bell.starts, 'HH:mm').format('HH:mm')}`)
          return true;
        }

        return false;
      });

      if(!this.$data.scheduleTimeLeft && filtered.length > 0) {
        const endTime = this.$moment(filtered[0].bell.starts, 'HH:mm').add('1', 'minute');
        const startTime = currentDate;
        this.$data.scheduleTimeLeft = this.calculateTimeLeft(endTime, startTime);
      }

      console.log(filtered);

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
      console.log(this.$data)
      if (this.$data.timeoutTimer) {
        console.log('clearing timeoutTimer')
        clearTimeout(this.$data.timeoutTimer);
      }
      if (this.$data.timer) {
        console.log('clearing timer')
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
      calculateTimeLeft(endTime, startTime) {
        const hoursLeft = endTime.diff(startTime, 'hours');
        const minutesLeft = this.$moment.utc(this.$moment(endTime, "HH:mm").diff(this.$moment(startTime, "HH:mm")))
          .format("mm")
        return this.$moment(`${hoursLeft}:${minutesLeft}`, 'HH:mm');
      },
      isReplaced(schedule) {
        if(!schedule) return false;
        if(!schedule.replacement) return false;

        return true;
      },
      isSameSubject(schedule) {
        if(!schedule) return false;
        if(!schedule.replacement) return false;
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
            &__next {
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

</style>
