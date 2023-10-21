<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import axios from 'axios';
import CreateProjectModal from "./CreateProjectModal.vue";
import mixin from "../mixin";

export default {
  mixins:[mixin],

  components: {
    FullCalendar,
    CreateProjectModal,
  },

  data () {
    return {      
      showModal: false,
      selectedProject: [], // 선택된 프로젝트
      projects: [], // db에서 가져온 project list를 가공해서 저장할 배열
      todos: [], // db - todo list
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
        events: [], // calendar에 뿌려줄 배열
        editable: false, // 일정 드래그 방지
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.setTodos,
      },
    }
  },

  mounted() {},

  methods: {
    getTodo(value){
      this.key = value;
    },

    setTodos() {
      console.log('selected Todo >>>>>>>', this.$store.state.todoList)
      this.todos = this.$store.state.todoList;
      this.calendarOptions.events = this.todos;
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
    handleProjectCreated(newProject) {
      this.projects.push(newProject);
    },
  },
}
</script>

<template>
  <div class='app'>
    <div class='app-main'>
      <FullCalendar
        class='app-calendar'
        :options='calendarOptions'
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
  @import '../css/calendar.css';
</style>