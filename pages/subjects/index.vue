<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="subjects">
        <h1>Список предметов</h1>
        <nuxt-link v-for="subject in subjects" :key="subject.subjectId" :to="{path: `/subjects/${subject.subjectId}`}">
        <div class="subject">
          <h2 class="subject--name">{{subject.name}}</h2>
          <div class="subject--arrow"><ArrowNarrowRightIcon /></div>
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
        `http://localhost:3050/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999&page=1`,
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
      @apply cursor-pointer flex flex-row gap-2 p-4 bg-mariner-500 bg-opacity-10 rounded-2xl items-center;

      .subject--name {
        @apply px-2 py-2 font-semibold text-xl text-water-600;
      }
      .subject--arrow {
        @apply ml-auto px-2 py-2 rounded-full bg-mariner-light-300;
      }

      &:hover {
        @apply bg-mariner-light-300;
      }
    }
  }

</style>
