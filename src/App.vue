<template>
  <div class="tl-container">
    <SideBar @projectSelected="handleProjectSelected"></SideBar>
    <div class="gantt-container">
      <WBSCategory></WBSCategory>
      <GanttContainer></GanttContainer>
    </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar';
import WBSCategory from './components/WBSCategory.vue';
import GanttContainer from "./components/GanttContainer.vue";

export default {
  components: { SideBar, WBSCategory, GanttContainer},
  data() {
    return {
      selectedProject: null
    };
  },
}
</script>


<style>
.tl-container{
  margin-top:88px;
}



</style>
