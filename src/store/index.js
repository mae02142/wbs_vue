import { createStore } from 'vuex';


export default createStore({
  state: {
    projectList: [],
    selectedProject: {},
    loginMember: {}
  },
  getters: {
    formatDate: () => (dateString) => {
      const date = new Date(dateString);
      let month = '' + (date.getMonth() + 1);
      let day = '' + date.getDate();
      const year = date.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    }
  },
  mutations: {
    setProjectList(state, projects) {
      state.projectList = projects.map(project => {
        // 프로젝트의 특정 날짜 속성들을 변환 (예: 'startDate' 및 'dueDate')
        if (project.start_date) {
          project.start_date = this.getters.formatDate(project.start_date);
        }
        if (project.due_date) {
          project.due_date = this.getters.formatDate(project.due_date);
        }
        console.log(project);
        return project;
      });
    },
    setSelectedProject(state, project) {
      if (project.start_date) {
        project.start_date = this.getters.formatDate(project.start_date);
      }
      if (project.due_date) {
        project.due_date = this.getters.formatDate(project.due_date);
      }
      state.selectedProject = project;
    },
    setLoginMember(state, member) {
      state.loginMember = member;
    },
    updateProjectInList(state, updatedProject) {
      const index = state.projectList.findIndex(p => p.project_num === updatedProject.project_num);
      if (index !== -1) {
        state.projectList.splice(index, 1, updatedProject);
      }
    }
  },
  actions: {
    updateProjectsData({ commit }, projects) {
      commit('setProjectList', projects);
    },
    updateSelectedProject({ commit }, project) {
      commit('setSelectedProject', project);
    },
  }
});
