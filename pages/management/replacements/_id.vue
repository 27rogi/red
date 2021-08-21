<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого расписания не существует!</p>
      </div>
      <div v-else class="editor">
        <uiLoader v-if="isLoading" />
        <div v-if="success" class="editor--message">
          <h6>Успешно обновлено.</h6>
          <p>Обновление расписания прошло успешно!</p>
        </div>
        <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
        <h1>Редактирование расписания #{{$route.params.id}}</h1>
        <div class="editor--field">
          <p>Учебный предмет <span v-if="errors && errors.subject" class="field--error">{{errors.subject}}</span></p>
          <multiselect id="ajaxSubject" v-model="subject.selectedSubject" :searchable="true" :internal-search="false"
            :show-labels="false" :allow-empty="false" label="name" track-by="subjectId" :options="subject.subjects"
            :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
            @search-change="findSubjects" @open="findSubjects">
            <template slot="singleLabel" slot-scope="props">{{ props.option.name }}
              (#{{props.option.subjectId}})</template>
            <template slot="option" slot-scope="props">{{ props.option.name }} (#{{props.option.subjectId}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>День недели <span v-if="errors && errors.weekDay" class="field--error">{{errors.weekDay}}</span></p>
          <multiselect id="ajaxWeekDay" v-model="weekDay.selectedWeekDay" :searchable="true" :show-labels="false"
            :allow-empty="false" :options="weekDay.variants" label="name" track-by="day">
            <template slot="singleLabel" slot-scope="props">{{ props.option.name }} ({{props.option.day}})</template>
            <template slot="option" slot-scope="props">{{ props.option.name }} ({{props.option.day}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>Время начала <span v-if="errors && errors.bell" class="field--error">{{errors.bell}}</span></p>
          <multiselect id="ajaxBell" v-model="bell.selectedBell" :searchable="true" :internal-search="false"
            :show-labels="false" :allow-empty="false" label="starts" track-by="bellId" :options="bell.bells"
            :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
            @search-change="findBells" @open="findBells">
            <template slot="singleLabel" slot-scope="props">Начало в {{ props.option.starts }}
              (#{{props.option.bellId}})</template>
            <template slot="option" slot-scope="props">Начало в {{ props.option.starts }}
              (#{{props.option.bellId}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>Четная неделя? <span v-if="errors && errors.even" class="field--error">{{errors.even}}</span></p>
          <multiselect id="ajaxEven" v-model="even.isEven" :searchable="true" :show-labels="false" :allow-empty="false"
            label="name" track-by="name" :options="even.variants">
          </multiselect>
        </div>
        <button @click="sendData">Сохранить</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  export default {
    components: {
      Multiselect,
    },
    data() {
      return {
        isLoading: false,
        replacement: null,
        subject: {
          selectedSubject: null,
          subjects: [],
        },
        schedule: {
          selectedSchedule: null,
          bells: [],
        },
        errors: {},
        success: null,
      }
    },
    async fetch() {
      this.$data.replacement = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/replacements/${this.$route.params.id}?extras=subject,schedule`
      ));

      if (this.replacement.subject) this.subject.selectedSubject = this.replacement.subject;
      if (this.replacement.schedule) this.schedule.selectedSchedule = this.replacement.schedule;
    },
    methods: {
      limitText(count) {
        return `и еще ${count} других`
      },
      findSubjects(query) {
        this.isLoading = true
        this.$axios.$get(`http://localhost:3050/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999`).then(
          response => {
            this.subject.subjects = response.results
            this.isLoading = false
          })
      },
      findBells(query) {
        this.isLoading = true
        this.$axios.$get(`http://localhost:3050/v1/diary/bells?sortBy=starts%3Aasc&limit=9999`).then(
          response => {
            this.bell.bells = response.results
            this.isLoading = false
          })
      },
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.subject.selectedSubject) this.$set(this.errors, 'subject', "Не казан учебный предмет!");
        if (!this.bell.selectedBell) this.$set(this.errors, 'bell', "Не указано время начала пары!");
        if (!this.weekDay.selectedWeekDay) this.$set(this.errors, 'weekDay', "Не указан день недели!");
        if (!this.even.isEven) this.$set(this.errors, 'even', "Не указана четность недели!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$patch(`http://localhost:3050/v1/diary/schedules/${this.$route.params.id}`, {
          subjectId: this.subject.selectedSubject.subjectId,
          bellId: this.bell.selectedBell.bellId,
          weekDay: this.weekDay.selectedWeekDay.day,
          isEven: this.even.isEven.value,
        }).then((res) => {
          this.success = true;
        }).catch(() => {
          this.success = null;
          this.$set(this.errors, 'update', "Ошибка обновления, обратитесь к администратору!");
        }).finally(() => {
          this.isLoading = false;
        });
      },
    },
  }

</script>

<style lang="scss">
  .editor {
    @apply flex flex-col gap-4;

    h1 {
      @apply mb-6 #{!important};
    }

    .editor--message {
      @apply bg-mariner-500 text-white rounded-2xl flex flex-col gap-2 p-6;

      h6 {
        @apply font-semibold text-xl;
      }

      &__error {
        @apply text-white bg-red-600;
      }
    }

    .editor--field {
      .field--error {
        @apply text-sm font-bold text-red-500;
      }

      .multiselect {
        @apply font-medium;

        .multiselect__tags {
          @apply border-none bg-water-200 rounded-2xl;
        }

        .multiselect__content-wrapper {
          @apply border-none bg-water-200 rounded-2xl;
        }

        .multiselect__option--highlight {
          @apply bg-mariner-light-600 bg-opacity-10 text-mariner-light-600;
        }

        .multiselect__option--selected {
          @apply bg-mariner-light-500 bg-opacity-20 text-mariner-light-800;

          &.multiselect__option--highlight {
            @apply bg-mariner-light-500 bg-opacity-20 text-mariner-light-800;
          }
        }

        .multiselect__input,
        .multiselect__single {
          line-height: inherit;
          @apply bg-transparent;
        }
      }

      p {
        @apply text-lg font-semibold mb-2;
      }
    }

    button {
      @apply w-full text-center bg-mariner-light-200 px-6 py-2 rounded-2xl;

      &:hover {
        @apply bg-mariner-200;
      }
    }
  }

</style>
