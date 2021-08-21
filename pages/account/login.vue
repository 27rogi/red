<template>
  <div class="login">
    <div v-if="response" class="login--message login--message__success">
      <h6>Успешный вход!</h6>
      <p>Вы будете перенаправлены на главную страницу через несколько секунд...</p>
    </div>
    <div v-if="error.data === undefined" class="login--message login--message__error">
      <h6>Ошибка сервера или клиента!</h6>
      <p>Внутренняя ошибка, проверьте соединение и сообщите об этой ошибке администратору.</p>
      <p>{{ error }}</p>
    </div>
    <div v-if="error.data.code === 401" class="login--message login--message__error">
      <h6>Ошибка авторизации!</h6>
      <p>Вы неправильно указали почту или пароль, возможно такого пользователя не существует.</p>
    </div>
    <div class="login--form">
    <form @submit.prevent="userLogin">
      <h2>Вход в аккаунт</h2>
      <div class="login--field">
        <label>Почта</label>
        <input v-model="login.email" name="login" type="email" />
      </div>
      <div class="login--field">
        <label>Пароль</label>
        <input v-model="login.password" name="password" type="password" />
      </div>
      <div class="login--buttons">
        <button type="submit">Войти</button>
      </div>
    </form>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  auth: 'guest',
  data() {
    return {
      login: {
        email: '',
        password: ''
      },
      error: {
        data: {
          code: null,
        }
      },
      response: null,
    }
  },
  methods: {
    async userLogin() {
      try {
        const response = await this.$auth.loginWith('local', { data: this.login })
        this.$data.response = response;
      } catch (err) {
        console.log(err.response);
        this.$data.error = err.response;
      }
    }
  }
}
</script>

<style lang="scss">
.login {
  @apply h-full flex flex-col gap-4 items-center justify-center font-medium;
  .login--message {
    @apply bg-mariner-100 rounded-2xl flex flex-col gap-2 p-6;
    h6 {
      @apply text-xl;
    }
    &__error {
      @apply text-white bg-red-600;
    }
  }
  .login--form {
    @apply bg-mariner-light-50 rounded-2xl flex flex-col gap-4 p-6;
    h2 {
      @apply text-center text-2xl font-semibold pb-4;
    }
    .login--field {
      @apply flex flex-row items-center gap-4;
      label {
        @apply p-2 text-xl w-32;
      }
      input {
        @apply bg-mariner-100 p-2;
      }
    }
    .login--buttons {
      @apply flex items-center justify-center mt-4;
      button {
        @apply w-full text-center bg-mariner-light-200 px-6 py-2;
        &:hover {
          @apply bg-mariner-100;
        }
      }
    }
  }
}
</style>
