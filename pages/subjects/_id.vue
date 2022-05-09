<template>
  <uiLoader v-if="$fetchState.pending" />
  <div v-else-if="$fetchState.error">
    <p>Такого предмета не существует!</p>
  </div>
  <div v-else class="subject--wrapper">
    <div class="subject--header">
      <h1>Просмотр предмета №{{ $route.params.id }}</h1>
    </div>
    <div class="subject">
      <p class="subject--title">{{ subject.name }}</p>
      <p class="subject--data">
        Преподаватель:
        <span>{{ subject.teacher }}</span>
      </p>
      <p class="subject--data">
        Кабинет: №
        <span>{{ subject.location }}</span>
      </p>
      <div v-if="subject.homeworks && subject.homeworks.length > 0" class="subject--homework">
        <p class="subject--data">Домашнее задание</p>
        <nuxt-link
          v-for="homework in subject.homeworks"
          :key="homework.homeworkId"
          :to="{ path: `/homeworks/${homework.homeworkId}` }"
        >
          <div class="homework">
            <div class="homework--header">
              <h2
                class="homework--name"
              >Задание до {{ $moment(homework.date, 'DD/MM/YYYY').format('DD MMMM') }}</h2>
            </div>
            <div class="homework--info">
              <p class="info--heading">Описание</p>
              <p v-html="homework.mission.replaceAll('\n', '<br>')" />
              <p
                v-if="homework.files && homework.files.length > 0"
                class="mt-6 info--heading"
              >Дополнительный материал</p>
              <p v-if="homework.files && homework.files.length > 0">
                К заданию прикреплено {{ homework.files.length }}
                файл(а)(ов)
              </p>
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
      `${process.env.baseUrl}/v1/diary/subjects/${this.$route.params.id}?extras=homeworks`
    ));

    if (this.$data.subject.homeworks)
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
    @apply flex flex-col gap-4 sm:flex-row;

    .button {
      @apply ml-auto w-full sm:w-auto;
    }
  }

  .subject {
    @apply flex flex-col bg-background-200/20 rounded-2xl p-6 gap-4;

    .subject--title {
      @apply font-semibold text-2xl sm:text-3xl;
    }

    .subject--data {
      @apply font-semibold text-xl;

      span {
        @apply font-medium text-primary-400;
      }
    }

    .subject--homework {
      @apply flex flex-col mt-4 gap-8;
    }

    .homework {
      @apply cursor-pointer flex flex-col bg-primary-500 bg-opacity-20 rounded-2xl -m-2 gap-2;

      .homework--header {
        @apply flex flex-row bg-primary-600 bg-opacity-10 rounded-2xl w-full p-2 gap-2 items-center;

        .homework--name {
          @apply font-semibold text-xl py-2 px-2 text-primary-600;
        }

        .homework--arrow {
          @apply rounded-full ml-auto py-2 px-2;
        }
      }

      .homework--info {
        @apply font-medium text-lg p-4 text-primary-900 text-opacity-70;

        .info--heading {
          @apply font-semibold text-xl text-primary-800;
        }
      }

      &:hover {
        @apply opacity-80;
      }
    }
  }
}
</style>
