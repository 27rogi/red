<template>
  <uiLoader v-if="$fetchState.pending" />
  <div v-else-if="$fetchState.error">
    <p>Такого предмета не существует!</p>
  </div>
  <div v-else class="subject--wrapper">
    <div class="subject--header">
      <h1>Просмотр предмета №{{$route.params.id}}</h1>
    </div>
    <div class="subject">
      <p class="subject--title">{{subject.name}}</p>
      <p class="subject--data">Преподаватель: <span>{{subject.teacher}}</span></p>
      <p class="subject--data">Кабинет: №<span>{{subject.location}}</span></p>
      <div v-if="subject.homeworks.length > 0" class="subject--homework">
        <p class="subject--data">Домашнее задание</p>
      <nuxt-link v-for="homework in subject.homeworks" :key="homework.homeworkId"
        :to="{path: `/homeworks/${homework.homeworkId}`}">
        <div class="homework">
          <div class="homework--header">
            <h2 class="homework--name">Задание до {{$moment(homework.date, 'DD/MM/YYYY').format('DD MMMM')}}</h2>
          </div>
          <div class="homework--info">
            <p class="info--heading">Описание</p>
            <p v-html="homework.mission.replaceAll('\n', '<br>')" />
            <p v-if="homework.files && homework.files.length > 0" class="mt-6 info--heading">Дополнительный материал</p>
            <p v-if="homework.files && homework.files.length > 0">К заданию прикреплено {{homework.files.length}}
              файл(а)(ов)</p>
          </div>
        </div>
      </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        subject: null,
      }
    },
    async fetch() {
      this.$data.subject = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/subjects/${this.$route.params.id}?extras=homeworks`
      ));

      if(this.$data.subject.homeworks)
      this.$data.subject.homeworks.sort((currentHomework, nextHomework) => {
        const currentDate = this.$moment(currentHomework.date, 'DD/MM/YYYY');
        const nextDate = this.$moment(nextHomework.date, 'DD/MM/YYYY');

        if (!currentDate.isAfter(nextDate)) return -1;
        else if (currentDate.isAfter(nextDate)) return 1;
        else return 0;
      });
    },
  }

</script>

<style lang="scss">
  .subject--wrapper {
    @apply flex flex-col gap-4;

    .subject--header {
      @apply flex flex-col sm:flex-row gap-4;

      .button {
        @apply w-full sm:w-auto ml-auto;
      }
    }

    .subject {
      @apply flex flex-col gap-4 bg-mariner-light-200 bg-opacity-50 p-6 rounded-2xl;

      .subject--title {
        @apply font-semibold text-2xl sm:text-3xl;
      }

      .subject--data {
        @apply font-semibold text-xl;

        span {
          @apply font-medium text-water-900 text-opacity-60;
        }
      }

      .subject--homework {
        @apply flex flex-col gap-8 mt-4;
      }

      .homework {
        @apply cursor-pointer flex flex-col gap-2 -m-2 bg-mariner-500 bg-opacity-20 rounded-2xl;

        .homework--header {
          @apply w-full flex flex-row gap-2 p-2 bg-mariner-600 bg-opacity-10 rounded-2xl items-center;

          .homework--name {
            @apply px-2 py-2 font-semibold text-xl text-water-600;
          }

          .homework--arrow {
            @apply ml-auto px-2 py-2 rounded-full;
          }
        }

        .homework--info {
          @apply p-4 text-lg font-medium text-water-900 text-opacity-70;

          .info--heading {
            @apply text-water-800 font-semibold text-xl;
          }
        }

        &:hover {
          @apply opacity-80;
        }
      }
    }
  }

  .dark .subject--wrapper {

    .subject {
      @apply bg-water-dark-800;

      .subject--data {
        span {
          @apply text-mariner-light-200 text-opacity-80;
        }
      }

      .homework {
        @apply bg-water-dark-600 bg-opacity-30;

        .homework--header {
          @apply bg-water-dark-600 bg-opacity-50;

          .homework--name {
            @apply text-water-dark-50;
          }
        }

        .homework--info {
          @apply text-water-dark-200;

          .info--heading {
            @apply text-water-dark-50;
          }
        }
      }
    }
  }

</style>
