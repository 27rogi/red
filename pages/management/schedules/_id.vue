<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого урока не существует!</p>
      </div>
      <div v-else class="editor">
        <uiLoader v-if="isLoading" />
        <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
        <h1>Редактирование урока #{{$route.params.id}}</h1>
        <div class="editor--field">
          <p>Учебный предмет <span v-if="errors && errors.subject" class="field--error">{{errors.subject}}</span></p>
          <multiselect id="ajaxSubject" v-model="subject.selectedSubject" :searchable="true" :internal-search="false"
            :show-labels="false" :allow-empty="false" label="name" track-by="subjectId" :options="subject.subjects"
            :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
            @search-change="findSubjects" @open="findSubjects">
            <template slot="singleLabel" slot-scope="props">{{ props.option.name }}
              (#{{props.option.subjectId}})</template>
            <template slot="option" slot-scope="props">{{ props.option.name }} (#{{props.option.subjectId}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>День недели <span v-if="errors && errors.weekDay" class="field--error">{{errors.weekDay}}</span></p>
          <multiselect id="ajaxWeekDay" v-model="weekDay.selectedWeekDay" :searchable="true" :show-labels="false"
            :allow-empty="false" :options="weekDay.variants" label="name" track-by="day">
            <template slot="singleLabel" slot-scope="props">{{ props.option.name }} ({{props.option.day}})</template>
            <template slot="option" slot-scope="props">{{ props.option.name }} ({{props.option.day}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>Время начала <span v-if="errors && errors.bell" class="field--error">{{errors.bell}}</span></p>
          <multiselect id="ajaxBell" v-model="bell.selectedBell" :searchable="true" :internal-search="false"
            :show-labels="false" :allow-empty="false" label="starts" track-by="bellId" :options="bell.bells"
            :loading="isLoading" :options-limit="300" :limit="3" :limit-text="limitText" :max-height="600"
            @search-change="findBells" @open="findBells">
            <template slot="singleLabel" slot-scope="props">Начало в {{ props.option.starts }}
              (#{{props.option.bellId}})</template>
            <template slot="option" slot-scope="props">Начало в {{ props.option.starts }}
              (#{{props.option.bellId}})</template>
          </multiselect>
        </div>
        <div class="editor--field">
          <p>Четная неделя? <span v-if="errors && errors.even" class="field--error">{{errors.even}}</span></p>
          <multiselect id="ajaxEven" v-model="even.isEven" :searchable="true" :show-labels="false" :allow-empty="false"
            label="name" track-by="name" :options="even.variants">
          </multiselect>
        </div>
        <button class="button button__w-full" @click="sendData">Сохранить</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  export default {
    components: {
      Multiselect,
    },
    data() {
      return {
        isLoading: false,
        schedule: null,
        subject: {
          selectedSubject: null,
          subjects: [],
        },
        bell: {
          selectedBell: null,
          bells: [],
        },
        weekDay: {
          selectedWeekDay: null,
          variants: [{
              day: 1,
              name: "понедельник"
            },
            {
              day: 2,
              name: "вторник"
            },
            {
              day: 3,
              name: "среда"
            },
            {
              day: 4,
              name: "четверг"
            },
            {
              day: 5,
              name: "пятница"
            },
            {
              day: 6,
              name: "суббота"
            },
            {
              day: 7,
              name: "воскресенье"
            },
          ],
        },
        even: {
          isEven: null,
          variants: [{
              name: "Четная неделя",
              value: true
            },
            {
              name: "Нечетная неделя",
              value: false
            },
          ],
        },
        errors: {},
      }
    },
    async fetch() {
      this.$data.schedule = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/schedules/${this.$route.params.id}?extras=bell%2Csubject%2Creplacements`
      ));

      if (this.schedule.subject) this.subject.selectedSubject = this.schedule.subject;
      if (this.schedule.bell) this.bell.selectedBell = this.schedule.bell;
      if (this.schedule.weekDay) {
        this.weekDay.variants.forEach(variant => {
          if (variant.day === this.schedule.weekDay) {
            this.weekDay.selectedWeekDay = variant;
          }
        });
      }
      if (typeof this.schedule.isEven === "boolean") {
        this.even.variants.forEach(variant => {
          if (variant.value === this.schedule.isEven) {
            this.even.isEven = variant;
          }
        });
      }
    },
    methods: {
      limitText(count) {
        return `и еще ${count} других`
      },
      findSubjects(query) {
        this.isLoading = true
        this.$axios.$get(`https://api.ryzhenkov.space/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999`).then(
          response => {
            this.subject.subjects = response.results
            this.isLoading = false
          })
      },
      findBells(query) {
        this.isLoading = true
        this.$axios.$get(`https://api.ryzhenkov.space/v1/diary/bells?sortBy=starts%3Aasc&limit=9999`).then(
          response => {
            this.bell.bells = response.results
            this.isLoading = false
          })
      },
      sendData() {
        this.$set(this, 'errors', {});
        if (!this.subject.selectedSubject) this.$set(this.errors, 'subject', "Не казан учебный предмет!");
        if (!this.bell.selectedBell) this.$set(this.errors, 'bell', "Не указано время начала пары!");
        if (!this.weekDay.selectedWeekDay) this.$set(this.errors, 'weekDay', "Не указан день недели!");
        if (!this.even.isEven) this.$set(this.errors, 'even', "Не указана четность недели!");

        if (Object.keys(this.errors).length > 0) return;

        this.isLoading = true;
        this.$axios.$patch(`https://api.ryzhenkov.space/v1/diary/schedules/${this.$route.params.id}`, {
          subjectId: this.subject.selectedSubject.subjectId,
          bellId: this.bell.selectedBell.bellId,
          weekDay: this.weekDay.selectedWeekDay.day,
          isEven: this.even.isEven.value,
        }).then((res) => {
          this.$router.push({ path: '/management/schedules' });
          this.$toasted.show(`Урок #${this.$route.params.id} успешно обновлен`, {type: 'success'});
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
      .field--error {
        @apply text-sm font-bold text-red-500;
      }

      p {
        @apply text-lg font-semibold mb-2;
      }
    }
  }

</style>
