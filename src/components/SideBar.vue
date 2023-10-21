<template>
  <aside>
    <nav id="sideBar">
        <div class="create-project">
          <span> 〉&nbsp;전체 프로젝트&nbsp;</span>
            <img src="../assets/icon/add_btn.png" @click="openModal">
            <CreateProjectModal :visible="showModal" @close="closeModal" @confirm="addTask" @projectCreated="handleProjectCreated"
            :projectData="selectedProject"></CreateProjectModal>
        </div>
          <div>
            <div class="project-list">
              <span> 〉&nbsp;목록 보기&nbsp;</span>
              <img v-if="!showProjects" @click="toggleProjects" src="../assets/icon/down.png">
              <img v-else @click="toggleProjects" src="../assets/icon/up.png">
            </div>
            <div>
              <ul v-if="showProjects">                                                                                                   
                <li v-for="(project, index) in projects" :key="project.project_num">
                <span class="project-title" @click="selectProject(project), toggleProjectStyle(index)"
                :class="{ 'active': activeProjectIndex === index }">
                {{ project.project_title }}</span>
              </li>
              </ul>
            </div>
          </div>
    </nav>
  </aside>
</template>

<script>
import CreateProjectModal from "./CreateProjectModal.vue";
import axios from "axios";
import mixin from "../mixin";

export default {
  name: 'SideBar',
  mixins:[mixin],
  components:{CreateProjectModal},
  inject: ["eventBus"],
  data() {
    return {
      projectList: [],
      projectNum: null,
      showModal: false,
      showProjects: false,
      activeProjectIndex: -1,
      member_num:''
    };
  },
  mounted(){
    this.getProjectList();
  },
  methods: {
    toggleProjects() {
      this.showProjects = !this.showProjects;
    },
    closeModal() {
      this.showModal = false;
    },
    openModal() {
      this.showModal = true;
    },
    handleProjectCreated(newProject) {
    this.projects.push(newProject);
    this.member_num = newProject.member_num;
    },
    toggleProjectStyle(index) {
      //현재 활성화된 프로젝트의 인덱스를 업데이트
      if (this.activeProjectIndex === index) {
        this.activeProjectIndex = -1; //같은 프로젝트를 다시 클릭한 경우 해제
      } else {
        this.activeProjectIndex = index;
      }
    },
    async getProjectList(){
      try {
        const response = await axios.get("http://localhost:8030/api/projectList?t_key="+this.key);
        this.projectList = response.data;
        console.log("Get Projcet List >>>>>>>>", this.projectList)
      } catch (error) {
        console.log("Failed to Get Project List >>>>", error);
      }
    },
    selectProject(project) {
      if (!this.projectNum || this.projectNum !== project.project_num) {
        this.eventBus.emit('getTodoList', project);
        this.projectNum = project.project_num
      }
    }
  }
}
</script>

<style scoped>
@import url("../assets/css/sidebar.css");

.project-title:hover{
  cursor: pointer;
}

</style>
