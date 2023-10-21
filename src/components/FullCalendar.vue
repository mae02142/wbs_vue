<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import CreateProjectModal from "./CreateProjectModal.vue";
import mixin from "../mixin";

export default {
  mixins:[mixin],
  components: {
    FullCalendar,
    CreateProjectModal,
  },
  inject: ["eventBus"],
  props: {
    todoList: [],
  },
  data () {
    return {      
      // todoList: [], // db - todo list
      //localTodoList: {...this.todoList},
      showModal: false,
      isShow: true,
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
  mounted() {
    document.test = this.$refs.cal;
    this.eventBus.on('resetCalendar',this.test);
  },
  methods: {
    setTodoList() {
      console.log('Calendar Todo >>>>>>>', this.todoList)
      // this.calendarOptions.events = [];
      // this.calendarOptions.events = this.todoList;
    },

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
      if (confirm(`'${clickInfo.event.title}' 일정을 삭제하시겠습니까?`)) {
        clickInfo.event.remove()
      }
    },
    closeModal() {
      this.showModal = false;
    },
    openModal() {
      this.showModal = true;
    },
    test(value){
      this.$refs.cal.getApi().pauseRendering();
      this.$refs.cal.getApi().destroy();
      this.calendarOptions.events = value;
      this.$refs.cal.buildOptions(this.calendarOptions);
      this.$refs.cal.getApi().render();
    }
  },
}
</script>

<template>
  <div class='app'>
    <div class='app-main'>
      <button @click="test">test</button>
      <FullCalendar
        v-if="isShow"
        class='app-calendar'
        :options='calendarOptions'
        ref="cal"
      >
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <span>{{ arg.event.title }}</span>
        </template>
      </FullCalendar>

      <CreateProjectModal :visible="showModal" 
      @close="closeModal" @confirm="addTask" 
      @projectCreated="handleProjectCreated"
      :projectData="selectedProject"></CreateProjectModal>
    </div> 
  </div>
</template>

<style>
  @import '../assets/css/calendar.css';
</style>