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
          <button class="button" type="submit">Войти</button>
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
        this.$data.error = err.response;
      }
    }
  }
}
</script>

<style lang="scss">
.login {
  @apply flex flex-col font-medium h-full gap-4 items-center justify-center;
  .login--message {
    @apply flex flex-col bg-primary-100 rounded-2xl p-6 gap-2;
    h6 {
      @apply text-xl;
    }
    &__error {
      @apply bg-red-600 text-white;
    }
  }
  .login--form {
    @apply flex flex-col bg-primary-50 rounded-2xl p-6 gap-4;
    h2 {
      @apply font-semibold text-center pb-4 text-2xl;
    }
    .login--field {
      @apply flex flex-row gap-4 items-center;
      label {
        @apply text-xl p-2 w-32;
      }
      input {
        @apply p-2;
      }
    }
    .login--buttons {
      @apply flex mt-4 items-center justify-center;
    }
  }
}
</style>
