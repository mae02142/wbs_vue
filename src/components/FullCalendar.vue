<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import mixin from "../mixin";


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
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        events: this.todoList, // calendar에 뿌려줄 배열
        editable: false, // 일정 드래그 방지
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.setTodoList
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
  methods: {

    handleDateSelect(selectInfo) {
      let title = prompt('일정 제목을 입력하세요')
      let calendarApi = selectInfo.view.calendar

      calendarApi.unselect() // clear date selection
      
      if (title) {
        calendarApi.addEvent({
          id: selectInfo.id,
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        })
      }
    },
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
     this.todoListforCal = todos.map((element) => {
    const startDate = new Date(element.start_date);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() + 1);

    const endDate = new Date(element.due_date);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);

    return {
      id: element.todo_num,
      title: element.todo_title,
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      member_name: element.member_name,
      content: element.content,
      member_num: element.member_num 
    };
  });

  await this.$nextTick();
  const calendarApi = this.$refs.cal.getApi();
  calendarApi.removeAllEvents();
  this.todoListforCal.forEach(event => calendarApi.addEvent(event));
}
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