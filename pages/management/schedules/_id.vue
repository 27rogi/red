<template>
  <div class="add">
    <uiLoader v-if="isLoading || $fetchState.pending" />
    <span v-if="errors && errors.update" class="field--error">{{ errors.update }}</span>
    <div v-if="$fetchState.error">{{ $fetchState.error }}</div>
    <div v-else class="schedule-edit">
      <h1>Добавление нового расписания</h1>
      <div class="schedule-edit__date">
        <p>Дата начала недели</p>
        <date-picker
          v-model="schedule.weekDate"
          type="date"
          :editable="false"
          :lang="{ formatLocale: { firstDayOfWeek: 1, } }"
          value-type="DD-MM-YYYY"
          format="DD-MM-YYYY"
          :disabled-date="notWeekStart"
        />
      </div>
      <div class="schedule-edit__controls">
        <button class="button" @click="addSubject">
          <v-icon name="md-add-twotone" />
          <p>Добавить урок</p>
        </button>
        <button class="button" @click="save">
          <v-icon name="md-save-twotone" />
          <p>Сохранить в черновик</p>
        </button>
        <button v-if="isSaved" class="button" @click="apply">
          <v-icon name="md-save-twotone" />
          <p>Применить черновик</p>
        </button>
      </div>
      <div class="schedule-edit__tabs">
        <button
          v-for="day in days.variants"
          :key="day.day"
          :class="{ active: day.day === days.selectedDay }"
          @click.prevent="days.selectedDay = day.day"
        >{{ day.name }}</button>
      </div>
      <div class="schedule-edit__content">
        <div
          v-for="(subject, index) in schedule.days[days.selectedDay].subjects"
          :key="index + days.selectedDay"
          class="schedule-edit__subject"
        >
          <div class="schedule-edit__controls">
            <button class="button" @click="removeSubject(index)">
              <v-icon name="md-remove-twotone" />
            </button>
          </div>
          <div class="schedule-edit__fields">
            <div class="subject__select">
              <p>Предмет урока</p>
              <multiselect
                :id="index"
                :searchable="true"
                :internal-search="false"
                :show-labels="false"
                :allow-empty="false"
                label="name"
                track-by="subjectId"
                :options="subjects"
                :loading="isLoading"
                :options-limit="300"
                :limit="3"
                :limit-text="limitText"
                :max-height="600"
                :value="subject.subjectId"
                @select="selectSubject"
              >
                <template slot="singleLabel" slot-scope="props">
                  {{ getSubjectById(props.option).name }}
                  (#{{ getSubjectById(props.option).subjectId }})
                </template>
                <template
                  slot="option"
                  slot-scope="props"
                >{{ props.option.name }} (#{{ props.option.subjectId }})</template>
              </multiselect>
            </div>
            <div class="subject__replacement">
              <p>Предмет замены</p>
              <div class="replacement">
                <button
                  v-if="!subject.replacement"
                  class="button"
                  @click="$set(subject, 'replacement', {})"
                >Создать замену</button>
                <button
                  v-else
                  class="button"
                  @click="$delete(subject, 'replacement')"
                >Удалить замену</button>
                <input
                  v-if="subject.replacement && subject.replacement.teacher !== null"
                  v-model="subject.replacement.teacher"
                  type="text"
                />
                <button
                  v-if="subject.replacement && !subject.replacement.teacher"
                  class="button"
                  @click="$set(subject.replacement, 'teacher', '')"
                >Замена учителя</button>
                <input
                  v-if="subject.replacement && subject.replacement.teacher !== null"
                  v-model="subject.replacement.location"
                  type="text"
                />
                <button
                  v-if="subject.replacement && !subject.replacement.location"
                  class="button"
                  @click="$set(subject.replacement, 'location', '')"
                >Замена кабинета</button>
                <multiselect
                  v-if="subject.replacement"
                  :id="index"
                  :searchable="true"
                  :internal-search="false"
                  :show-labels="false"
                  :allow-empty="false"
                  label="name"
                  track-by="subjectId"
                  :options="subjects"
                  :loading="isLoading"
                  :options-limit="300"
                  :limit="3"
                  :limit-text="limitText"
                  :max-height="600"
                  :value="subject.replacement.subjectId"
                  @select="selectReplacementSubject"
                >
                  <template slot="singleLabel" slot-scope="props">
                    {{ getSubjectById(props.option).name }}
                    (#{{ getSubjectById(props.option).subjectId }})
                  </template>
                  <template
                    slot="option"
                    slot-scope="props"
                  >{{ props.option.name }} (#{{ props.option.subjectId }})</template>
                </multiselect>
              </div>
            </div>
            <div class="subject__bell">
              <p>Время звонка на урок</p>
              <multiselect
                :id="index"
                :searchable="true"
                :internal-search="false"
                :show-labels="false"
                :allow-empty="false"
                label="starts"
                track-by="bellId"
                :options="bells"
                :loading="isLoading"
                :options-limit="300"
                :limit="3"
                :limit-text="limitText"
                :max-height="600"
                :value="subject.bellId"
                @select="selectBell"
              >
                <template slot="singleLabel" slot-scope="props">
                  Начало в {{ getBellById(props.option).starts }}
                  (#{{ getBellById(props.option).bellId }})
                </template>
                <template slot="option" slot-scope="props">
                  Начало в {{ props.option.starts }}
                  (#{{ props.option.bellId }})
                </template>
              </multiselect>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="button button__w-full" @click="sendData">Сохранить</button>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import DatePicker from "vue2-datepicker";
import 'vue2-datepicker/locale/ru';

export default {
  components: {
    Multiselect,
    DatePicker,
  },
  data() {
    return {
      isLoading: false,
      bells: null,
      subjects: null,
      schedule: {
        weekDate: null,
        days: {
          1: {
            subjects: []
          },
          2: {
            subjects: []
          },
          3: {
            subjects: []
          },
          4: {
            subjects: []
          },
          5: {
            subjects: []
          },
          6: {
            subjects: []
          },
          7: {
            subjects: []
          },
        }
      },
      days: {
        selectedDay: 1,
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
      errors: {},
    }
  },
  async fetch() {
    this.subjects = (await this.$axios.$get(`${process.env.baseUrl}/v1/diary/subjects?sortBy=subjectId%3Aasc&limit=9999`)).results
    this.bells = (await this.$axios.$get(`${process.env.baseUrl}/v1/diary/bells?sortBy=bellId%3Aasc&limit=9999`)).results
    this.schedule = await this.$axios.$get(`${process.env.baseUrl}/v1/diary/schedules/${this.$route.params.id}`);
  },
  computed: {
    isSaved() {
      return localStorage.getItem('diary_schedule');
    }
  },
  mounted() {
    this.schedule.weekDate = this.$moment().startOf('isoWeek').format('DD-MM-YYYY');
  },
  methods: {
    save() {
      localStorage.setItem('diary_schedule', JSON.stringify(this.schedule))
      this.$toasted.show(`Расписание было сохранено в локальном хранилище`, { type: 'success' });
    },
    apply() {
      this.schedule = JSON.parse(localStorage.getItem('diary_schedule'))
    },
    sortSubjects() {
      this.schedule.days[this.days.selectedDay].subjects.sort((currSubject, nextSubject) => {
        if (!currSubject.bell) return 0;
        if (!nextSubject.bell) return 0;

        const currentBellTime = currSubject.bell.starts.split(':');
        const nextBellTime = nextSubject.bell.starts.split(':');

        if (currentBellTime[0] < nextBellTime[0]) return -1;
        if (currentBellTime[0] > nextBellTime[0]) return 1;

        if (currentBellTime[1] < nextBellTime[1]) return -1;
        if (currentBellTime[1] > nextBellTime[1]) return 1;

        return 0;
      });
    },
    limitText(count) {
      return `и еще ${count} других`
    },
    addSubject() {
      this.schedule.days[this.days.selectedDay].subjects.push({
        subjectId: null,
        bellId: null,
      })
    },
    removeSubject(index) {
      if (index > -1) {
        this.schedule.days[this.days.selectedDay].subjects.splice(index, 1);
      }
    },
    selectSubject(value, id) {
      this.schedule.days[this.days.selectedDay].subjects[id].subjectId = value.subjectId
    },

    selectBell(value, id) {
      this.schedule.days[this.days.selectedDay].subjects[id].bellId = value.bellId
      this.sortSubjects();
    },
    selectReplacementSubject(value, id) {
      if (!this.schedule.days[this.days.selectedDay].subjects[id].replacement) {
        this.schedule.days[this.days.selectedDay].subjects[id].replacement = {}
      }
      this.$set(this.schedule.days[this.days.selectedDay].subjects[id].replacement, 'subjectId', value.subjectId)
    },
    getSubjectById(id) {
      if (!this.subjects) return null;
      return this.subjects.find(item => item.subjectId === id)
    },
    getBellById(id) {
      if (!this.bells) return null;
      return this.bells.find(item => item.bellId === id)
    },
    moveSubject(fromIndex, toIndex) {
      const element = this.schedule.days[this.days.selectedDay].subjects[fromIndex];
      this.schedule.days[this.days.selectedDay].subjects.splice(fromIndex, 1);
      this.schedule.days[this.days.selectedDay].subjects.splice(toIndex, 0, element);
    },
    notWeekStart(date) {
      return this.$moment(date, 'DD-MM-YYYY').startOf('isoWeek').format('DD-MM-YYYY') !== this.$moment(date, 'DD-MM-YYYY').format('DD-MM-YYYY');
    },
    sendData() {
      this.isLoading = true;
      const schedulePatchBody = Object.assign({}, this.schedule, { scheduleId: undefined });
      this.$axios.$patch(`${process.env.baseUrl}/v1/diary/schedules/${this.$route.params.id}`, schedulePatchBody).then((res) => {
        this.$router.push({ path: '/management/schedules' });
        this.$toasted.show(`Звонок #${res.scheduleId} успешно создан`, { type: 'success' });
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

  .schedule-edit {
    @apply flex flex-col gap-4;
    .schedule-edit__tabs {
      @apply flex flex-row gap-2;
      button {
        @apply bg-background-100/20 w-full p-2;
        &.active {
          @apply bg-background-100/30;
        }
      }
    }
    .schedule-edit__content {
      @apply flex flex-col flex-wrap my-4 text-gray-100/90 gap-4 justify-center md:flex-row;
      .schedule-edit__subject {
        @apply flex flex-col bg-background-100/30 w-full p-4 gap-4 md:w-3/12;
        .schedule-edit__controls {
          @apply flex flex-row gap-2;
          button {
            @apply w-full;
          }
        }
        .schedule-edit__fields {
          @apply flex flex-col bg-background-300/80 p-4 gap-2;
        }
      }
    }
  }
}
</style>
