<template>
  <div class="add">
    <uiLoader v-if="isLoading" />
    <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
    <h1>Добавление домашнего задания</h1>
    <div class="add--field">
      <p>Предмет домашнего задания <span v-if="errors && errors.subject" class="field--error">{{errors.subject}}</span>
      </p>
      <multiselect id="ajaxSubject" v-model="subject.selectedSubject" :searchable="true" :internal-search="false"
        :show-labels="false" :allow-empty="false" label="name" track-by="subjectId" :options="subject.subjects"
        :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
        @search-change="findSubjects" @open="findSubjects">
        <template slot="singleLabel" slot-scope="props">{{ props.option.name }}
          (#{{props.option.subjectId}})</template>
        <template slot="option" slot-scope="props">{{ props.option.name }} (#{{props.option.subjectId}})</template>
      </multiselect>
    </div>
    <div class="add--field">
      <p>Дата сдачи <span v-if="errors && errors.date" class="field--error">{{errors.date}}</span></p>
      <date-picker v-model="date" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="DD/MM/YYYY"
        format="DD.MM.YYYY" />
      <span v-if="date">{{$moment(date, 'DD/MM/YYYY').format('DD MMMM YYYY (dddd)')}}</span>
    </div>
    <div class="add--field">
      <p>Описание задания <span v-if="errors && errors.mission" class="field--error">{{errors.mission}}</span></p>
      <textarea id="mission" v-model="mission" rows="5" class="add--input"
        placeholder="Напишите, что необходимо сделать" type="text"></textarea>
    </div>
    <div class="add--field">
      <span v-if="errors && errors.files" class="field--error">{{errors.files}}</span>
      <div class="add--controls">
        <p>Ссылки на изображения (не обязательно)</p>
        <button class="button" @click="addField">Добавить</button>
      </div>
      <div v-if="files.length > 0">
        <div v-for="(file, index) in files" :key="index" class="add--file-input">
          <input id="files" v-model="files[index]" class="add--input" placeholder="Введите номер кабинета"
            type="text" />
          <button class="button" @click="removeField(index)">X</button>
        </div>
      </div>
      <div v-else>
        <p>Вы еще не добавили ссылки</p>
      </div>
    </div>
    <button @click="sendData">Сохранить</button>
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
        mission: null,
        files: [],
        date: null,
        subject: {
          selectedSubject: null,
          subjects: [],
        },
        errors: {},
      }
    },
    watch: {
      files(value) {
        if (this.errors.files && value.length === 0) this.$set(this.errors, 'files', null);
        value.forEach((fileLink, index) => {
          const file = fileLink.split('?')[0];
          if (!file.match(/^.*\.(jpg|JPG|gif|GIF|png|PNG)$/)) {
            return this.$set(this.errors, 'files',
              "Неправильно указаны ссылки, они должны указывать на файл формата (.jpg, .gif или .png)");
          } else {
            this.$data.files[index] = file;
            this.$set(this.errors, 'files', null);
          }
        });
      }
    },
    methods: {
      addField() {
        this.$data.files.push('')
      },
      removeField(index) {
        if (index > -1) {
          this.$data.files.splice(index, 1);
        }
      },
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
      sendData() {
        if (this.errors.files) return;

        this.$set(this, 'errors', {});

        if (!this.subject.selectedSubject) this.$set(this.errors, 'subject', "Не указан учебный предмет!");
        if (!this.mission) this.$set(this.errors, 'mission', "Необходимо дать краткое описание домашнему заданию!");
        if (!this.date) this.$set(this.errors, 'date', "Не указана дата сдачи домашнего задания!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;

        const postBody = {
          subjectId: this.subject.selectedSubject.subjectId,
          mission: this.mission,
          files: (this.files.length > 0) ? this.files : null,
          date: this.date,
        };

        this.$axios.$post(`http://localhost:3050/v1/diary/homeworks`, postBody).then((res) => {
          if (this.$route.query.diff) {
            this.$router.push({
              path: '/homeworks'
            });
          } else {
            this.$router.push({
              path: '/management/homeworks'
            });
          }

          this.$toasted.show(`Домашнее задание #${res.homeworkId} успешно добавлено`, {
            type: 'success'
          });
        }).catch((err) => {
          if (err.response && err.response.status === 400) {
            this.$toasted.show(`Ошибка в заполнении данных, возможно домашнее задание на эту дату уже существует!`);
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
  .add {
    @apply flex flex-col gap-4;

    h1 {
      @apply mb-6 #{!important};
    }

    .add--message {
      @apply bg-mariner-500 text-white rounded-2xl flex flex-col gap-2 p-6;

      h6 {
        @apply font-semibold text-xl;
      }

      &__error {
        @apply text-white bg-red-600;
      }
    }

    .add--field {
      .mx-datepicker {
        @apply w-full;
      }

      .add--file-input {
        @apply flex flex-row items-center gap-2 mb-2;

        input {
          @apply w-11/12;
        }

        .button {
          @apply w-1/12 text-base font-medium bg-red-500 text-white;
        }
      }

      .add--input,
      .mx-input {
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

      .add--controls {
        @apply flex flex-row items-center gap-4 mb-2;

        p {
          @apply m-0;
        }

        .button {
          @apply w-1/6 py-1 text-base font-medium;
        }
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
