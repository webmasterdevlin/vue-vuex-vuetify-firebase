<template>
  <section>
    <v-row class="fill-height">
      <v-col>
        <v-sheet height="64">
          <v-toolbar flat color="white">
            <v-btn color="primary" dark class="mr-4" @click="dialog = true">
              New Event
            </v-btn>
            <v-btn outlined class="mr-4" @click="setToday">
              Today
            </v-btn>
            <v-btn fab text small @click="prev">
              <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small @click="next" class="mr-4">
              <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom right>
              <template v-slot:activator="{ on }">
                <v-btn outlined v-on="on">
                  <span>{{ typeToLabel[type] }}</span>
                  <v-icon right>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'day'">
                  <v-list-item-title>Day</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                  <v-list-item-title>Week</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                  <v-list-item-title>Month</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = '4day'">
                  <v-list-item-title>4 days</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>
        </v-sheet>
        <v-dialog v-model="dialog" max-width="500">
          <v-card>
            <v-container>
              <v-form @submit.prevent="addEvent">
                <v-text-field
                  v-model="name"
                  type="text"
                  label="event name (required)"
                ></v-text-field>
                <v-text-field
                  v-model="details"
                  type="text"
                  label="detail"
                ></v-text-field>
                <v-text-field
                  v-model="start"
                  type="date"
                  label="start (required)"
                ></v-text-field>
                <v-text-field
                  v-model="end"
                  type="date"
                  label="end (required)"
                ></v-text-field>
                <v-text-field
                  v-model="color"
                  type="color"
                  label="color (click top open color menu)"
                ></v-text-field>
                <v-btn type="button" class="mr-4" v-if="isLoading" disabled>
                  Sending...
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  class="mr-4"
                  @click.stop="dialog = false"
                  v-else
                >
                  Create Event
                </v-btn>
              </v-form>
            </v-container>
          </v-card>
        </v-dialog>

        <v-sheet height="600">
          <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :event-margin-bottom="3"
            :now="today"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRange"
          ></v-calendar>
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card color="grey lighten-4" min-width="350px" flat>
              <v-toolbar :color="selectedEvent.color" dark>
                <v-btn @click="removeEvent(selectedEvent)" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-toolbar-title
                  v-if="currentlyEditing !== selectedEvent.id"
                  v-html="selectedEvent.name"
                ></v-toolbar-title>
                <form v-else>
                  <input
                    v-model="selectedEvent.name"
                    type="text"
                    style="width:100%"
                    placeholder="add name"
                  />
                </form>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <form v-if="currentlyEditing !== selectedEvent.id">
                  {{ selectedEvent.details }}
                </form>
                <form v-else>
                  <textarea-autosize
                    v-model="selectedEvent.details"
                    type="text"
                    style="width:100%"
                    placeholder="add note"
                  >
                  </textarea-autosize>
                </form>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="secondary" @click="close">
                  Close
                </v-btn>
                <v-btn
                  text
                  v-if="currentlyEditing !== selectedEvent.id"
                  @click.prevent="editEvent(selectedEvent)"
                >
                  Edit
                </v-btn>
                <v-btn text v-else @click.prevent="updateEvent(selectedEvent)">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
    <h2 v-if="isLoading" class="center">Loading..</h2>
    <h2 v-else class="center">Total number of events: {{ totalEvents }}</h2>
  </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import * as types from "../store/types";

export default {
  name: "Calendar",
  data: () => {
    return {
      today: new Date().toISOString().substr(0, 10),
      focus: new Date().toISOString().substr(0, 10),
      type: "month",
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day",
        "4day": "4 Days"
      },
      name: null,
      details: null,
      start: null,
      end: null,
      color: "#1976D2",
      currentlyEditing: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      dialog: false
    };
  },
  computed: {
    ...mapGetters({
      events: types.GETTERS_INIT_EVENTS,
      totalEvents: types.GETTERS_TOTAL_EVENTS,
      isLoading: types.GETTERS_ISLOADING_EVENT
    }),
    title() {
      const { start, end } = this;
      if (!start || !end) return "";

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  methods: {
    ...mapActions({
      initEvents: types.ACTION_GET_EVENTS,
      postEvent: types.ACTION_ADD_EVENT,
      deleteEvent: types.ACTION_REMOVE_EVENT,
      putEvent: types.ACTION_UPDATE_EVENT
    }),
    addEvent() {
      if (this.name && this.start && this.end) {
        this.postEvent({
          name: this.name,
          details: this.details,
          start: this.start,
          end: this.end,
          color: this.color
        });
        this.initEvents();
        this.name = "";
        this.details = "";
        this.start = "";
        this.end = "";
        this.color = "#1976D2";
      } else {
        alert("Name, start, and end date are required");
      }
    },
    removeEvent(event) {
      this.deleteEvent(event);
      this.selectedOpen = false;
    },
    updateEvent(event) {
      this.putEvent(event);
      this.selectedOpen = false;
      this.currentlyEditing = null;
    },
    editEvent(event) {
      this.currentlyEditing = event.id;
    },
    close() {
      this.selectedOpen = false;
      this.currentlyEditing = null;
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    }
  },
  beforeMount() {
    this.initEvents();
  },
  mounted() {}
};
</script>

<style scoped>
.center {
  display: flex;
  place-content: center;
  place-items: center;
}
</style>
