<template>
  <div class="management-header">
    <div class="management-header--control management-header--control__search">
      <input v-model="searchQuery" name="search" type="text" placeholder="Поиск по названию, номеру и т.д." />
    </div>
    <div class="management-header--control management-header--control__limiter">
     <multiselect :value="limitValue" :hide-selected="true" placeholder="Укажите кол. во" :show-labels="false" :allow-empty="false" label="name" track-by="name" :options="variants" @select="select"></multiselect>
    </div>
    <div class="management-header--control management-header--control__page-controls">
      <button @click="$emit('pageBack', $props.page)">Назад</button>
      <p>{{ page }} из {{ pages }}</p>
      <button @click="$emit('pageNext', $props.page)">Далее</button>
    </div>
    <div class="management-header--control management-header--control__page-add">
      <button @click="$emit('pageAdd', $props.page)">Добавить</button>
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
          { name: '10 записей', code: 10},
          { name: '50 записей', code: 50},
          { name: '100 записей', code: 100},
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
    @apply p-4 gap-4 mb-4 rounded-2xl bg-mariner-100 flex flex-col xl:flex-row;

    .management-header--control {
      @apply items-center justify-center flex flex-row gap-2;

      &__search {
        @apply xl:w-[45%];

        input {
          @apply w-full bg-water-50 p-2 px-4 rounded-2xl;
        }
      }

      &__limiter {
        @apply xl:w-[20%];
        .multiselect {
          .multiselect__tags {
            @apply border-none bg-water-50 rounded-2xl;
          }
          .multiselect__content-wrapper {
            @apply border-none bg-water-50 rounded-2xl;
          }
        }
      }

      &__page-add {
        @apply xl:w-[10%];
        button {
          @apply bg-mariner-light-900 text-white #{!important};
        }
      }

      &__page-controls {
        @apply xl:w-[25%];
      }

      &__page-controls, &__page-add {
        @apply font-semibold;

        p {
          @apply text-center w-full flex-shrink flex-grow;
        }

        a.button,
        button {
          @apply w-full text-center bg-mariner-light-200 px-6 py-2 rounded-2xl;

          &:hover {
            @apply bg-mariner-200;
          }
        }
      }
    }
  }

</style>
