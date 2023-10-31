<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import mixin from "../mixin";
import { mapState } from 'vuex';


export default {
  mixins:[mixin],
  components: {
    FullCalendar
  },
  props: {
    project: Object,
    todoList: Array
  },
  data () {
    return {
      todoListforCal: [],
      // todoListforCal: this.todoList,
      showModal: false,
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek'
        },
        initialView: 'dayGridMonth',
        events: this.todoList, // calendar에 뿌려줄 배열
        editable: false, // 일정 드래그 방지
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: null,
        eventClick: this.handleEventClick,
        eventsSet: this.setTodoList,
      },
    }
  },
  watch: {
    todoList: {
      handler(newTodoList) {
        if (newTodoList) {
          this.resetCalendar(newTodoList);
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(['selectedProject']),
  },
  methods: {
    
    handleEventClick(clickInfo) {
      // if (confirm(`'${clickInfo.event.title}' 일정을 삭제하시겠습니까?`)) {
      //   clickInfo.event.remove();
      // }
      this.$emit('event-clicked', clickInfo.event);
    },
    closeModal() {
      this.showModal = false;
    },
    openModal() {
      this.showModal = true;
    },
    async resetCalendar(todos) {
      var eventColors = null;
      console.log(eventColors)
      var memberNum = this.$store.state.selectedProject.member_num;
      var num = null;
      this.todoListforCal = todos.map((element) => {
        const startDate = new Date(element.start_date);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + 1);

        const endDate = new Date(element.due_date);
        endDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 1);
        num = element.member_num;
        if (num !== memberNum) {
          eventColors = '#8fdf82';
        } else {
          eventColors = '#7ba16c1a';
        }
        return {
          id: element.todo_num,
          title: element.todo_title,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          member_name: element.member_name,
          content: element.content,
          member_num: element.member_num,
          backgroundColor: eventColors,
        };
      });

      await this.$nextTick();
      const calendarApi = this.$refs.cal.getApi();
      calendarApi.removeAllEvents();
      this.todoListforCal.forEach(event => {
        calendarApi.addEvent(event)
      });
    },
    
  }
}
</script>

<template>
  <div class='app'>
    <div class='app-main'>
      <FullCalendar class='app-calendar'
        :options='calendarOptions'
        ref="cal"
      >
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <span>{{ arg.event.title }}</span>
        </template>
      </FullCalendar>
    </div> 
  </div>
</template>

<style>
  @import '../assets/css/calendar.css';
</style>