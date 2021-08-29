<template>
  <div class="add">
    <uiLoader v-if="isLoading" />
    <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
    <h1>Добавление нового предмета</h1>
    <div class="add--field">
      <p>Название предмета <span v-if="errors && errors.name" class="field--error">{{errors.name}}</span></p>
      <input id="teacher" v-model="name" class="add--input" placeholder="Введите имя предмета" type="text" />
    </div>
    <div class="add--field">
      <p>ФИО преподавателя <span v-if="errors && errors.teacher" class="field--error">{{errors.teacher}}</span></p>
      <input id="teacher" v-model="teacher" class="add--input" placeholder="Введите ФИО преподавателя" type="text" />
    </div>
    <div class="add--field">
      <p>Номер кабинета <span v-if="errors && errors.location" class="field--error">{{errors.location}}</span></p>
      <input id="location" v-model="location" class="add--input" placeholder="Введите номер кабинета"
        type="number" />
    </div>
    <button class="button button__w-full" @click="sendData">Сохранить</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isLoading: false,
        subject: null,
        name: null,
        teacher: null,
        location: null,
        errors: {},
      }
    },
    methods: {
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.name) this.$set(this.errors, 'name', "Не указано название предмета!");
        if (!this.teacher) this.$set(this.errors, 'teacher', "Не указано ФИО преподавателя!");
        if (!this.location) this.$set(this.errors, 'location', "Не указан номер кабинета!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$post(`http://localhost:3050/v1/diary/subjects`, {
          name: this.name,
          teacher: this.teacher,
          location: this.location,
        }).then((res) => {
          this.$router.push({ path: '/management/subjects' });
          this.$toasted.show(`Предмет #${res.subjectId} успешно создан`, {type: 'success'});
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

      .add--input {
        @apply w-full border-none rounded-2xl shadow-none;
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
