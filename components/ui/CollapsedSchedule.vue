<template>
  <div class="schedule" :class="{ 'schedule__inactive': $props.schedules.length == 0}">
        <div class="schedule--date" @click="collapsed = !collapsed">
          <p>
            {{ $moment(`${$props.date.day}.${$props.date.month}`, 'DD.MM').format('DD MMMM, dddd') }}
          </p>
        </div>
        <div v-if="!collapsed" class="schedule--contents">
          <div v-if="$props.schedules.length > 0" class="schedule--subjects">
            <div v-for="schedule in $props.schedules" :key="schedule.scheduleId" class="schedule--subject">
              <div v-if="schedule.bell" class="subject--time">
                <p>{{ schedule.bell.starts }}</p>
              </div>
              <div class="subject--info">
              <p class="subject--name">{{ schedule.subject.name }} <span v-if="schedule.replacement" class="info info__replaced">Замена</span></p>
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
    index: {
      type: Number,
      default: null,
    }
  },
  data() {
    return {
      collapsed: true,
    }
  },
  mounted(){
      this.$smoothReflow()
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
        @apply bg-mariner-light-100 p-4 flex flex-row items-center rounded-2xl;
        .subject--time {
          @apply text-water-400 text-base font-medium mr-4;
        }
        .subject--info {
          .subject--name {
            @apply inline-flex justify-center items-center text-water-600 text-xl font-medium;
            .info {
            @apply font-semibold text-sm text-water-400 bg-mariner-light-300 bg-opacity-10 px-4 py-0.5 ml-2 rounded-2xl;
            &__replaced {
              @apply bg-mariner-light-500 bg-opacity-60 text-gray-50;
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
    @apply text-mariner-light-500 text-opacity-30;
  }
}
</style>
