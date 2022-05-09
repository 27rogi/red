<template>
  <div
    class="schedule"
    :class="{ 'schedule__inactive': subjects.length == 0, 'schedule__active': isActive }"
  >
    <div class="schedule--date" @click="collapsed = !collapsed">
      <p>{{ $moment(`${$props.date.day}.${$props.date.month}`, 'DD.MM').format('DD MMMM, dddd') }}</p>
    </div>

    <div v-if="!collapsed" class="schedule--contents">
      <div v-if="subjects.length > 0" class="schedule--subjects">
        <div v-for="subject in subjects" :key="subject.scheduleId" class="schedule--subject">
          <div v-if="subject.bell" class="subject--time">
            <p>{{ subject.bell.starts }}</p>
          </div>
          <div v-if="subject.replacement && subject.replacement.subject" class="subject--info">
            <tippy
              v-if="subject.replacement.subject"
              :interactive="true"
              :to="subject.scheduleId + subject.replacement.subjectId + subject.weekDay"
            >
              <p>
                Замена предмета
                <b>{{ subject.subject.name }}</b>
              </p>
              <p>
                Преподаватель
                <b>{{ subject.subject.teacher }}</b>
              </p>
              <p>
                Кабинет
                <b>№{{ subject.subject.location }}</b>
              </p>
            </tippy>
            <p class="subject--name">
              {{ subject.replacement.subject.name }}
              <span
                :name="subject.scheduleId + subject.replacement.subjectId + subject.weekDay"
                class="info info__replaced"
              >Замена</span>
            </p>
            <div class="subject--info-item">
              <v-icon name="md-face-twotone" />
              <p>
                Преподаватель
                <b>{{ (subject.replacement.teacher) ? subject.replacement.teacher : subject.replacement.subject.teacher }}</b>
              </p>
            </div>
            <div class="subject--info-item">
              <v-icon name="md-locationon-twotone" />
              <p>
                Кабинет
                <b>№{{ (subject.replacement.location) ? subject.replacement.location : subject.replacement.subject.location }}</b>
              </p>
            </div>
          </div>
          <div v-else class="subject--info">
            <p class="subject--name">{{ subject.subject.name }}</p>
            <div class="subject--info-item">
              <v-icon name="md-face-twotone" />
              <p>
                Преподаватель
                <b>{{ subject.subject.teacher }}</b>
              </p>
            </div>
            <div class="subject--info-item">
              <v-icon name="md-locationon-twotone" />
              <p>
                Кабинет
                <b>№{{ subject.subject.location }}</b>
              </p>
            </div>
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
    day: {
      type: Object,
      default: null,
    },
    date: {
      type: Object,
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
    }
  },
  computed: {
    subjects() {
      if (this.$props.day) {
        const subjects = this.$props.day.subjects;

        subjects.sort((currSubject, nextSubject) => {
          const currentBellTime = currSubject.bell.starts.split(':');
          const nextBellTime = nextSubject.bell.starts.split(':');

          if (currentBellTime[0] < nextBellTime[0]) return -1;
          if (currentBellTime[0] > nextBellTime[0]) return 1;

          if (currentBellTime[1] < nextBellTime[1]) return -1;
          if (currentBellTime[1] > nextBellTime[1]) return 1;

          return 0;
        });

        return subjects;
      }
      return [];
    },
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
}

</script>

<style lang="scss" scoped>
.schedule {
  @apply rounded-xl bg-background-300/50 mb-6;

  .schedule--date {
    @apply cursor-pointer font-semibold text-xl py-4 px-5 text-primary-50;
  }

  .schedule--contents {
    @apply px-2 pb-2;

    .schedule--subjects {
      @apply flex flex-col gap-2;

      .schedule--subject {
        @apply rounded-xl flex flex-col bg-background-900/50 bg-opacity-95 p-4 gap-1 sm:flex-row sm:items-start;

        .subject--time {
          @apply font-semibold mx-auto text-base mb-1 text-primary-50/90 sm:mt-0.5 sm:mr-4 sm:w-auto;
        }

        .subject--info {
          @apply flex flex-col font-semibold w-full text-primary-50 gap-1;

          b {
            @apply font-extrabold text-primary-400;
          }

          .subject--info-item {
            @apply flex flex-row gap-1 items-center;
          }

          .subject--name {
            @apply flex flex-col font-extrabold text-xl text-primary-400 sm:flex-row sm:items-center;

            .info {
              @apply cursor-help font-semibold bg-primary-300 bg-opacity-10 rounded-2xl text-center text-sm w-full py-0.5 px-4 text-primary-400 sm:text-left sm:ml-2 sm:w-auto;

              &__replaced {
                @apply bg-primary-600 text-primary-50;
              }

              &__homework {
                @apply bg-green-500 text-primary-50;
              }
            }
          }
        }
      }
    }

    .schedule--none {
      @apply font-semibold text-xl p-4;
    }
  }
}

.schedule__inactive {
  @apply bg-background-300 bg-opacity-10;

  .schedule--date {
    @apply text-primary-50 text-opacity-30;
  }
}

.schedule__active {
  @apply bg-background-200 bg-opacity-20 rounded-2xl mb-6;

  .schedule--date {
    @apply text-primary-50 text-opacity-90;
  }
}
</style>
