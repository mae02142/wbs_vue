<template>
  <div class="tl-container">
    <SideBar @projectSelected="handleProjectSelected"></SideBar>
    <div class="tab">
      <button class="tab-btn1" @click="viewTimeline()">Time Line</button>
      <button class="tab-btn2" @click="viewCalendar()">Calendar</button>
      <span class="tab-detail-btn" @click="openProjectSettingModal">상세보기</span>
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
      // selectedProject:{}
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
  computed: {
  selectedProject() {
    return this.$store.state.selectedProject;
    }
  },
  methods: {
    getTodoList(project) {
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

.tab-btn1{
    border-radius: 40px;
    border: 2px solid #80808012;
    padding: 8px 20px;
    font-size: 11px;
    letter-spacing: 2px;
    background: #7ba16c1a;
    margin: 11px 6px 0px 15px;
    color: #193616eb;
    font-weight: 600;
}

.tab-btn2{
  border-radius: 40px;
    border: 2px solid #80808012;
    padding: 8px 20px;
    font-size: 11px;
    letter-spacing: 3px;
    background: #7ba16c1a;
    margin: 11px 6px 0px 3px;
    color: #193616eb;
    font-weight: 600;
}

.tab-detail-btn {
    border-radius: 40px;
    border: 2px solid #80808017;
    padding: 7px 29px;
    font-size: 11px;
    letter-spacing: 2px;
    background: #eaefe705;
    margin-left: 5px;
    color: #36572887;
    font-weight: 600;
}

.tab-btn1:hover, .tab-btn2:hover {
    background: #eaefe705;
    border: 2px solid #376d33a6;
}

.tab-detail-btn:hover{
    background: #eaefe705;
    border: 2px solid #376d33a6;
    color: #1a4408b9;
}

</style>
