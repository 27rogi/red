<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="subjects">
        <h1>Список предметов</h1>
        <nuxt-link
          v-for="subject in subjects"
          :key="subject.subjectId"
          :to="{ path: `/subjects/${subject.subjectId}` }"
        >
          <div class="subject">
            <h2 class="subject--name">{{ subject.name }}</h2>
            <div class="subject--arrow">
              <ArrowNarrowRightIcon />
            </div>
          </div>
        </nuxt-link>
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
      subjects: {},
    }
  },
  async fetch() {
    const subjects = (await this.$axios.$get(
      `${process.env.baseUrl}/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999&page=1`,
    )).results

    subjects.sort((currentSubject, nextSubject) => {
      return currentSubject.name.localeCompare(nextSubject.name);
    });

    this.subjects = subjects;
  },
}

</script>

<style lang="scss" scoped>
.subjects {
  @apply flex flex-col gap-4;

  .subject {
    @apply rounded-xl cursor-pointer flex flex-row bg-background-200/20 p-4 gap-2 items-center;

    .subject--name {
      @apply font-semibold text-xl py-2 px-2 text-primary-50;
    }
    .subject--arrow {
      @apply rounded-full ml-auto bg-background-200/30 py-2 px-2;
    }

    &:hover {
      @apply bg-background-200/50;
    }
  }
}
</style>
