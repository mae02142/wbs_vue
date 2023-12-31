<template>
  <div class="g-container">
  <div>
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
    </div>
    <div ref="gantt" id="gantt-c"></div>
  </div>
</template>

<script>
import { gantt } from "dhtmlx-gantt";
import axios from "axios";
import mixin from "../mixin";
import { mapState } from "vuex";

export default {
  name: "GanttConfig",
  mixins: [mixin],
  inject: ["eventBus"],
  props: {
    project: Object,
    todoList: Array
  },
  data () {
    return {
      selectedScale: "day",
      updatingTask: false,
      tasks: { data: [] },
      members: [],
    };
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
    },
    selectedProject: {
      handler(newProject) {
      if (newProject && newProject.project_num) {
        this.updateMembersOptions(newProject);
      }
    },
    deep: true,
    immediate: true
  },
  members() {
    this.updateLightboxSections();
  },
  }, 
  computed: {
    ...mapState(['selectedProject', 'loginMember']),
  },
  
  /* eslint-disable */
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
      gantt.config.column_width = 70;
      gantt.render();
    },

    setMonthScale() {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F, %Y";
      gantt.config.subscales = [{ unit: "week", format: "Week #%W" }];
      gantt.config.column_width = 300; // 월 단위에서는 더 넓게
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
      gantt.config.column_width = 500; // 월 단위에서는 더 넓게
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
          member_num: task.member_num,
          member: task.member_name,
          status: task.status,
          content: task.content,
          project_manager : this.project.project_manager
          }));
          this.tasks = { data: transformedTasks };
          gantt.parse(this.tasks);
      },

      triggerToast(param){ // 알림창
        this.eventBus.emit('toast-event', param);
      },

      updateMembersOptions(project) {
        const memberList = project.member_list;
        this.members =(memberList || []).map(member => ({
          key: member.member_num,
          label: member.member_name
        }));
      },
      updateLightboxSections() {
        gantt.config.lightbox.sections = [
          { name: "description", height: 38, map_to: "text", type: "textarea"},
          { name: "content", height: 38, map_to: "content", type: "textarea" },
          { name: "project_manager", height: 16, type: "template", map_to: "project_manager"},
          { name: "member", height: 60, map_to: "member", type: "multiselect", options:this.members, label:"member.member_name"},
          { name: "priority", height: 22, map_to: "status", type: "select",
            options: [
              { key: "todo", label: "예정" },
              { key: "ing", label: "진행 중" },
              { key: "done", label: "완료됨" },
            ],
          },
          { name: "period", height: 72, type: "time", time_format: ["%Y", "%m", "%d"],
            map_to:{start_date:"start_date",end_date:"end_date"}},
        ];
          gantt.resetLightbox();
       }
    },

    mounted() {
      gantt.i18n.setLocale("kr");
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.columns = [
        { name: "text", label: "Title", tree: true, width: 130 },
        { name: "member", label: "member", align: "center"},
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
      this.updateLightboxSections();
      gantt.locale.labels.section_description = "할 일";
      gantt.locale.labels.section_content = "세부 설명";
      gantt.locale.labels.section_project_manager = "PM";
      gantt.locale.labels.section_member = "담당자";
      gantt.locale.labels.section_priority = "진행 상황";
      gantt.locale.labels.section_period = "시작일과 마감일";

      gantt.attachEvent("onTaskCreated", (task) => {
        task.project_manager = this.$store.state.selectedProject.project_manager;
        task.member = [];
        task.text='';
        return true;
      });
      // 'title' 열을 비워두기
      gantt.templates.grid_folder = function(task) {
        if (task.$level === 0) {
          return ''; // 최상위 레벨 작업일 경우 비워두기
        }
        return task.text;
      };

      gantt.templates.task_text = function(start,end,task){
      return task.text;  
      };
      gantt.attachEvent("onTaskLoading", function(task) {
        if (task.end_date) {
          task.end_date.setHours(23, 59, 59);
        }
        return true;
      });

      gantt.attachEvent("onLightboxSave", (id, task, is_new) => {
        if (!task.text) {
          this.triggerToast({'type':4,'text':'할 일을 선택해주세요'})
          return false; // 저장 취소
        }
        const sendtask = {
          todo_num: id,
          todo_title: task.text,
          status: task.status,
          start_date: this.$store.getters.formatDate(task.start_date), 
          due_date: this.$store.getters.formatDate(task.end_date),
          member_num: task.member.member_num,
          member_name: task.member.member_name,
          content: task.content
        };
        //날짜 검사
        const StartedprojectDate = this.project.start_date;
        const EndedprojectDate = this.project.due_date;
        if (sendtask.start_date < StartedprojectDate) {
          this.triggerToast({'type':4,'text':'작업의 시작 날짜는 프로젝트의 시작 날짜 이후여야 합니다.'})
          return false; // 저장 취소
        }

        if (sendtask.due_date > EndedprojectDate) {
          this.triggerToast({'type':4, 'text':'작업의 종료 날짜는 프로젝트의 종료 날짜 이전이어야 합니다.'});
          return false; // 저장 취소
        }

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
            member_num: task.member.member_num,
            member_name: task.member.member_name,
            content: task.content
          };
        this.deleteTaskonServer(sendtask);
        return true; // 작업을 삭제
      });

      gantt.createDataProcessor((entity, action, data, id) => {
        this.$emit(`${entity}-updated`, id, action, data);
      });
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.duration_step = 1;
      gantt.config.duration_unit = "day";
      gantt.config.min_duration = 24 * 60 * 60 * 1000;
      
      //가시성을 위한 스케일바 설정
      gantt.templates.task_class = (start, end, task) => {
          if (task.member_num && task.member_num !== this.loginMember.member_num) {
            return 'different-member';
          }
          return '';
        };


      //pm -> member 할일 할당
      gantt.form_blocks["multiselect"] = {
        render: function (sns) {
        var height = (sns.height || "23") + "px";
        var html = "<div class='gantt_cal_ltext gantt_cal_chosen gantt_cal_multiselect' style='height:" + height + ";'>" +
          "<select data-placeholder='...' class='chosen-select'>";
        if (sns.options) {
          for (var i = 0; i < sns.options.length; i++) {
            if (sns.unassigned_value !== undefined && sns.options[i].key == sns.unassigned_value) {
              continue;
            }
            html += "<option value='" + JSON.stringify({ member_num: sns.options[i].key, member_name: sns.options[i].label }) + "'>" + sns.options[i].label + "</option>";
          }
        }
        html += "</select></div>";
        return html;
      },

      set_value: function (node, value, ev, sns) {
  // node 및 관련 스타일 설정
  node.style.overflow = "visible";
  node.parentNode.style.overflow = "visible";
  node.style.display = "inline-block";
  var select = $(node.firstChild);

  // 단일 객체를 사용하여 선택된 멤버 설정
  if (value && typeof value === 'object') {
    var selectedMember = JSON.stringify({member_num: value.member_num, member_name: value.member_name});
    select.val(selectedMember);
  }

  // Chosen jQuery 플러그인 초기화
  select.chosen();

  // 선택 변경 이벤트 핸들러 설정
  if (sns.onchange) {
    select.change(function () {
      sns.onchange.call(this);
    });
  }

  // 선택된 상태 업데이트
  select.trigger('chosen:updated');
  select.trigger("change");
},

get_value: function (node, ev, sns) {
  // 선택된 옵션의 value 값을 가져옵니다.
  var selectedValue = $(node.firstChild).val();
  
  // 선택된 옵션이 없다면 빈 문자열을 반환합니다.
  if (!selectedValue) {
    return '';
  }
  
  // 선택된 옵션의 value 값을 JSON 객체로 파싱합니다.
  var selectedMember = JSON.parse(selectedValue);

  // 선택된 멤버의 정보를 반환합니다.
  return selectedMember;
},
      
      focus: function (node) {
          $(node.firstChild).focus();
      }
      };

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
    height: 760px;
}
.hide-add-button .gantt_grid_scale .gantt_grid_head_add {
    display: none;
}

.gantt_grid_scale .gantt_grid_head_cell{
  color: #706f6f;
}

.chosen-container-multi .chosen-choices{
  min-width: 200px;
}

.chosen-container-single .chosen-single {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 1px 0 4px 10px !important;
    height: 26px !important;
    width: 117px !important;
    border: 1px solid #aaaaaa52 !important;
    border-radius: 20px !important;
    background: white!important;
    background-clip: padding-box;
    color: #1d1a1a !important;
    text-decoration: none;
    white-space: nowrap;
    line-height: 24px;
    font-size: 11px !important;
}   

.single .chosen-drop{
  width: 200px;
  font-size: 12px;
  color: #726666;
  font-family: Arial;
}

.chosen-single{
  width: 200px;
}

.chosen-container-single .chosen-search input[type=text] {
    margin: 3px 1px !important;
    padding: 4px 20px 4px 9px !important;
    width: 97% !important;
    height: auto;
    outline: 0;
    border: 1px solid #aaaaaa61 !important;
    font-size: 12px !important;
    font-family: sans-serif;
    line-height: normal;
    border-radius: 17px !important;
}

.chosen-container .chosen-results li {
    display: none;
    margin: 0;
    padding: 6px 8px !important;
    list-style: none;
    line-height: 15px;
    word-wrap: break-word;
    font-size: 11px!important;
    -webkit-touch-callout: none;
}

.chosen-container.chosen-with-drop .chosen-drop {
    clip: auto;
    -webkit-clip-path: none;
    clip-path: none;
    width: 100px !important;
    margin-left: 8px !important;
    margin-top: 0px !important;
    border-radius: 13px !important;
    border: 1px solid #8080803d !important;
}

.chosen-container .chosen-results li.highlighted {
    background-color: #5ba94b21;
    background-image: none !important;
    background-image: none !important;
    color: #120f0f;
}


.different-member {
  background-color: rgb(174, 219, 159) !important;/* 원하는 색상 코드로 변경 */
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
    padding-right: none !important;
}

.gantt_grid_head_add { /* plus 이미지 버튼 */
    background-image: url('../assets/icon/add_btn.png');
    background-size: 80% 70%;
    background-position: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
    position: relative;
    -moz-opacity: .6;
    opacity: .6;
    top: 0;
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
.gantt_cal_light .gantt_title {
    padding-left: 17px;
}
span.gantt_title {
    letter-spacing: 3px;
    padding: 10px 11px 10px 20px;
    background: #8080801f;
    border-radius: 17px;
    font-size: 11px;
    color: #636060cf;
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
.gantt_add {
    display: none;
}
.gantt_cal_larea .gantt_cal_ltext{
    height: 23px !important;
}
.gantt_grid_head_text[data-column-id="text"]{
    width: 148px !important;
}
.gantt_grid_head_member[data-column-name="member"]{
    width: 90px !important;
}
.gantt_cell[data-column-name="member"] {
    width: 75px !important;
    text-align: center !important; 
    justify-content:center !important;
}
.gantt_cell.gantt_cell_tree[data-column-name="text"][role="gridcell"]{
    width: 155px !important;
}
.gantt_last_cell[data-column-name="add"][data-column-index="4"]{
    width: 30px !important;
}
.gantt_row .gantt_cell[data-column-name="start_date"] {
    width: 92px !important;
}
.gantt_grid_head_start_date[data-column-name="start_date"][data-column-index="2"] {
    width: 80px !important;
}
.gantt_cell[data-column-name="end_date"] {
    width: 100px !important;
    text-align: center;
    justify-content: center;
}
.gantt_grid_head_end_date[data-column-name="end_date"][data-column-index="3"] {
    width: 100px !important;
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
.gantt_tree_icon.gantt_blank {
    width: 0px;
}
.gantt_cal_lsection {
    font-size: 12px;
    color: #001b05a3;
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
    padding: 9px 21px;
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

.gantt_cal_light .gantt_btn_set {
    margin: 7px 19px;
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
    font-size: 11px;
    padding: 4px 4px 4px 9px;
    margin: -1px;
    border-radius: 16px;
    width: 27% !important;
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