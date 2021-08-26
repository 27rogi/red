<template>
  <div class="add">
    <uiLoader v-if="isLoading" />
    <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
    <h1>Добавление нового звонка</h1>
    <div class="add--field">
      <p>Время начала звонка <span v-if="errors && errors.starts" class="field--error">{{errors.starts}}</span></p>
      <date-picker v-model="starts" type="time" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="HH:mm"
        format="HH:mm" />
    </div>
    <div class="add--field">
      <p>Время оканчивающего звонка <span v-if="errors && errors.ends" class="field--error">{{errors.ends}}</span></p>
      <date-picker v-model="ends" type="time" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="HH:mm"
        format="HH:mm" />
    </div>
    <button @click="sendData">Сохранить</button>
  </div>
</template>

<script>
  import DatePicker from "vue2-datepicker";
  import 'vue2-datepicker/locale/ru';
  import 'vue2-datepicker/index.css';

  export default {
    components: {
      DatePicker,
    },
    data() {
      return {
        isLoading: false,
        starts: null,
        ends: null,
        errors: {},
      }
    },
    methods: {
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.starts) this.$set(this.errors, 'starts', "Не указано время начального звонка!");
        if (!this.ends) this.$set(this.errors, 'ends', "Не указано время оканчивающего звонка!");
        if (this.$moment(this.ends, 'HH:mm').isBefore(this.$moment(this.starts, 'HH:mm'))) this.$set(this.errors, 'ends', "Окончание звонка должно быть позже его начала!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$post(`http://localhost:3050/v1/diary/bells`, {
          starts: this.starts,
          ends: this.ends,
        }).then((res) => {
          this.$router.push({ path: '/management/bells' });
          this.$toasted.show(`Звонок #${res.bellId} успешно создан`, {type: 'success'});
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
    }

    button {
      @apply w-full text-center bg-mariner-light-200 px-6 py-2 rounded-2xl;

      &:hover {
        @apply bg-mariner-200;
      }
    }
  }

</style>
