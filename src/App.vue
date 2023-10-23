<template>
  <div class="tl-container">
    <SideBar @projectSelected="handleProjectSelected"></SideBar>
    <div class="tab">
      <button @click="viewTimeline()">Time Line</button>
      <button @click="viewCalendar()">Calendar</button>
      <span @click="openProjectSettingModal">상세보기</span>
        <CheckAndModifyModal :project="selectedProject" :visible="showProjectSettingModal"
        @close="closeProjectSettingModal"></CheckAndModifyModal>
    </div>
    <GanttContainer v-if="isTimeLine"
      :todoList="todoTimeLine" :project="selectedProject">
    </GanttContainer>
    <FullCalendar v-if="isCalendar"
      :todoList="todoCalendar">
    </FullCalendar>
  </div>
</template>

<script>
import SideBar from './components/SideBar';
import GanttContainer from "./components/GanttContainer.vue";
import FullCalendar from "./components/FullCalendar.vue";
import CheckAndModifyModal from "./components/CheckAndModifyModal.vue";
import axios from "axios";
import mixin from "./mixin";


export default {
  components: { SideBar, GanttContainer, FullCalendar, CheckAndModifyModal},
  inject: ["eventBus"],
  mixins:[mixin],
  data() {
    return {
      todoList: [],
      isTimeLine: true,
      isCalendar: false,
      showProjectSettingModal:false,
      selectedProject:{}
    };
  },
  mounted() {
    this.eventBus.on('getTodoList',(project)=>{
      this.getTodoList(project);
    })
  },
  beforeUnmount() {
    this.eventBus.off('getTodoList');
  },
  methods: {
    getTodoList(project) {
      this.selectedProject=project;
      axios.post("http://localhost:8030/api/getAllTodoList", {
        project_num: project.project_num,
        t_key: this.key
      })
      .then(response => {
        this.todoList = response.data;
        console.log("Get Todo data >>>>", this.todoList);
        this.eventBus.emit('todoCalendar',this.todoList); // todoCalendar라는 event 발생 시 todoList 전달
        //!!!
      })
      .catch (error => {
        console.log("Failed to Get Todo List >>>>", error);
      })

      this.eventBus.emit('resetCalendar',this.todoCalendar);
    },
    viewTimeline() {
      if (!this.isTimeLine) {
        this.isTimeLine = !this.isTimeLine;
        this.isCalendar = false;
      }
      
    },
    viewCalendar() {
      if (!this.isCalendar) {
        this.isCalendar = !this.isCalendar;
        this.isTimeLine = false;
      }
    },
    openProjectSettingModal(){
    this.showProjectSettingModal=true;
    },
    closeProjectSettingModal(){
      this.showProjectSettingModal=false;
    }
  }
}
</script>


<style>
.tl-container{
  margin-top:88px;
}



</style>
