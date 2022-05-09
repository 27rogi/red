<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p
        v-else-if="$fetchState.error && $fetchState.error.message !== 'Request failed with status code 404'"
      >{{ $fetchState.error }}</p>
      <div v-else class="replacements">
        <h1 class="page-title">Замены в расписании на {{ currentDate.format('DD MMMM') }}</h1>
        <div v-if="replacements.length === 0" class="replacement">
          <h2 class="replacement--date">Замены отсутствуют!</h2>
        </div>
        <div v-else class="replacement">
          <div v-for="(subject, index) in replacements" :key="index" class="replacement--item">
            <div class="replacement--original">
              <p class="replacement--title">
                <span>{{ subject.subject.name }}</span>
              </p>
              <div class="replacement__teacher">
                <v-icon name="md-face-twotone" />
                <p>{{ subject.subject.teacher }}</p>
              </div>
              <div class="replacement__location">
                <v-icon name="md-locationon-twotone" />
                <p>Кабинет №{{ subject.subject.location }}</p>
              </div>
            </div>
            <div class="replacement--icon">
              <v-icon name="md-arrowrightalt-twotone" scale="2" />
              <v-icon class="mobile" name="md-arrowdownward-twotone" scale="1" />
            </div>
            <div class="replacement--current">
              <p class="replacement--title">
                <span>{{ subject.replacement.subject.name }}</span>
              </p>
              <div class="replacement__teacher">
                <v-icon name="md-face-twotone" />
                <p>{{ subject.replacement.teacher ? subject.replacement.teacher : subject.replacement.subject.teacher }}</p>
              </div>
              <div class="replacement__location">
                <v-icon name="md-locationon-twotone" />
                <p>Кабинет №{{ subject.replacement.location ? subject.replacement.location : subject.replacement.subject.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: null,
      replacements: [],
    }
  },
  async fetch() {
    this.$data.currentDate = this.$moment();
    const schedule = (await this.$axios.$get(
      `${process.env.baseUrl}/v1/diary/schedules/date/${this.currentDate.clone().startOf("isoWeek").format("DD-MM-YYYY")}`,
    ))
    if (schedule) {
      const subjects = schedule.days[this.currentDate.isoWeekday()].subjects;
      if (subjects.length > 0) {
        subjects.forEach((subject) => {
          if (subject.replacement) this.replacements.push(subject);
        })
      }
    }
  },
  head: {
    title: 'Замены в расписании'
  }
}

</script>

<style lang="scss" scoped>
.replacements {
  @apply flex flex-col gap-4;

  .replacement {
    @apply flex flex-col bg-background-200/10 bg-opacity-10 rounded-2xl p-2 gap-2 md:p-4;

    .replacement--date {
      @apply font-semibold text-xl py-2 px-2 text-primary-600;
    }

    .replacement--item {
      @apply flex flex-col gap-2 items-center md:flex-row;

      .replacement--original,
      .replacement--current {
        @apply bg-background-100/10 rounded-2xl w-full p-4 md:w-5/12;
      }

      .replacement--icon {
        @apply flex m-auto w-full justify-center md:w-2/12;
        svg.mobile {
          @apply flex md:hidden;
        }
        svg:not(.mobile) {
          @apply hidden md:flex;
        }
      }

      b {
        @apply font-medium text-primary-800;
      }

      .replacement__location,
      .replacement__teacher {
        @apply flex flex-row gap-1 items-center;
      }

      .replacement--title {
        @apply font-semibold text-xl text-primary-600 gap-2 inline-flex justify-center items-center;
      }
    }
  }
}
</style>
