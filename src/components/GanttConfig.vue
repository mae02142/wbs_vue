<template>
  <div class="g-container">
    <div class="custom-radio">
            <input
              type="radio"
              id="scale1"
              class="gantt_radio"
              name="scale"
              value="day"
              v-model="selectedScale"
            />
            <label for="scale1">일별</label>
  
            <input
              type="radio"
              id="scale2"
              class="gantt_radio"
              name="scale"
              value="week"
              v-model="selectedScale"
            />
            <label for="scale2">주별</label>
  
            <input
              type="radio"
              id="scale3"
              class="gantt_radio"
              name="scale"
              value="month"
              v-model="selectedScale"
            />
            <label for="scale3">달별</label>
  
            <input
              type="radio"
              id="scale4"
              class="gantt_radio"
              name="scale"
              value="quarter"
              v-model="selectedScale"
            />
            <label for="scale4">분기별</label>
  
            <input
              type="radio"
              id="scale5"
              class="gantt_radio"
              name="scale"
              value="year"
              v-model="selectedScale"
            />
            <label for="scale5">연도별</label>
        </div>
     <div ref="gantt" id="gantt-c" :class="{ 'no-project': isNoProject }"></div>
  </div>
</template>

<script>
import { gantt } from "dhtmlx-gantt";
import axios from "axios";
import mixin from "../mixin";
export default {
  name: "GanttConfig",
  mixins: [mixin],
  props: {
    project: Object,
    todoList: Array
  },
  data () {
    return {
      selectedScale: "day",
      updatingTask: false,
      tasks: { data: [] }
    };
  },
  computed: {
    isNoProject() {
      return this.project == null; // null 또는 undefined일 때 true를 반환
    }
  },
  watch: {
    selectedScale(newValue) {
      switch (newValue) {
        case "day":
          this.setDayScale();
          break;
        case "week":
          this.setWeekScale();
          break;
        case "month":
          this.setMonthScale();
          break;
        case "quarter":
          this.setQuarterScale();
          break;
        case "year":
          this.setYearScale();
          break;
      }
    },
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
      //selectedScale
    setDayScale() {
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "%d %M";
      gantt.config.subscales = [];
      gantt.render();
    },

    setWeekScale() {
      gantt.config.scale_unit = "week";
      gantt.config.date_scale = "%W";
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%d %M" }];
      gantt.render();
    },

    setMonthScale() {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F, %Y";
      gantt.config.subscales = [{ unit: "week", format: "Week #%W" }];
      gantt.render();
    },
    setQuarterScale() {
      gantt.config.scale_unit = "quarter";
      gantt.config.date_scale = "%M";
      gantt.config.subscales = [{ unit: "month", step: 1, date: "%M" }];
      gantt.render();
    },

    setYearScale() {
      gantt.config.scale_unit = "year";
      gantt.config.date_scale = "%Y";
      gantt.render();
    },
      //todo 저장
      async saveTaskToServer(task) {
        try {
          const response = await axios.post(
            "http://localhost:8030/api/createTodo",
            {
              t_key: this.key,
              project_num:this.$store.state.selectedProject.project_num,
              todoDTO: task,
            }
          );
          console.log("saveTaskToServer>>",response.data);
          this.handleTaskUpdated();
          this.$emit('task-changed');
        } catch (error) {
          console.log(error);
        }
      },
      //todo 수정
      async updateTaskOnServer(task) {
        try {
          await axios.put("http://localhost:8030/api/updateTodo",
            {
              t_key: this.key,
              todoDTO: task
            });
            this.$emit('task-changed');
        } catch (error) {
          console.error("Failed to update task on server", error);
          this.handleTaskUpdated();
        }finally{
          this.updatingTask = false;  // 작업 업데이트가 완료된 후 플래그를 재설정
        }
      },
      //todo 삭제
      async deleteTaskonServer(task) {
        console.log("deleteTaskonServer>>",task);
        try {
          await axios.post("http://localhost:8030/api/deleteTodo",
            {
              t_key: this.key,
              todoDTO: task
            });
            this.handleTaskUpdated();
            this.$emit('task-changed');
        } catch (error) {
          console.error("Failed to delete task on server", error);
        }
      },
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
    },
    setGridHeaderClass(columnName) {
      console.log(columnName);
    if (columnName === 'add' && !this.project) {
      return "no-project";
    }else{
      return "";
    }
  }
    },

    mounted() {
      /////언어 설정하기
      gantt.i18n.setLocale("kr");
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.columns = [
        { name: "text", label: "Title", tree: true, width: 130 },
        { name: "member", label: "member", align: "center" },
        { name: "start_date", label: "Start time", align: "center" },
        { name: "end_date", label: "End time", align: "center" },
        { name: "add", label: ""},
      ];
      gantt.config.grid_width = 450;
      gantt.config.scrollable = true;
      gantt.config.scale_unit = "day";
      gantt.config.show_links = false;

      gantt.templates.lightbox_header = function (start_date, end_date, task) {
        return (
          gantt.templates.task_time(task.start_date, task.end_date, task) +
          "&nbsp;" +
          (
            gantt.templates.task_text(task.start_date, task.end_date, task.text) ||
            ""
          ).substr(0, 70)
        );
      };

      //todo 추가 모달창 - 구성
      gantt.config.lightbox.sections = [
        { name: "description", height: 38, map_to: "text", type: "textarea"},
        { name: "content", height: 38, map_to: "content", type: "textarea" },
        { name: "project_manager", height: 16, type: "template", map_to: "project_manager"},
        { name: "member", height: 60, type: "template", map_to: "member"},
        { name: "priority", height: 22, map_to: "status", type: "select",
          options: [
            { key: "todo", label: "해야 할 일" },
            { key: "ongoing", label: "진행 중" },
            { key: "done", label: "완료됨" },
          ],
        },
        { name: "period", height: 72, type: "time", time_format: ["%Y", "%m", "%d"],
        map_to:{start_date:"start_date",end_date:"end_date"}},
      ];
      gantt.locale.labels.section_description = "할 일";
      gantt.locale.labels.section_content = "세부 설명";
      gantt.locale.labels.section_project_manager = "PM";
      gantt.locale.labels.section_member = "담당자";
      gantt.locale.labels.section_priority = "진행 상황";
      gantt.locale.labels.section_period = "시작일과 마감일";
      gantt.attachEvent("onTaskLoading", function (task) {
        task.start_date = new Date(task.start_date);
        task.end_date = new Date(task.end_date);
        return true;
      });
      //todo 모달창 열때 기본값
      gantt.attachEvent("onTaskCreated", (task) => {
        task.project_manager = this.$store.state.selectedProject.project_manager;
        task.member = this.$store.state.loginMember.member_name;
        task.text='';
        return true;
      });
      gantt.templates.task_text = function(start,end,task){
      return task.text;  
      };

      gantt.attachEvent("onLightboxSave", (id, task, is_new) => {
        // 입력값 검사
        if (!task.text) {
          alert('할 일을 입력해주세요.');
          return false; // 저장 취소
        }
        const sendtask = {
          todo_num: id,
          todo_title: task.text,
          status: task.status,
          start_date: this.$store.getters.formatDate(task.start_date), 
          due_date: this.$store.getters.formatDate(task.end_date),
          member_name: task.member,
          member_num: this.$store.state.loginMember.member_num,
          content: task.content
        };
        if (is_new) {
            this.saveTaskToServer(sendtask);
          } else {
            this.updateTaskOnServer(sendtask);
          }
          return true;
      });
      gantt.attachEvent("onBeforeTaskDelete", (id) => {
        const task = gantt.getTask(id);
        const sendtask = {
            todo_num: id,
            todo_title: task.text,
            status: task.status, 
            start_date: this.$store.getters.formatDate(task.start_date), 
            due_date: this.$store.getters.formatDate(task.end_date),
            member_name: task.member,
            member_num: this.$store.state.loginMember.member_num,
            content: task.content
          };
        this.deleteTaskonServer(sendtask);
        return true; // 작업을 삭제
      });

      gantt.createDataProcessor((entity, action, data, id) => {
        this.$emit(`${entity}-updated`, id, action, data);
      });

      gantt.templates.grid_header_class = this.setGridHeaderClass;

      gantt.attachEvent("onGanttRender", function() {
      var element = document.querySelector('.gantt_grid_head_add');
      if (element) {
        element.setAttribute('aria-label', '새로운 이름');
      }
    });


      //초기화
      gantt.init(this.$refs.gantt);

      
      // 데이터 렌더링
      if (this.todoList && this.todoList.length > 0) {
        this.renderGanttChart(this.todoList);
      }
    }
}
</script>

<style>
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
#gantt-c {
  width: 100%;
  height: 800px;
  min-height: 600px;
}

/* /////////////////////////////////////////// radio */
.custom-radio {
    font-size: 11px;
    color: #6953538d;
    font-size: 11px;
    color: #6953538d;
    margin: 0px 30px 17px 0px;
    float: right;
}

.custom-radio input[type="radio"] { /* 기본 라디오 버튼 숨김 */
    display: none; 
}

.custom-radio label:before {
    content: '';
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid #e3e5e7;
    border-radius: 50%;
    position: absolute;
    left: 12px;
    top: 1px;
}

.custom-radio label {
    display: inline-block;
    position: relative;
    padding-left: 34px;
    cursor: pointer;
}

.custom-radio input[type="radio"]:checked + label:before {
    background-color: #56732e7a;
}
/* /////////////////////////////////////////// end radio */

.gantt_row.odd{ /* 짝수 행마다 회색*/
    background-color:#f4f4fb4b;
}

.gantt_grid_data .gantt_row.odd:hover, .gantt_grid_data .gantt_row:hover,
.gantt_grid_data .gantt_row.gantt_selected,
.gantt_grid_data .gantt_row.odd.gantt_selected,
.gantt_task_row.gantt_selected{ /* 마우스를 올리면 그리드 행의 색상*/
    background-color: rgba(129, 181, 145, 0.116); 
}

.gantt_task_row.gantt_selected .gantt_task_cell {
    border-right-color: #f7e14d30;
  }

.gantt_grid_data .gantt_row.gantt_selected, .gantt_grid_data .gantt_row.odd.gantt_selected, .gantt_task_row.gantt_selected {
    background-color: #b9b8af2d;
}

.gantt_task_line.gantt_selected { 
    box-shadow: 0 0 5px #999fa0;
}

.gantt_row>div {
    flex-shrink: 0;
    flex-grow: 0;
}
.gantt_cell { /*왼쪽 전체 셀 */
    vertical-align: top;
    border-right: 1px solid #ebebeb;
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
    font-size: 13px;
}

/* 프로젝트가 없을 때의 스타일 */
#gantt-c.no-project .gantt_grid_head_add {
  display: none !important;
}

/* 프로젝트가 있을 때의 스타일 */
.gantt_grid_head_add {
  width: 98%;
  height: 100%;
  background-image: url(https://img.icons8.com/material-outlined/24/plus--v0.png);
  background-position: 50%;
  background-repeat: no-repeat;
  cursor: pointer;
  position: relative;
  -moz-opacity: .3;
  opacity: 0.3;
}

.gantt_add{
    display: none;
}


.gantt_data_area {
    position: relative;
    overflow-x: hidden;
    overflow-y: hidden;
    -moz-user-select: -moz-none;
    -webkit-user-select: none;
    user-select: none;
}

.gantt_side_content, .gantt_task_content, .gantt_task_progress {
    line-height: inherit;
    overflow: hidden;
    height: 100%;
}

.gantt_row .gantt_cell[data-column-name="start_date"] {
    width: 77px !important;
}

/*/////////////////// task */
.gantt_task_line { /* background color of task bars*/
    border-radius: 18px;
    font-size: 12px;
    width: 100%;
    top: 0;
    box-sizing: border-box;
    cursor: pointer;
    position: absolute;
    white-space: nowrap;
    text-align: center;
    letter-spacing: 2px;
    background: #507c502a;
    border: 2px solid rgba(128, 128, 128, 0.066);
}

.gantt_task_line .gantt_task_content { /* text color */
    color: #190505e1;
} 

.gantt_task_progress { /* progress fill */
    background: #4472445e;
}
/*/////////////////// end task */


/*///////////////////////// +modal */ 
.gantt_cal_light {
    -webkit-tap-highlight-color: transparent;
    background: #fff;
    border-radius: 60px;
    font-family: Arial;
    font-size: 13px;
    border: 1px solid #cecece;
    color: #393434;
    font-size: 12px;
    position: absolute;
    z-index: 10001;
    width: 476px;
    height: 250px;
    padding: 32px 13px 44px 13px;
}
span.gantt_title {
    letter-spacing: 3px;
    padding: 10px 20px;
    background: #8080800d;
    border-radius: 17px;
    font-size: 11px;
    color: #63606070;
}
.gantt_cal_ltitle {
    padding: 36px 0px 10px 0px;
    text-align: center;
    overflow: hidden;
    -webkit-border-top-left-radius: 6px;
    -webkit-border-bottom-left-radius: 0;
    -webkit-border-top-right-radius: 6px;
    -webkit-border-bottom-right-radius: 0;
    -moz-border-radius-topleft: 6px;
    -moz-border-radius-bottomleft: 0;
    -moz-border-radius-topright: 6px;
    -moz-border-radius-bottomright: 0;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 0;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 0;
}

.gantt_cal_larea .gantt_cal_ltext{
    height: 23px !important;
}
.gantt_cal_larea {
    height: 431px !important;
    border: none;
    border-left: none;
    border-right: none;
    background-color: #fff;
    overflow: hidden;
    height: 1px;
}

.gantt_cal_lsection {
    font-size: 12px;
    color: #001b0552;
    font-weight: 700;
    padding: 14px 0 0px 22px;
}

.gantt_cal_ltext textarea {
    overflow-y: hidden;
    overflow-x: hidden;
    font-family: Arial;
    font-size: 13px;
    box-sizing: border-box;
    border: 1px solid #cecece7a;
    border-radius: 26px;
    height: 30px;
    width: 100%;
    font-size: 12px;
    color: #726666;
    outline: none!important;
    resize: none;
    padding: 6px 0px 6px 15px;
}
.gantt_cal_ltext {
    padding: 8px 21px;
    overflow: hidden;
}
.gantt_section_time {
    background-color: #fff;
    white-space: nowrap;
    padding: 2px 10px 5px;
    padding-top: 8px!important;
    margin-left: 10px;
    width: 251px;
}

div.gantt_cal_ltext.gantt_cal_template {
  height: 13px !important;
}

/* btn */
.gantt_btn_set div {
    float: left;
    font-size: 11px;
    height: 22px;
    line-height: 22px;
    background-repeat: no-repeat;
    vertical-align: middle;
    font-weight: normal;
    letter-spacing: 1px;
}

div[role="button"][aria-label="저장"] {
   margin-left: 123px !important;
}

.gantt_cal_light .gantt_btn_set {  /* btn 간격 */
    margin: -14px 19px;
}

.gantt_btn_set {
    padding: 6px 16px 7px 16px;
    float: left;
    border-radius: 20px;
    border: 0 solid #cecece;
    height: 33px;
    font-weight: 0;
    background: #fff;
    box-sizing: border-box;
    cursor: pointer;
}

.gantt_save_btn {
    background-image: none;
    margin-top: 0px;
    width: 0px;
}
.gantt_cancel_btn {
    background-image: none;
    margin-top: 0px;
    width: 0px;
}
.gantt_delete_btn {
    background-image: none;
    margin-top: 0px;
    width: 0px;
}
.gantt_btn_set.gantt_save_btn_set {
    background: #648748b3;
    color: #ffffff;
    text-shadow: none;
}
.gantt_btn_set.gantt_delete_btn_set {
    background: #1f5625c2;
    color: #fff;
    text-shadow: none;
}

.gantt_cal_light select {
    font-family: Arial;
    border: 1px solid #cececeb8;
    font-size: 12px;
    padding: 4px;
    margin: -1px;
    border-radius: 16px;
    width: 23% !important;
}

.gantt_btn_set[role="button"][aria-label="삭제"] {
    float: inline-start !important;
}
/*///////////////////////// end +modal */ 

/* delete modal in modal */
.gantt_modal_box gantt-alert {
    top: 402px;
    left: 806px;
}
.gantt_modal_box {
    overflow: hidden;
    display: inline-block;
    min-width: 250px;
    width: 260px;
    padding: 22px 17px;
    text-align: center;
    position: fixed;
    z-index: 20000;
    box-shadow: 3px 3px 3px rgba(0,0,0,.07);
    font-family: Arial;
    border-radius: 6px;
    border: 1px solid #cecece;
    background: #fff;
    border-radius: 7px;
}
.gantt_button input, .gantt_popup_button div {
    border-radius: 11px;
    font-size: 12px;
    box-sizing: content-box;
    padding: 0;
    margin: 0;
    vertical-align: top;
}

.gantt_popup_button.gantt_ok_button {
    text-shadow: none;
    background: #3e6e27a6;
    color: #fff;
    font-weight: 700;
    border-width: 0;
    border-radius: 16px;
    border: none;
}

.gantt_button, .gantt_popup_button {
    text-shadow: none;
    border: 1px solid #cececea8;
    height: 28px;
    line-height: 30px;
    display: inline-block;
    margin: 0 5px;
    border-radius: 16px;
    background: #fff;
}

.gantt_popup_button {
    min-width: 80px;
}

/*////////////////// + modal */ 

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