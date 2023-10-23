<template>
  <div ref="gantt" class="gantt-c"></div>
</template>

<script>
import { gantt } from "dhtmlx-gantt";
import axios from "axios";
import mixin from "../mixin";
export default {
  name: "GanttConfig",
  mixins: [mixin],
  data() {
    return {
      selectedScale: "day",
      updatingTask: false,  // 중복 업데이트 방지 플래그
    };
  },
  props: {
    tasks: {
      type: Object,
      default() {
        return {
          data: [],
        };
      },
    },
  },
  computed: {
    loginMember() {
      return this.$store.state.loginMember;
    }
  },
    methods: {
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
          console.log(response.data);
          this.data=response.data;

        } catch (error) {
          console.log(error);
        }
      },
    },

    mounted: function () {
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.columns = [
        { name: "todo_title", label: "Title", tree: true, width: 130 },
        { name: "member", label: "member", align: "center" },
        { name: "start_date", label: "Start time", align: "center" },
        { name: "end_date", label: "End time", align: "center" },
        { name: "add", label: "" },
      ];
      gantt.config.grid_width = 450;

      //todo 추가 모달창 - 구성
      gantt.config.lightbox.sections = [
        { name: "todo_title", height: 38, map_to: "todo_title", type: "textarea" }, //title
        { name: "content", height: 38, map_to: "content", type: "textarea" }, // Content
        { name: "project_manager", height: 16, type: "template", map_to: "project_manager"}, // PM
        { name: "member", height: 60, type: "template", map_to: "member"}, //manager
        { name: "priority", height: 22, map_to: "status", type: "select",
          options: [
            // status
            { key: "todo", label: "해야 할 일" },
            { key: "ongoing", label: "진행 중" },
            { key: "done", label: "완료됨" },
          ],
        },
        {
          name: "period", height: 72, type: "time", map_to: "dedline", time_format: ["%Y", "%m", "%d"],
        }, //Deadline
      ];
      gantt.locale.labels.section_todo_title = "할 일";
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
        return true;
      });
      gantt.templates.task_text = function(start,end,task){
      return task.todo_title;  
      };

      gantt.attachEvent("onLightboxSave", (id, task, is_new) => {
        task.start_date = this.$store.getters.formatDate(task.start_date);
        task.due_date = this.$store.getters.formatDate(task.end_date);
        delete task.end_date;
        console.log("라이트박스 task>>>", task);
        const sendtask = {
          todo_num: id,
          todo_title: task.todo_title,
          status: task.status, 
          start_date: task.start_date, 
          due_date: task.due_date,
          member_name: task.member,
          member_num: this.$store.state.loginMember.member_num,
          content: task.content
        };
        console.log("is_new",is_new);
        this.saveTaskToServer(sendtask);
        return true; // 이를 반환하여 gantt가 작업을 저장하게 합니다.
      });
      gantt.createDataProcessor((entity, action, data, id) => {
        this.$emit(`${entity}-updated`, id, action, data);
      });
      //document.querySelector(".gantt_radio[value='" + config.name + "']").checked = true;

      /////언어 설정하기
      gantt.i18n.setLocale("kr");

      //초기화
      gantt.init(this.$refs.gantt);
      gantt.parse(this.$props.tasks);


    },
}
</script>

<style>
@import "~dhtmlx-gantt/codebase/dhtmlxgantt.css";
div[ref="gantt"] {
  width: 100%;
  height: 800px;
}

.gantt-c {
  min-height: 600px;
}


.gantt_row.odd{ /* 짝수 행마다 회색*/
    background-color:#f4f4fb4b;
}

.gantt_tree_content { /*줄임표를 사용하여 긴 텍스트 자르기*/
    /* overflow:hidden;
    text-overflow: ellipsis; */
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

.gantt_add, .gantt_grid_head_add { /* plus 이미지 버튼 */
    width: 98%;
    height: 100%;
    background-image: url(https://img.icons8.com/material-outlined/24/plus--v0.png);
    background-position: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
    position: relative;
    -moz-opacity: .3;
    opacity: 0.1;
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

/*/////////////////// task */


/*////////////////// + modal */ 
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
    padding: 32px 13px 38px 13px;
}
.gantt_cal_light .gantt_title {
    font-size: 12px;
    color: #736969b8;
    letter-spacing: 2px;
    background: #eceaea4f;
    padding: 5px 10px;
    border-radius: 17px;
}

.gantt_cal_ltitle {
    padding: 30px 0px 10px 0px;
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

.gantt_cal_light .gantt_btn_set {
    margin: -13px 51px;
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

/* select[aria-label="Years"] {
    width: 61px !important;
}
select[aria-label="Months"] {
    width: 100px !important;
}
select[aria-label="Days"] {
    width: 46px !important;
} */
 

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
</style>