<template>
  <div class="management-header">
    <div class="management-header--control management-header--control__search">
      <input
        v-model="searchQuery"
        name="search"
        type="text"
        placeholder="Поиск по названию, номеру и т.д."
      />
    </div>
    <div class="management-header--control management-header--control__limiter">
      <multiselect
        :value="limitValue"
        :hide-selected="true"
        placeholder="Укажите кол. во"
        :show-labels="false"
        :allow-empty="false"
        label="name"
        track-by="name"
        :options="variants"
        @select="select"
      ></multiselect>
    </div>
    <div class="management-header--control management-header--control__page-controls">
      <button class="button" @click="$emit('pageBack', $props.page)">Назад</button>
      <p>{{ page }} из {{ pages }}</p>
      <button class="button" @click="$emit('pageNext', $props.page)">Далее</button>
    </div>
    <div class="management-header--control management-header--control__page-add">
      <button class="button button__primary" @click="$emit('pageAdd', $props.page)">Добавить</button>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
export default {
  components: {
    Multiselect
  },
  props: {
    page: {
      type: Number,
    },
    pages: {
      type: Number,
    },
    limit: {
      type: Object,
    },
  },
  data() {
    return {
      searchQuery: '',
      limitValue: null,
      variants: [
        { name: '10 записей', code: 10 },
        { name: '50 записей', code: 50 },
        { name: '100 записей', code: 100 },
      ]
    }
  },
  watch: {
    searchQuery(val) {
      return this.$emit('searchChanged', val);
    }
  },
  mounted() {
    this.$data.limitValue = this.$props.limit;
  },
  methods: {
    select(item) {
      this.$emit('limitChange', item);
    }
  }
}

</script>

<style lang="scss">
.management-header {
  @apply flex flex-col bg-primary-100 rounded-2xl mb-4 p-4 gap-4 xl:flex-row;

  .management-header--control {
    @apply flex flex-row gap-2 items-center justify-center;

    input {
      @apply bg-primary-50;
    }

    .multiselect {
      .multiselect__tags,
      .multiselect .multiselect__content-wrapper {
        @apply bg-primary-50;
      }
      .multiselect__content {
        @apply bg-primary-50;
      }
    }

    &__search {
      @apply xl:w-[45%];

      input {
        @apply rounded-2xl w-full p-2 px-4;
      }
    }

    &__limiter {
      @apply xl:w-[20%];
    }

    &__page-add {
      @apply xl:w-[10%];
    }

    &__page-controls {
      @apply xl:w-[25%];
    }

    &__page-controls,
    &__page-add {
      @apply font-semibold;

      p {
        @apply flex-shrink flex-grow text-center w-full;
      }

      a.button,
      button {
        @apply text-center w-full py-2 px-6;
      }
    }
  }
}
</style>
