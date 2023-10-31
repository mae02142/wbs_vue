<template>
  <aside>
    <nav id="sideBar">
        <div class="create-project">
          <span><img src="../assets/icon/icon-slash.png" style="width:7px; height:12px;">&nbsp;&nbsp;프로젝트 추가&nbsp;</span>
            <img class="project-img" src="../assets/icon/icon-plus.png" @click="openModal">
            <CreateProjectModal :visible="showModal" @close="closeModal" @projectCreated="handleProjectCreated"
            :projectData="selectedProject"></CreateProjectModal>
        </div>
          <div>
            <div class="project-list">
              <span><img src="../assets/icon/icon-slash.png" style="width:7px; height:12px;">&nbsp;&nbsp;목록 보기&nbsp;</span>
              <img v-if="showProjects" @click="toggleProjects" class="down-img" src="../assets/icon/icon-down.png">
              <img v-else @click="toggleProjects" class="down-img" src="../assets/icon/icon-up.png">
            </div>
            <div>
              <ul v-if="!showProjects">                                                                                                   
                <li v-for="(project, index) in projectList" :key="project.project_num">
                <span class="project-title" @click="selectProject(project, index)" 
                :class="{ 'active': activeProjectIndex === index }">
                {{ project.project_title }}
                  <span class="project-status"
                  :style="{ 'color': project.status === 'done' ? '#ff00008f' : (project.status === 'todo' ? '#800080ab' : '#0080008c') }"
                  >{{ project.status }}</span>
                </span>
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
import { mapState } from "vuex";

export default {
  name: 'SideBar',
  mixins:[mixin],
  inject: ["eventBus"],
  components:{CreateProjectModal},
  data() {
    return {
      projectNum: null,
      showModal: false,
      showProjects: false,
      activeProjectIndex: -1,
    };
  },
  mounted(){
    this.eventBus.on('moveCreateProject', this.openModal);
    this.getProjectList();
  },
  beforeUnmount() {
    this.eventBus.off('moveCreateProject', this.openModal);
  },
  computed:{
    ...mapState(['projectList', 'selectedProject']),
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
      this.$store.dispatch('updateProjectsData', [...this.projectList, newProject]);
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
        var dataList = response.data;
        var today = new Date();
        dataList.forEach(element => {
          const startDate = new Date(element.start_date);
          startDate.setHours(0, 0, 0, 0);
          startDate.setDate(startDate.getDate() + 1);

          const endDate = new Date(element.due_date);
          endDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() + 1);

          if (today > endDate) {
            element.status = 'done'
          }
          else if (today < startDate) {
            element.status = 'todo'
          }
          else {
            element.status = 'ing'
          }
          // console.log(element.project_title, " status : ", this.activeStatus);
        });
        this.$store.dispatch('updateProjectsData', dataList);
      } catch (error) {
        console.log("Failed to Get Project List >>>>", error);
      }
    },
    selectProject(project, index) {
    if (this.selectedProject.project_num !== project.project_num) {
      
      this.$store.commit('setSelectedProject', project);
      }
      this.updateActiveProjectIndex(index);
    },
    
    updateActiveProjectIndex(index) {
      this.activeProjectIndex = this.activeProjectIndex === index ? -1 : index;
    },
  }
}
</script>

<style scoped>
@import url("../assets/css/sidebar.css");

</style>
