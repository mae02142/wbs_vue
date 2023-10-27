<template>
  <div class="tl-container">
      <SideBar @projectSelected="getTodoList"></SideBar>
        <div class="tab">
            <button class="tab-btn1" @click="viewTimeline()">Time Line</button>
            <button class="tab-btn2" @click="viewCalendar()">Calendar</button>
            <span class="tab-detail-btn" @click="openProjectSettingModal">상세보기</span>
            <span v-if="selectedProject && selectedProject.start_date && selectedProject.due_date"
            class="p-period">프로젝트 기간 : {{ selectedProject.start_date}} ~ {{selectedProject.due_date }}</span>
              <CheckAndModifyModal :project="selectedProject" :visible="showProjectSettingModal"
              @close="closeProjectSettingModal">
            </CheckAndModifyModal>
        </div>
        <div>
            <GanttConfig v-if="isTimeLine && selectedProject" :project="selectedProject" :todoList="todoList"
            @task-changed="getTodoList(selectedProject)">
            </GanttConfig>
            <div class="cal">
              <FullCalendar v-if="isCalendar && selectedProject" :project="selectedProject" :todoList="todoList"
              @event-clicked="handleEventClicked">
              </FullCalendar>
            </div>
        </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar';
import GanttConfig from "./components/GanttConfig.vue";
import FullCalendar from "./components/FullCalendar.vue";
import CheckAndModifyModal from "./components/CheckAndModifyModal.vue";
import axios from "axios";
import mixin from "./mixin";
import { mapState } from "vuex";


export default {
  components: { SideBar, GanttConfig, FullCalendar, CheckAndModifyModal},
  mixins:[mixin],
  data() {
    return {
      todoList: [],
      isTimeLine: true,
      isCalendar: false,
      showProjectSettingModal:false,
    };
  },
  computed: {
    ...mapState(['selectedProject']),
  },
  watch: {
    selectedProject: {
      async handler(newProject) {
        if (newProject && newProject.project_num) {
          await this.getTodoList(newProject);
        }
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    async getTodoList(project) {
      try {
        const response = await axios.post("http://localhost:8030/api/getAllTodoList", 
        {
          project_num:project.project_num,
          t_key: this.key,
        });
        this.todoList = response.data;
        console.log("캘린더로 보낼!!", this.todoList);
      } catch (error) {
        console.error("Failed to Get Todo List", error);
      }
    },

    viewTimeline() {
    if (this.selectedProject && this.selectedProject.project_num) {
      this.isTimeLine = true;
      this.isCalendar = false;
    } else {
      alert('먼저 프로젝트를 선택해주세요.');
    }
  },
  
  viewCalendar() {
    if (this.selectedProject && this.selectedProject.project_num) {
      this.isCalendar = true;
      this.isTimeLine = false;
    } else {
      alert('먼저 프로젝트를 선택해주세요.');
    }
  },
    openProjectSettingModal(){
      if (this.selectedProject && this.selectedProject.project_num) {
      this.showProjectSettingModal=true;
    } else {
      alert('먼저 프로젝트를 선택해주세요.');
    }
    },
    closeProjectSettingModal(){
      this.showProjectSettingModal=false;
    },
    handleEventClicked() {
      this.viewTimeline();
    }
  }
}
</script>


<style>
.tl-container{
    margin-top: 65px;
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

.cal{
  min-width: 1000px;
}

.p-period{
  margin-left: 5px;
  font-size: small;
  padding: 6px 18px;
  color: #090c0787;
}

</style>
