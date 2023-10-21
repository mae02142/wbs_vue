<template>
  <div id="top-category">
    <nav id="category">
      <div class="flex-container">
        <ul>
          <li><span>{{ selectedProject.project_title }}</span></li>
          <li><span>타임라인</span></li>
          <li><span>캘린더</span></li>
          <li><span @click="openProjectSettingModal">상세보기</span></li>
          <CheckAndModifyModal :project="selectedProject" :visible="showProjectSettingModal"
          @close="closeProjectSettingModal"></CheckAndModifyModal>
        </ul>

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
  </nav>  
  </div>
</template>

<script>
import CheckAndModifyModal from "./CheckAndModifyModal.vue";
import { gantt } from "dhtmlx-gantt";
export default {
  name: 'WBSCategory',
  components:{CheckAndModifyModal},
  data(){
    return{
      showProjectSettingModal:false,
      selectedScale: "day"
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
  },
  computed: {
  getProjectList() {
    return this.$store.state.projectList;
  },
  selectedProject() {
    return this.$store.state.selectedProject;
  }
},
methods:{
  openProjectSettingModal(){
    this.showProjectSettingModal=true;
    //this.$emit('projectModalOpened');
  },
  closeProjectSettingModal(){
    this.showProjectSettingModal=false;
  },

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
},    
  mounted: function () {
      //주 단위로 보기
      //gantt.config.scale_unit = "week";
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
}
}
</script>

<style scoped>
#top-category {
    border-top: 2px solid #80808030;
    margin-left: 232px;
}
#category{
    border-bottom: 1px solid #8080801f;
}

#category li{
    list-style: none;
    display: inline-block;
    padding-right: 26px;
    font-size: 13px;
    color: #6953538d;
    letter-spacing: -1px;
}

#category span:hover{
    background-color: rgb(161 207 142 / 25%);
    padding: 5px 15px 5px 15px;
    border-radius: 1rem;
    letter-spacing: -1px;
    color: black;
}

#category a{
    text-decoration: none;
    color: rgba(0, 0, 0, 0.29);
}

.flex-container {
  display: flex;
  justify-content: space-between;
}

/* radio */
.custom-radio {
    font-size: 11px;
    color: #6953538d;
    margin: 18px 28px;
    letter-spacing: 0px;
}
.custom-radio input[type="radio"] {
    display: none; /* 기본 라디오 버튼 숨김 */
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

</style>
