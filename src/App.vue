<template>
  <div class="tl-container">
    <SideBar @projectSelected="handleProjectSelected"></SideBar>
    <div class="gantt-container">
      <WBSCategory ></WBSCategory>
      <GanttContainer :projectList="projectList"></GanttContainer>
    </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar';
import WBSCategory from './components/WBSCategory.vue';
import GanttContainer from "./components/GanttContainer.vue";
import axios from "axios";
import mixin from "./mixin";

export default {
  components: { SideBar, WBSCategory, GanttContainer},
  inject: ["eventBus"],
  mixins:[mixin],
  data() {
    return {
      todoList: [],
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
      console.log("eventBus emit project >>>>>", project);
      axios.post("http://localhost:8030/api/getAllTodoList", {
        project_num: project.project_num,
        t_key: this.key
      })
      .then(response => {
        this.todoList = response.data;
        console.log("Get Todo data >>>>", this.todoList)
      })
      .catch (error => {
        console.log("Failed to Get Todo List >>>>", error);
      })
    }, // getTodoList()

    todoListforCal() {

    }
  }
}

</script>


<style>
.tl-container{
  margin-top:88px;
}



</style>
