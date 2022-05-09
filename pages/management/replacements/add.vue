<template>
  <div class="add">
    <uiLoader v-if="isLoading" />
    <div v-if="success && success.replacementId" class="add--message">
      <h6>Успешное добавление!</h6>
      <p>Замена успешно добавлена, ее номер в системе #{{success.replacementId}}</p>
    </div>
    <span v-if="errors && errors.update" class="field--error">{{errors.update}}</span>
    <h1>Добавление замены</h1>
    <div class="add--field">
      <p>
        На какой предмет замена
        <span
          v-if="errors && errors.subject"
          class="field--error"
        >{{errors.subject}}</span>
      </p>
      <multiselect
        id="ajaxSubject"
        v-model="subject.selectedSubject"
        :searchable="true"
        :internal-search="false"
        :show-labels="false"
        :allow-empty="false"
        label="name"
        track-by="subjectId"
        :options="subject.subjects"
        :loading="isLoading"
        :options-limit="300"
        :limit="3"
        :limit-text="limitText"
        :max-height="600"
        @search-change="findSubjects"
        @open="findSubjects"
      >
        <template slot="singleLabel" slot-scope="props">
          {{ props.option.name }}
          (#{{props.option.subjectId}})
        </template>
        <template
          slot="option"
          slot-scope="props"
        >{{ props.option.name }} (#{{props.option.subjectId}})</template>
      </multiselect>
    </div>
    <div class="add--field">
      <p>
        Дата замены
        <span v-if="errors && errors.date" class="field--error">{{errors.date}}</span>
      </p>
      <date-picker
        v-model="date"
        :lang="{formatLocale: { firstDayOfWeek: 1, }}"
        value-type="DD/MM/YYYY"
        format="DD.MM.YYYY"
      />
      <span v-if="date">{{$moment(date, 'DD/MM/YYYY').format('DD MMMM YYYY (dddd)')}}</span>
    </div>
    <div v-if="date" class="add--field">
      <p>
        На каком уроке будет замена
        <span
          v-if="errors && errors.schedule"
          class="field--error"
        >{{errors.schedule}}</span>
      </p>
      <multiselect
        id="ajaxSchedule"
        v-model="schedule.selectedSchedule"
        :searchable="true"
        :internal-search="false"
        :show-labels="false"
        :allow-empty="false"
        label="scheduleId"
        track-by="scheduleId"
        :options="schedule.schedules"
        :loading="isLoading"
        :options-limit="300"
        :limit="3"
        :limit-text="limitText"
        :max-height="600"
        @search-change="findSchedules"
        @open="findSchedules"
      >
        <template slot="singleLabel" slot-scope="props">
          {{ props.option.subject.name }} ({{even(props.option.isEven)}}) {{days[props.option.weekDay]}} в {{ props.option.bell.starts }}
          (#{{props.option.scheduleId}})
        </template>
        <template slot="option" slot-scope="props">
          {{ props.option.subject.name }} ({{even(props.option.isEven)}}) {{days[props.option.weekDay]}} в {{ props.option.bell.starts }}
          (#{{props.option.scheduleId}})
        </template>
      </multiselect>
    </div>
    <div class="add--field">
      <p>
        Заменяющий учитель (не обязательно)
        <span
          v-if="errors && errors.teacher"
          class="field--error"
        >{{errors.teacher}}</span>
      </p>
      <input
        id="teacher"
        v-model="teacher"
        class="add--input"
        placeholder="Введите имя заменяющего учителя"
        type="text"
      />
    </div>
    <div class="add--field">
      <p>
        Номер кабинета замены (не обязательно)
        <span
          v-if="errors && errors.location"
          class="field--error"
        >{{errors.location}}</span>
      </p>
      <input
        id="location"
        v-model="location"
        class="add--input"
        placeholder="Введите номер кабинета"
        type="number"
      />
    </div>
    <button class="button button__w-full" @click="sendData">Сохранить</button>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/locale/ru';


export default {
  components: {
    Multiselect,
    DatePicker,
  },
  data() {
    return {
      isLoading: false,
      replacement: null,
      subject: {
        selectedSubject: null,
        subjects: [],
      },
      schedule: {
        selectedSchedule: null,
        schedules: [],
      },
      date: null,
      teacher: null,
      location: null,
      days: {
        1: "понедельник",
        2: "вторник",
        3: "среда",
        4: "четверг",
        5: "пятница",
        6: "суббота",
        7: "воскресенье",
      },
      errors: {},
      success: null,
    }
  },
  methods: {
    limitText(count) {
      return `и еще ${count} других`
    },
    findSubjects(query) {
      this.isLoading = true
      this.$axios.$get(`${process.env.baseUrl}/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999`).then(
        response => {
          this.subject.subjects = response.results
          this.isLoading = false
        })
    },
    findSchedules(query) {
      this.isLoading = true
      let args = 'sortBy=scheduleId%3Aasc&limit=9999&extras=subject,bell,replacements';
      if (this.date) {
        const momentDate = this.$moment(this.date, 'DD/MM/YYYY');
        const isEven = Math.abs(momentDate.week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1;
        args = `sortBy=scheduleId%3Aasc&limit=9999&isEven=${isEven}&weekDay=${momentDate.isoWeekday()}&extras=subject,bell,replacements`;
      }
      this.$axios.$get(`${process.env.baseUrl}/v1/diary/schedules?${args}`).then(
        response => {
          this.schedule.schedules = response.results
          this.isLoading = false
        })
    },
    sendData() {
      this.$set(this, 'errors', {});
      if (!this.subject.selectedSubject) this.$set(this.errors, 'subject', "Не казан заменяемый учебный предмет!");
      if (!this.schedule.selectedSchedule) this.$set(this.errors, 'schedule', "Не указан заменяемый урок!");
      if (!this.date) this.$set(this.errors, 'date', "Не указана дата замены!");
      if (this.schedule.selectedSchedule && this.date) {
        if (this.$moment(this.date, 'DD/MM/YYYY').isoWeekday() !== this.schedule.selectedSchedule.weekDay) this.$set(this.errors, 'date', "Нельзя поставить замену урока на другой день недели!");
        if ((Math.abs(this.$moment(this.date, 'DD/MM/YYYY').week() - this.$moment('01 09', 'DD MM').week()) % 2 === 1) !== this.schedule.selectedSchedule.isEven) this.$set(this.errors, 'date', "Нельзя поставить замену урока на дату с отличающейся четностью!");
      }

      if (Object.keys(this.errors).length > 0) return;

      this.isLoading = true;

      const postBody = {
        replacedSchedule: this.schedule.selectedSchedule.scheduleId,
        replacingSubject: this.subject.selectedSubject.subjectId,
        date: this.date,
      };
      if (this.teacher) postBody.teacher = this.teacher;
      if (this.location) postBody.location = Number(this.location);

      this.$axios.$post(`${process.env.baseUrl}/v1/diary/replacements`, postBody).then((res) => {
        this.$router.push({ path: '/management/replacements' });
        this.$toasted.show(`Замена #${res.replacementId} успешно добавлена`, { type: 'success' });
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
    even(value) {
      if (value) return "четный"
      else return "нечетный"
    }
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
    @apply bg-primary-500 text-white rounded-2xl flex flex-col gap-2 p-6;

    h6 {
      @apply font-semibold text-xl;
    }

    &__error {
      @apply text-white bg-red-600;
    }
  }

  .add--field {
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
