<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого звонка не существует!</p>
      </div>
      <div v-else class="editor">
        <uiLoader v-if="isLoading" />
        <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
        <h1>Редактирование звонка #{{$route.params.id}}</h1>
        <div class="editor--field">
          <p>Время начала звонка <span v-if="errors && errors.starts" class="field--error">{{errors.starts}}</span></p>
          <date-picker v-model="starts" type="time" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="HH:mm"
            format="HH:mm" />
        </div>
        <div class="editor--field">
          <p>Время оканчивающего звонка <span v-if="errors && errors.ends" class="field--error">{{errors.ends}}</span>
          </p>
          <date-picker v-model="ends" type="time" :lang="{formatLocale: { firstDayOfWeek: 1, }}" value-type="HH:mm"
            format="HH:mm" />
        </div>
        <button class="button button__w-full" @click="sendData">Сохранить</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import DatePicker from "vue2-datepicker";
  import 'vue2-datepicker/locale/ru';

  export default {
    components: {
      DatePicker,
    },
    data() {
      return {
        isLoading: false,
        bell: null,
        starts: null,
        ends: null,
        errors: {},
      }
    },
    async fetch() {
      this.$data.bell = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/bells/${this.$route.params.id}`
      ));

      if (this.bell.starts) this.starts = this.bell.starts;
      if (this.bell.ends) this.ends = this.bell.ends;
    },
    methods: {
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.starts) this.$set(this.errors, 'starts', "Не указано время начального звонка!");
        if (!this.ends) this.$set(this.errors, 'ends', "Не указано время оканчивающего звонка!");
        if (this.$moment(this.ends, 'HH:mm').isBefore(this.$moment(this.starts, 'HH:mm'))) this.$set(this.errors, 'ends', "Окончание звонка должно быть позже его начала!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$patch(`https://api.ryzhenkov.space/v1/diary/bells/${this.$route.params.id}`, {
          starts: this.starts,
          ends: this.ends,
        }).then((res) => {
          this.$router.push({ path: '/management/bells' });
          this.$toasted.show(`Звонок #${this.$route.params.id} успешно обновлен`, {type: 'success'});
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

      .field--error {
        @apply text-sm font-bold text-red-500;
      }

      p {
        @apply text-lg font-semibold mb-2;
      }
    }
  }

</style>
