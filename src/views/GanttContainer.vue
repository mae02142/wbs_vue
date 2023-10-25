<template>
  <div class="g-container">
    <GanttConfig ref="GanttConfig" 
      class="left-container" 
      :tasks="tasks"
      @task-updated="handleTaskUpdated">
    </GanttConfig>
  </div>
</template>

<script>
import GanttConfig from '../components/GanttConfig.vue';
import mixin from "../mixin";
import { gantt } from "dhtmlx-gantt";
7
export default {
  name: 'GanttContainer',
  components: {GanttConfig},
  mixins:[mixin],
  props: {
    project: Object,
    todoList: Array,
  },
  data () {
    return {
      tasks: {
        data: []
      },
    }
  },

  watch: {
    todoList: {
      handler(newTodoList) {
        if (newTodoList) {
          this.renderGanttChart(newTodoList);
        }
      },
      immediate: true
    }
  },
  methods: {
    handleTaskUpdated(){
      this.renderGanttChart(this.todoList);
    },
    renderGanttChart(newTodoList) {
      gantt.clearAll();
        const transformedTasks = newTodoList.map(task => ({
          id: task.todo_num,
          text: task.todo_title,
          start_date: this.$store.getters.formatDate(task.start_date),
          end_date: this.$store.getters.formatDate(task.due_date),
          member: task.member_name,
          status: task.status,
          content: task.content,
          project_manager : this.project.project_manager
        }));
        this.tasks = { data: transformedTasks };
        gantt.parse(this.tasks);
    }
  }
  }
</script> 


<style>
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  .g-container {
    display: flex;
    flex-direction: column;
  }
  .left-container {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .right-container {
    border-right: 1px solid #cecece;
    float: right;
    height: 100%;
    width: 340px;
    box-shadow: 0 0 5px 2px #aaa;
    position: relative;
    z-index:2;
  }
  .gantt-messages {
    list-style-type: none;
    height: 50%;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding-left: 5px;
  }
  .gantt-messages > .gantt-message {
    background-color: #f4f4f4;
    box-shadow:inset 5px 0 #d69000;
    font-family: Geneva, Arial, Helvetica, sans-serif;
    font-size: 14px;
    margin: 5px 0;
    padding: 8px 0 8px 10px;
  }

  .gantt_grid {
    overflow-y: hidden !important;
}

.gantt_task {
    overflow-y: auto !important;
}
</style>