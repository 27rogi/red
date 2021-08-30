<template>
<div class="table-container">
  <transition name="fade" mode="out-in">
    <uiLoader v-if="$fetchState.pending" />
    <div v-else-if="$fetchState.error">An error occurred :(</div>
    <div v-else class="admin-panel">
      <client-only>
      <h1>{{ heading }}</h1>
      <uiManagementHeader :limit="limit" :page="($route.query.page) ? Number($route.query.page) : 1" :pages="items.totalPages" @limitChange="limitChange" @searchChanged="processSearch" @pageAdd="pageAdd" @pageBack="pageBack" @pageNext="pageNext" />
      <vue-good-table
        :columns="columns"
        :rows="items.results"
        :search-options="{
          enabled: true,
          externalQuery: searchQuery
        }"
        style-class="vgt-table striped"
        class="items-table"
        >
          <template slot="table-row" slot-scope="props">
            <div v-if="props.column.field == 'actionButtons'" class="action-buttons">
              <NuxtLink class="button button__primary" :to="`/management/${item}/${props.row[`${itemId}`]}`">Изменить</NuxtLink>
              <NuxtLink class="button button__danger" :to="`/management/${item}/delete/${props.row[`${itemId}`]}`">Удалить</NuxtLink>
            </div>
          </template>
      </vue-good-table>
      <uiLoader slot="placeholder" />
      </client-only>
    </div>
  </transition>
</div>
</template>

<script>

export default {
  props: {
    itemId: String,
    heading: String,
    sort: String,
    columns: Array,
    item: String,
    extras: String,
  },
  data() {
    return {
      limit: null,
      searchQuery: '',
      items: [],
    }
  },
  async fetch() {
    const currentPage = (this.$route.query.page) ? this.$route.query.page : 1;
    const currentLimit = (this.$route.query.limit) ? this.$route.query.limit : 10;

    let extras = "";
    if(this.$props.extras) extras = `&extras=${this.$props.extras}`;

    this.$data.items = (await this.$axios.$get(
      `https://api.ryzhenkov.space/v1/diary/${this.$props.item}?sortBy=${this.$props.sort}%3Aasc&page=${currentPage}&limit=${currentLimit}${extras}`,
    ))
  },
  watch: {
    $route(to, from) {
      this.$fetch();
    }
  },
  methods: {
    processSearch(value) {
      this.$data.searchQuery = value;
    },
    limitChange(item) {
      this.$data.limit = item;
      this.$router.push({ query: { ...this.$route.query, limit: item.code } });
    },
    pageBack(pageNumber) {
      const previousPage = pageNumber - 1;
      if(previousPage > 0) {
        this.$router.push({ query: { ...this.$route.query, page: previousPage } });
      }
    },
    pageNext(pageNumber) {
      const nextPage = pageNumber + 1;
      if(nextPage <= this.$data.items.totalPages) {
        this.$router.push({ query: { ...this.$route.query, page: nextPage } });
      }
    },
    pageAdd() {
      this.$router.push({ path: `/management/${this.$props.item}/add` });
    }
  },
}
</script>

<style lang="scss" scoped>
.admin-panel {
  > h1 {
    @apply mb-4;
  }
  .action-buttons {
    @apply flex flex-col gap-2 w-full md:w-auto md:flex-row;
  }
}
</style>
