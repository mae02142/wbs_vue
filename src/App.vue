<template>
  <div class="tl-container">
        <div>
          <SideBar @projectSelected="getTodoList" @createProjectClicked="handleCreateProject"></SideBar>
        </div>
        <div>
          <div v-if="!selectedProject || !selectedProject.project_num" id="pm-notice-top">
            <div class="pm-notice">
              <div class="project-title"> 프로젝트를 생성하거나 선택해주세요.</div>
              <button class="project-btn"  @click="moveCreateProject"> 
                프로젝트 추가하기<img class="project-image" src="./assets/icon/icon-plus.png">
              </button>  
            </div> 
          </div>
        </div>
        <div v-show="selectedProject && selectedProject.project_num">
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
      </div>
</template>

<script>
import SideBar from './components/SideBar';
import GanttConfig from "./components/GanttConfig.vue";
import FullCalendar from "./components/FullCalendar.vue";
import CheckAndModifyModal from "./components/CheckAndModifyModal.vue";
import axios from "axios";
import mixin from "./mixin";
import "vue-toastification/dist/index.css";
import { inject } from 'vue';
import { mapState } from 'vuex';
import { useToast } from 'vue-toastification';

export default {
  components: { SideBar, GanttConfig, FullCalendar, CheckAndModifyModal },
  mixins:[mixin],
  inject: ["eventBus"],
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
  mounted(){
    this.eventBus.on('toast-event', (param) => {
      this.showToast(param);
    })
  },
  setup() {
    const toast = useToast();
    const eventBus = inject('eventBus');

    const moveCreateProject = () => {
      eventBus.emit('moveCreateProject');
    };
    return { toast, moveCreateProject };
  },

  methods: {
    // type 1 : info
    // type 2 : error
    // type 3 : success
    // type 4 : warning
    showToast(param) {
      var option = {
        class: "toasting",
        position: "top-center",
        timeout: 1000,
        hideProgressBar: true,
        pauseOnFocusLoss: false
    };

      switch(param['type']){
        case 1:
          this.toast.info(param['text'],option);
          break;
        case 2:
          this.toast.error(param['text'],option);
          break;
        case 3:
          this.toast.success(param['text'],option);
          break;
        case 4:
          this.toast.warning(param['text'],option);
          break;
      }

    //   this.toast("Hi from LogRocket", {
    //   position: "top-right",
    //   timeout: 5000,
    //   closeOnClick: true,
    //   pauseOnFocusLoss: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   draggablePercent: 0.6,
    //   showCloseButtonOnHover: false,
    //   hideProgressBar: true,
    //   closeButton: "button",
    //   icon: "fas fa-rocket",
    //   rtl: false
    //  });
    },
    async getTodoList(project) {
      try {
        const response = await axios.post("http://localhost:8030/api/getAllTodoList", 
        {
          project_num:project.project_num,
          t_key: this.key,
        });
        this.todoList = response.data;
      } catch (error) {
        console.error("Failed to Get Todo List", error);
      }
    },
    viewTimeline() {
      if (this.selectedProject && this.selectedProject.project_num) {
        this.isTimeLine = true;
        this.isCalendar = false;
      } else {
        this.showToast({'type':2,'text':'프로젝트를 선택하세요'})
      }
    },
  
    viewCalendar() {
      if (this.selectedProject && this.selectedProject.project_num) {
        this.isCalendar = true;
        this.isTimeLine = false;
      } else {
        this.showToast({'type':2,'text':'프로젝트를 선택하세요'})
      }
    },

    viewAll() {
      if (this.selectedProject && this.selectedProject.project_num) {
        this.isHide = true;
      } else {
        this.showToast({'type':2,'text':'프로젝트를 선택하세요'})
      }
    },
    openProjectSettingModal(){
      if (this.selectedProject && this.selectedProject.project_num) {
      this.showProjectSettingModal=true;
    } else {
      this.showToast({'type':2,'text':'프로젝트를 선택하세요'})
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
    margin: 11px 6px 0px 35px;
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
    color: #000000bf;
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
  margin-left: 32px;
  font-size: 11px;
  padding: 5px 18px;
  color: #090c07bf;
  letter-spacing: 2px;
  border: 2px dotted #c9bcbc9c;
  border-radius: 20px;
}
#pm-notice-top{
  padding-top: 160px;
}

.pm-notice{
    padding: 50px 61px 50px 50px;
    border: 1px solid #1a432229;
    border-radius: 10px;
    text-align: center;
    max-width: 420px;
    margin: 0 auto;
    font-size: 13px;
    letter-spacing: 2px;
    background-color: #ffffff21;
    box-shadow: 0 0 10px rgba(0,0,0,.19);
    color: #4a4343;
    font-weight: bolder;
}

.project-title{
  margin: 7px 0 7px 22px;
}
.project-image {
  width: 20px;
  height: 20px;
}

.project-btn {
  border-radius: 40px;
  border: 2px solid #80808012;
  padding: 7px 19px 11px 24px;
  font-size: 11px;
  letter-spacing: 1px;
  background: #7ba16c1a;
  margin: 11px 6px 0px 15px;
  color: #193616eb;
  font-weight: 600;
  cursor: pointer;
}

.Vue-Toastification__container {
    z-index: 10004 !important;
    position: fixed;
    padding: 4px;
    width: 600px;
    box-sizing: border-box;
    display: flex;
    min-height: 100%;
    color: #fff;
    flex-direction: column;
    pointer-events: none;
}

.Vue-Toastification__toast-body {
    flex: 1;
    line-height: 24px;
    font-size: 12px !important;
    word-break: break-word;
    white-space: pre-wrap;
    letter-spacing: 1px !important;
}

.Vue-Toastification__toast {
    display: inline-flex;
    position: relative;
    max-height: 800px;
    min-height: 64px;
    box-sizing: border-box;
    margin-bottom: 1rem;
    padding: 32px 34px;
    border-radius: 40px;
    box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.1), 0 2px 15px 0 rgba(0, 0, 0, 0.05);
    justify-content: space-between;
    font-family: "Lato", Helvetica, "Roboto", Arial, sans-serif;
    max-width: 604px;
    min-width: 332px;
    pointer-events: auto;
    overflow: hidden;
    transform: translateZ(0);
    direction: ltr;
}

.Vue-Toastification__container.top-center 
.Vue-Toastification__toast, .Vue-Toastification__container.bottom-center .Vue-Toastification__toast {
    margin-left: auto;
    margin-right: auto;
    margin-top: 270px;
    margin-bottom: 100px;
}

.Vue-Toastification__toast--error {
    background-color: #6aaa63f7;
    color: #f9ff11;
}

.Vue-Toastification__toast--success {
    background-color: #87a971;
    color: #fffc11;
}

.Vue-Toastification__toast--warning {
    background-color: #87a971cf;
    color: #ffffff;
}

.Vue-Toastification__close-button {
    font-weight: bold;
    font-size: 28px !important;
    line-height: 24px;
    background: #ffffff00;
    outline: none;
    border: none;
    padding: 0;
    padding-left: 10px;
    cursor: pointer;
    transition: 0.3s ease;
    align-items: center;
    color: #fff6f6;
    opacity: 0.8;
    transition: visibility 0s, opacity 0.2s linear;
}


</style>
