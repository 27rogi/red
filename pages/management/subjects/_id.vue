<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого предмета не существует!</p>
      </div>
      <div v-else class="editor">
        <uiLoader v-if="isLoading" />
        <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
        <h1>Редактирование предмета #{{$route.params.id}}</h1>
        <div class="editor--field">
          <p>Название предмета <span v-if="errors && errors.name"
              class="field--error">{{errors.name}}</span></p>
          <input id="teacher" v-model="name" class="editor--input" placeholder="Введите имя предмета"
            type="text" />
        </div>
        <div class="editor--field">
          <p>ФИО преподавателя <span v-if="errors && errors.teacher"
              class="field--error">{{errors.teacher}}</span></p>
          <input id="teacher" v-model="teacher" class="editor--input" placeholder="Введите ФИО преподавателя"
            type="text" />
        </div>
        <div class="editor--field">
          <p>Номер кабинета <span v-if="errors && errors.location"
              class="field--error">{{errors.location}}</span></p>
          <input id="location" v-model="location" class="editor--input" placeholder="Введите номер кабинета"
            type="number" />
        </div>
        <button @click="sendData">Сохранить</button>
      </div>
    </transition>
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
    async fetch() {
      this.$data.subject = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/subjects/${this.$route.params.id}`
      ));

      if (this.subject.name) this.name = this.subject.name;
      if (this.subject.teacher) this.teacher = this.subject.teacher;
      if (this.subject.location) this.location = this.subject.location;
    },
    methods: {
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.name) this.$set(this.errors, 'name', "Не указано название предмета!");
        if (!this.teacher) this.$set(this.errors, 'teacher', "Не указано ФИО преподавателя!");
        if (!this.location) this.$set(this.errors, 'location', "Не указан номер кабинета!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$patch(`http://localhost:3050/v1/diary/subjects/${this.$route.params.id}`, {
          name: this.name,
          teacher: this.teacher,
          location: this.location,
        }).then((res) => {
          this.$router.push({ path: '/management/subjects' });
          this.$toasted.show(`Предмет #${this.$route.params.id} успешно обновлен`, {type: 'success'});
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

      .editor--input {
        @apply text-black p-2 w-full border-none bg-water-200 rounded-2xl shadow-none;
      }

      .field--error {
        @apply text-sm font-bold text-red-500;
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
