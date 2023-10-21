<template>
  <div class="tl-container">
    <SideBar @projectSelected="handleProjectSelected"></SideBar>
    <div class="tab">
      <button @click="toggleView()">Time Line</button>
      <button @click="toggleView()">Calendar</button>
      <GanttContainer v-if="isTimeLine"
        :todoList="todoTimeLine">
      </GanttContainer>
      <FullCalendar v-if="isCalendar"
        :todoList="todoCalendar">
      </FullCalendar>
    </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar';
import GanttContainer from "./components/GanttContainer.vue";
import FullCalendar from "./components/FullCalendar.vue";
import axios from "axios";
import mixin from "./mixin";

export default {
  components: { SideBar, GanttContainer, FullCalendar},
  inject: ["eventBus"],
  mixins:[mixin],
  data() {
    return {
      todoList: [],
      todoCalendar: [],
      todoTimeLine: [],
      isTimeLine: true,
      isCalendar: false,
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
      this.initializeArray();
      axios.post("http://localhost:8030/api/getAllTodoList", {
        project_num: project.project_num,
        t_key: this.key
      })
      .then(response => {
        this.todoList = response.data;
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("Get Todo data >>>>", this.todoList);
        this.todoListforCal();
      })
      .catch (error => {
        console.log("Failed to Get Todo List >>>>", error);
      })
    }, // getTodoList()
    initializeArray() {
      this.todoList = []
      console.log("initializeArray >>", this.todoList)
    },
    todoListforCal() {
      console.log('todoListforCal >>>');
      var dataList = this.todoList;
      this.todoCalendar = [];
      dataList.map((element) => {
        const startDate = new Date(element.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(element.due_date);
        endDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);

        this.todoCalendar.push({
          id: element.todo_num,
          title: element.todo_title,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          member_name: element.member_name,
          content: element.content,
          member_num: element.member_num 
        })
      })
      this.eventBus.emit('resetCalendar',this.todoCalendar);
    },
    todoListforTL() {

    },
    toggleView() { // toggle for category
      this.isTimeLine = !this.isTimeLine;
      this.isCalendar = !this.isCalendar;
    }
  }
}
</script>


<style>
.tl-container{
  margin-top:88px;
}



</style>
