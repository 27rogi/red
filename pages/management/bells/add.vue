<template>
  <div class="add">
    <uiLoader v-if="isLoading" />
    <span v-if="errors && errors.update" class="field--error">{{ errors.update }}</span>
    <h1>Добавление нового звонка</h1>
    <div class="add--field">
      <p>
        Время начала звонка
        <span
          v-if="errors && errors.starts"
          class="field--error"
        >{{ errors.starts }}</span>
      </p>
      <date-picker
        v-model="starts"
        type="time"
        :lang="{ formatLocale: { firstDayOfWeek: 1, } }"
        value-type="HH:mm"
        format="HH:mm"
      />
    </div>
    <div class="add--field">
      <p>
        Время оканчивающего звонка
        <span
          v-if="errors && errors.ends"
          class="field--error"
        >{{ errors.ends }}</span>
      </p>
      <date-picker
        v-model="ends"
        type="time"
        :lang="{ formatLocale: { firstDayOfWeek: 1, } }"
        value-type="HH:mm"
        format="HH:mm"
      />
    </div>
    <button class="button button__w-full" @click="sendData">Сохранить</button>
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
      this.$axios.$post(`${process.env.baseUrl}/v1/diary/bells`, {
        starts: this.starts,
        ends: this.ends,
      }).then((res) => {
        this.$router.push({ path: '/management/bells' });
        this.$toasted.show(`Звонок #${res.bellId} успешно создан`, { type: 'success' });
      }).catch((err) => {
        if (err.response && err.response.status === 400) {
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
    @apply flex flex-col bg-primary-500 rounded-2xl text-white p-6 gap-2;

    h6 {
      @apply font-semibold text-xl;
    }

    &__error {
      @apply bg-red-600 text-white;
    }
  }

  .add--field {
    .mx-datepicker {
      @apply w-full;
    }

    .field--error {
      @apply font-bold text-sm text-red-500;
    }

    p {
      @apply font-semibold text-lg mb-2;
    }
  }
}
</style>
