<template>
  <div class="schedule" :class="{ 'schedule__inactive': $props.schedules.length == 0, 'schedule__active': isActive }">
    <div class="schedule--date" @click="collapsed = !collapsed">
      <p>
        {{ $moment(`${$props.date.day}.${$props.date.month}`, 'DD.MM').format('DD MMMM, dddd') }}
      </p>
    </div>
    <div v-if="!collapsed" class="schedule--contents">
      <div v-if="$props.schedules.length > 0" class="schedule--subjects">
        <div v-for="schedule in $props.schedules" :key="schedule.scheduleId" class="schedule--subject">
          <tippy v-if="schedule.replacement" :interactive="true" :to="schedule.replacement.replacementId">
            <p>Замена предмета <b>{{ schedule.subject.name }}</b></p>
            <p>Преподаватель <b>{{ schedule.subject.teacher }}</b></p>
            <p>Кабинет <b>№{{ schedule.subject.location }}</b></p>
          </tippy>
          <tippy v-if="hasHomework(schedule)" :interactive="true" :to="$moment(schedule.bell.starts, 'HH:mm').format('HHmm')+schedule.weekDay+schedule.subjectId">
            <p>Количество ДЗ, ожидающих сдачи: <b>{{ schedule.homeworks.length }}</b></p>
          </tippy>
          <div v-if="schedule.bell" class="subject--time">
            <p>{{ schedule.bell.starts }}</p>
          </div>
          <div v-if="schedule.replacement && schedule.replacement.subject" class="subject--info">
            <p class="subject--name">{{ schedule.replacement.subject.name }} <span
                :name="schedule.replacement.replacementId" class="info info__replaced">Замена</span> <span
                v-if="hasHomework(schedule)" :name="$moment(schedule.bell.starts, 'HH:mm').format('HHmm')+schedule.weekDay+schedule.subjectId" class="info info__homework">Есть
                домашка</span></p>
            <p v-if="schedule.replacement.teacher">Преподаватель <b>{{schedule.replacement.teacher}}</b></p>
            <p v-else>Преподаватель <b>{{schedule.replacement.subject.teacher}}</b></p>
            <p v-if="schedule.replacement.location">Кабинет <b>№{{schedule.replacement.location}}</b></p>
            <p v-else>Кабинет <b>№{{schedule.replacement.subject.location}}</b></p>
          </div>
          <div v-else class="subject--info">
            <p class="subject--name">{{ schedule.subject.name }} <span v-if="hasHomework(schedule)"
                :name="$moment(schedule.bell.starts, 'HH:mm').format('HHmm')+schedule.weekDay+schedule.subjectId" class="info info__homework">Есть домашка</span></p>
            <p>Преподаватель <b>{{schedule.subject.teacher}}</b></p>
            <p>Кабинет <b>№{{schedule.subject.location}}</b></p>
          </div>
        </div>
      </div>
      <div v-else class="schedule--none">
        <p>Уроки в данный день отсутствуют</p>
      </div>
    </div>
  </div>
</template>

<script>
  import smoothReflow from 'vue-smooth-reflow'
  export default {
    mixins: [smoothReflow],
    props: {
      schedules: {
        type: Array,
        default: null,
      },
      date: {
        type: Object,
        default: null,
      },
      activeDate: {
        type: null,
        default: null,
      },
      index: {
        type: Number,
        default: null,
      },
    },
    data() {
      return {
        collapsed: true,
        replacement: null,
      }
    },
    fetch() {
      if (!this.$props.schedules) return;

      const scheduleDate = this.$moment(`${this.$props.date.day}.${this.$props.date.month}`, 'DD.MM');
      this.$props.schedules.forEach((schedule) => {
        if (schedule.replacements) {
          schedule.replacements.forEach(async (replacement) => {
            if (this.$moment(replacement.date, 'DD/MM/YYYY').format('DD MM') !== scheduleDate.format('DD MM'))
              return;

            const data = (await this.$axios.$get(
              `http://localhost:3050/v1/diary/replacements/${replacement.replacementId}?extras=subject`
            ));
            this.$set(schedule, 'replacement', data);
          });
        }
        if (schedule.homeworks) {
          const activeHomeworks = [];
          schedule.homeworks.forEach((homework) => {
            console.log(
              `is ${this.$moment(scheduleDate).format('DD.MM')} between ${this.$moment(homework.created).format('DD.MM')} and ${this.$moment(homework.date, 'DD/MM/YYYY').format('DD.MM')}`
            )
            if (this.$moment(scheduleDate).isBetween(this.$moment(homework.created).isoWeekday(-2), this.$moment(homework.date, 'DD/MM/YYYY'))) activeHomeworks.push(homework);
          });
          this.$set(schedule, 'homeworks', activeHomeworks);
        }
      });

      this.$props.schedules.sort((currentSchedule, nextSchedule) => {
        const currentBellTime = currentSchedule.bell.starts.split(':');
        const nextBellTime = nextSchedule.bell.starts.split(':');

        if (currentBellTime[0] < nextBellTime[0]) return -1;
        if (currentBellTime[0] > nextBellTime[0]) return 1;

        if (currentBellTime[1] < nextBellTime[1]) return -1;
        if (currentBellTime[1] > nextBellTime[1]) return 1;

        return 0;
      });
    },
    computed: {
      isActive() {
        return this.$moment(`${this.$props.date.day} ${this.$props.date.month}`, 'DD MM').format('DD MM') === this
          .$moment(Date.now()).format('DD MM')
      }
    },
    watch: {
      $route(to, from) {
        this.$fetch();
      }
    },
    mounted() {
      this.$smoothReflow();
      if (this.isActive) {
        this.collapsed = false;
      }
    },
    methods: {
      hasHomework(schedule) {
        if (!schedule.homeworks) return false;
        if (schedule.homeworks.length <= 0) return false;

        if (schedule.replacement) {
          console.log('тут замена епты')
          if (schedule.subject.subjectId === schedule.replacement.subject.subjectId) return true;
          else return false;
        }

        return true;
      }
    },
  }

</script>

<style lang="scss" scoped>
  .schedule {
    @apply mb-6 bg-mariner-400 bg-opacity-10 rounded-2xl;

    .schedule--date {
      @apply cursor-pointer px-6 py-4 font-semibold text-xl text-water-500;
    }

    .schedule--contents {
      @apply pb-2 px-2;

      .schedule--subjects {
        @apply flex flex-col gap-2;

        .schedule--subject {
          @apply bg-mariner-light-100 p-4 flex flex-row items-start rounded-2xl;

          .subject--time {
            @apply text-water-400 text-base font-medium mr-4;
          }

          .subject--info {
            @apply w-full text-water-500 font-medium;

            b {
              @apply text-water-800 font-medium;
            }

            .subject--name {
              @apply flex flex-col sm:flex-row sm:items-center text-water-600 text-xl font-semibold;

              .info {
                @apply w-full text-center sm:text-left sm:w-auto cursor-help font-semibold text-sm text-water-400 bg-mariner-light-300 bg-opacity-10 px-4 py-0.5 sm:ml-2 rounded-2xl;

                &__replaced {
                  @apply bg-mariner-light-800 text-water-50;
                }

                &__homework {
                  @apply bg-green-500 text-water-50;
                }
              }
            }
          }
        }
      }

      .schedule--none {
        @apply p-4 font-semibold text-xl;
      }
    }
  }

  .schedule__inactive {
    @apply bg-mariner-light-300 bg-opacity-5;

    .schedule--date {
      @apply text-mariner-light-400 text-opacity-70;
    }
  }

  .schedule__active {
    @apply mb-6 bg-mariner-light-900 bg-opacity-20 rounded-2xl;

    .schedule--date {
      @apply text-water-700 text-opacity-100;
    }
  }

</style>
