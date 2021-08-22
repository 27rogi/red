<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такой замены не существует!</p>
      </div>
      <div v-else class="editor">
        <uiLoader v-if="isLoading" />
        <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
        <h1>Редактирование замены #{{$route.params.id}}</h1>
        <div class="editor--field">
          <p>Заменяющий предмет <span v-if="errors && errors.subject" class="field--error">{{errors.subject}}</span></p>
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
          <p>Заменяемый урок <span v-if="errors && errors.schedule"
              class="field--error">{{errors.schedule}}</span></p>
          <multiselect id="ajaxSchedule" v-model="schedule.selectedSchedule" :searchable="true" :internal-search="false"
            :show-labels="false" :allow-empty="false" label="starts" track-by="scheduleId" :options="schedule.schedules"
            :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
            @search-change="findSchedules" @open="findSchedules">
            <template slot="singleLabel" slot-scope="props">{{ props.option.subject.name }} {{days[props.option.weekDay]}} в
              {{ props.option.bell.starts }} (#{{props.option.scheduleId}})</template>
            <template slot="option" slot-scope="props">{{ props.option.subject.name }} {{days[props.option.weekDay]}} в {{ props.option.bell.starts }}
              (#{{props.option.scheduleId}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>Дата замены <span v-if="errors && errors.date" class="field--error">{{errors.date}}</span></p>
          <date-picker v-model="date" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="DD/MM/YYYY" format="DD.MM.YYYY" />
          <span v-if="date">{{$moment(date, 'DD/MM/YYYY').format('DD MMMM YYYY (dddd)')}}</span>
        </div>
        <div class="editor--field">
          <p>Заменяющий учитель (не обязательно) <span v-if="errors && errors.teacher"
              class="field--error">{{errors.teacher}}</span></p>
          <input id="teacher" v-model="teacher" class="editor--input" placeholder="Введите имя заменяющего учителя" type="text" />
        </div>
        <div class="editor--field">
          <p>Номер кабинета замены (не обязательно) <span v-if="errors && errors.location"
              class="field--error">{{errors.location}}</span></p>
          <input id="location" v-model="location" class="editor--input" placeholder="Введите номер кабинета" type="number" />
        </div>
        <button @click="sendData">Сохранить</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import DatePicker from 'vue2-datepicker';
  import 'vue2-datepicker/locale/ru';
  import 'vue2-datepicker/index.css';

  export default {
    components: {
      Multiselect,
      DatePicker,
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
          schedules: [],
        },
        date: null,
        teacher: null,
        location: null,
        days: {
          1: "понедельник",
          2: "вторник",
          3: "среда",
          4: "четверг",
          5: "пятница",
          6: "суббота",
          7: "воскресенье",
        },
        errors: {},
      }
    },
    async fetch() {
      this.$data.replacement = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/replacements/${this.$route.params.id}?extras=subject,schedule`
      ));

      if (this.replacement.subject) this.subject.selectedSubject = this.replacement.subject;
      if (this.replacement.date) this.date = this.replacement.date;
      this.$data.schedule.selectedSchedule = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules/${this.replacement.replacedSchedule}?extras=subject,bell,replacement`
      ));
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
      findSchedules(query) {
        this.isLoading = true
        this.$axios.$get(
            `http://localhost:3050/v1/diary/schedules?sortBy=scheduleId%3Aasc&limit=9999&extras=subject,bell,replacement`)
          .then(
            response => {
              this.schedule.schedules = response.results
              this.isLoading = false
            })
      },
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.subject.selectedSubject) this.$set(this.errors, 'subject', "Не казан заменяемый учебный предмет!");
        if (!this.schedule.selectedSchedule) this.$set(this.errors, 'schedule', "Не указан заменяемый урок!");
        if (!this.date) this.$set(this.errors, 'date', "Не указана дата замены!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;

        const patchBody = {
          replacedSchedule: this.schedule.selectedSchedule.scheduleId,
          replacingSubject: this.subject.selectedSubject.subjectId,
          date: this.date,
        };
        if(this.teacher) patchBody.teacher = this.teacher;
        if(this.location) patchBody.location = Number(this.location);

        this.$axios.$patch(`http://localhost:3050/v1/diary/replacements/${this.$route.params.id}`, patchBody).then((res) => {
          this.$router.push({ path: '/management/replacements' });
          this.$toasted.show(`Замена #${this.$route.params.id} успешно обновлена`, {type: 'success'});
        }).catch((err) => {
          if(err.response && err.response.status === 400) {
            this.$toasted.show(`Ошибка в заполнении данных!`);
          } else {
            this.$toasted.show(`Внутренняя ошибка сервера!`);
          }
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
      .mx-datepicker {
        @apply w-full;
      }

      .editor--input, .mx-input {
        @apply text-black p-2 w-full border-none bg-water-200 rounded-2xl shadow-none;
      }

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
