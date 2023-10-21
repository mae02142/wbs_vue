<template>
  <aside>
    <nav id="sideBar">
        <div class="create-project">
            <span>전체 프로젝트</span>
            <img src="../assets/icon/add_btn.png" @click="openModal">
            <CreateProjectModal :visible="showModal" @close="closeModal" @confirm="addTask" @projectCreated="handleProjectCreated"
            :projectData="selectedProject"></CreateProjectModal>
        </div>
          <div>
            <div class="project-list">
              <span>목록보기</span>
              <img v-if="!showProjects" @click="toggleProjects" src="../assets/icon/down.png">
              <img v-else @click="toggleProjects" src="../assets/icon/up.png">
            </div>
            <div>
              <ul v-if="showProjects">                                                                                                   
              <li v-for="project in projects" :key="project.project_num">
                <span class="project-title" @click="selectProject(project)">{{ project.project_title }}</span>
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
  components:{CreateProjectModal},

  data() {
    return {
      showModal: false,
      showProjects: false,
      member_num:''
    };
  },
  mounted(){
    this.renderProjectList();
  },
  computed:{
    ...mapState(['projectList', 'selectedProject']),
    projects() {
    return this.projectList;
  }
  },
  methods: {
    forTest(temp){
      console.log("key : " + temp);
      this.key = temp;
    },
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
  async renderProjectList(){
    try {
      const response = await axios.get("http://localhost:8030/api/projectList?t_key="+this.key);
          this.$store.dispatch('updateProjectsData', response.data);
    } catch (error) {
      console.log(error);
    }
  },
  selectProject(project) {
    this.$store.commit('setSelectedProject', project);
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
