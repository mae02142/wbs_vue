<template>
    <div v-if="visible" class="create-modal">
      <div class="modal-content">
        <span @click="close" class="close">&times;</span>
        <h2>{{ project.project_title }}</h2>
        <div class="m-container">
            <div class="m-left">
                <div v-if="!isEditMode"></div>
                <div v-else class="todo">
                    <span>프로젝트명</span>
                    <input v-model="project_title" placeholder="Modify Project Name" @keyup.prevent="preventComma"/>
                </div>
            </div>
            <div class="status">
              <span class="status-title">진행 상황</span>
              <select v-if="isEditMode" name="status" v-model="selectedStatus">
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
              <span class="status-project" v-else>{{ project.status }}</span>
            </div>
                <div class="status-detail">
                    <div class="s-header"> 
                        <span>세부정보</span>
                    </div>

                    <div>
                        <table class="status-table">
                            <tbody class="s-body">
                                <tr> 
                                    <th>PM</th>
                                    <td class="pm-member">{{ project.project_manager }}</td>
                                  </tr>
                                  <tr>
                                    <th>참여 인원</th>
                                    <div v-if="isEditMode">
                                      <td @click="openMemberSearchModal" class="click-add" id="tooltip-container" 
                                          @mouseover="showTooltipMethod" @mousemove="moveTooltip" @mouseleave="hideTooltip">
                                          <span v-for="member in selectedMembers" :key="member.member_num" class="selected-member">
                                              {{ member.div_name }} {{ member.member_name }} {{ member.rank }}<br>                              
                                          </span>
                                          <span v-if="tooltipVisible" class="tooltip" :style="tooltipStyle">
                                              edit
                                          </span>                                             
                                      </td>
                                    </div>

                                    <div v-else>
                                      <span v-for="member in selectedMembers" :key="member.member_num" class="selected-member">
                                        {{ member.div_name }} {{ member.member_name }} {{ member.rank }}<br>
                                      </span>
                                    </div>
                                </tr>
                                <tr>
                                  <th>시작일</th>
                                  <td v-if="isEditMode" class="date-picker">
                                    <input type="date" class="date-picker" v-model="formattedStartDate" :max="formattedDueDate">
                                  </td>
                                  <td v-else class="date-picker">{{ formattedStartDate }}</td>
                                </tr>
                                <tr>
                                  <th>마감일</th>
                                  <td v-if="isEditMode" class="date-picker">
                                    <input type="date" class="date-picker" v-model="formattedDueDate" :min="formattedStartDate">
                                  </td>
                                  <td v-else class="date-picker">{{ formattedDueDate }}</td>
                                </tr>
                            </tbody>
                        </table>
                      </div>
                    </div>
                    <MemberSearchModal :visible="showMemberSearchModal" @close="closeMemberSearchModal"
                    @update-selected-members="updateSelectedMembers" :sendMemberName="selectedMembers">
                    </MemberSearchModal>
                    <div class="create-btn"> 
                      <div v-if="!isEditMode&&this.loginMember.member_num==this.project.member_num">
                        <button  @click="enterEditMode">수정</button>
                        <button  @click="confirmDeletion">삭제</button>
                      </div>
                      <div v-else-if="isEditMode&&this.loginMember.member_num==this.project.member_num">
                        <button @click="saveChanges($event)">확인</button>
                        <button class="cancel-btn" @click="close">취소</button>
                      </div>
                    </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import MemberSearchModal from "./MemberSearchModal.vue";
  import axios from "axios";
  import mixin from "../mixin";
  

  export default {
    name:"CheckAndModifyModal",
    mixins:[mixin],
    components:{MemberSearchModal},
    props: {
    visible: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object,
      required: true
    }

    },
    data() {
      return {
        localProject: {...this.project},
        isEditMode: false,
        showMemberSearchModal: false,
        selectedMembers: [],

        tooltipVisible: false,
        tooltipStyle: {
            top: "0px",
            left: "0px",
        },

        //프로젝트 진행 상태
        selectedStatus: 'todo',  // 기본값을 'all'로 설정
        statusOptions: [
        { value: 'todo', text: '해야 할 일' },
        { value: 'ongoing', text: '진행중' },
        { value: 'done', text: '완료' },
        ],
      };
    },
    watch: {
      visible(newVal) {
        if (newVal) {  // visible이 true가 될 때
          this.participatedMemberList();
        }
      },
    },
    computed: {
      loginMember() {
        return this.$store.state.loginMember;
    },
      formattedStartDate: {
      get() {
        return this.$store.getters.formatDate(this.project.start_date);
      },
      set(value) {
        this.localProject.start_date = this.$store.getters.formatDate(value);
      },
    },
    formattedDueDate: {
      get() {
        return this.$store.getters.formatDate(this.project.due_date);
      },
      set(value) {
        this.localProject.due_date = this.$store.getters.formatDate(value);
      },
    },
    projectData() {
      return this.$store.state.selectedProject;
    }
  },
  methods: {
    updateSelectedMembers(updatedMembers) {
      this.selectedMembers = updatedMembers;
      this.hasSelectedMembers = this.selectedMembers.length > 0;
      console.log("selectedMembers",this.selectedMembers);
    },

    showTooltipMethod() {
      this.tooltipVisible = true;
      console.log("tooltip1");
    },
    moveTooltip(event) {
      if (this.tooltipVisible) {
        this.tooltipStyle.top = event.clientY + 10 + "px"; // 원하는 위치로 조정
        this.tooltipStyle.left = event.clientX + "px";
        console.log("tooltip2");
      }
    },
    hideTooltip() {
      this.tooltipVisible = false;
      console.log("tooltip3");
    },


    forTest(temp){
      console.log("key : " + temp);
      this.key = temp;
      this.participatedMemberList();
    },

    close() {
      this.isEditMode=false;
      this.$emit('close');
    },
    openMemberSearchModal() {
      this.showMemberSearchModal = true;
    },

    closeMemberSearchModal() {
      this.showMemberSearchModal = false;
    },
    
    async participatedMemberList(){
      try {
        const response = await axios.post("http://localhost:8030/api/participatedMemberList",{
            t_key: this.key,
            project_num:this.project.project_num
        });
        this.selectedMembers = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    enterEditMode() {
    this.isEditMode = true;
    // 프로젝트 정보를 localProject에 저장
    this.localProject = { ...this.project };
    
    // 직접 수정하고 있는 변수들의 초기값 설정
    this.project_title = this.localProject.project_title;
    this.selectedStatus = this.localProject.status;
  },

  async saveChanges(event) {
    const inputs = [this.project_title, this.start_date, this.due_date];
          if (inputs.some(input => input === null || input === '')) {
          alert('하나 이상의 입력 필드가 비어 있습니다');
          event.preventDefault();
          return;
        }
        if (this.project_title.includes(',')) {
          alert('프로젝트 제목에 쉼표(,)를 사용할 수 없습니다');
          event.preventDefault();
          return;
        }
    try {
      // 수정된 내용 서버로 전송
      const projectDTO = {
      project_num: this.localProject.project_num,
      project_title: this.project_title, // 직접 수정된 값 사용
      status: this.selectedStatus,       // 직접 수정된 값 사용
      start_date: this.localProject.start_date, // localProject의 값을 사용
      due_date: this.localProject.due_date,     // localProject의 값을 사용
      project_manager: this.localProject.project_manager,
      member_num: this.loginMember.member_num
    };
    console.log("projectDTO>>>>",projectDTO);
      const members = this.selectedMembers.map(member => member.member_num);
      const response = await axios.post("http://localhost:8030/api/updateProject", {
        t_key: this.key,
        projectDTO: projectDTO,
        members: members
      });
      alert("수정 완료");

      // 로컬 상태를 업데이트합니다.
      this.localProject.project_title = this.project_title;
      this.localProject.start_date = this.start_date;
      this.localProject.due_date = this.due_date;
      this.localProject.status = this.selectedStatus;
      this.localProject.selectedMembers = this.selectedMembers;

      this.$store.dispatch('updateSelectedProject', response.data);
      this.$store.commit('updateProjectInList', response.data);
      this.isEditMode = false;
      this.$emit('close');
    } catch (error) {
      console.log(error);
    }
    },
    confirmDeletion() {
      if (confirm("정말 삭제하시겠습니까?")) {
        this.deleteProject();
      }
    },
    async deleteProject() {
      try {
        await axios.post("http://localhost:8030/api/deleteProject",{
        t_key: this.key,
        project_num:this.project.project_num 
      });
        this.$store.commit('deleteProject', this.project.project_num);
        this.$emit('close');
      } catch (error) {
        console.error('프로젝트 삭제 실패:', error);
      }
    },
    preventComma(event){
      if (event.key === ',') {
        alert("제목에 특수문자 (,)를 사용할 수 없습니다.");
        event.preventDefault();
      }
    }
  }
  }
  
  </script>
  
  <style scoped>

.create-modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.6);
    z-index: 1000;
  }
  .modal-content {
    background-color: #ffffff;
    padding: 29px;
    border-radius: 3ch;
    width: 350px;
  }
  .modal-content h2{
    color: #2e2b2beb;
    letter-spacing: 1px;
    font-size: 18px;
    margin: 25px 0px 30px 9px;
  }
  .close {
    cursor: pointer;
    float: right;
    font-size: 28px;
    margin: 0 0 10px 10px;
  }
  
  .m-container{
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
  
  .todo, .todo-detail{
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
.m-left{
    width: 99%;
} 

.status select {
    height: 30px;
    width: 100px;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 12px;
    border: 2px solid #80808030;
    color: #625151;
}

.todo span {
    margin-left: 9px;
    font-size: 12px;
    font-weight: 600;
    color: #373333e8;
    letter-spacing: 1px;
}

.todo input{
    height: 19px;
    border-radius: 3ch;
    border: 2px solid #80808030;
    padding: 5px 0px 5px 14px;
    color: #685a5a;
    font-size: 12px;
    letter-spacing: 0px;
}
.todo input:focus{
    border-color: rgb(94, 94, 214);
    border: none;
}
.pm-member{
    letter-spacing: 1px;
    font-size: 12px;
    font-weight: 600;
    padding-left: 2px;
}
.status-detail{
    border: 2px solid #80808030;
    border-radius: 2ch;
}

.status-table{
    width: 100%;
    padding: 8px;
}
.status{
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
}

.status-title {
    margin: 0px 0px 7px 9px;
    font-size: 13px;
    font-weight: 600;
    color: #373333e8;
    letter-spacing: 1px;
    font-size: 12px;
}
.status-project {
    margin: 4px 0px 7px 0px;
    color: #373333e8;
    letter-spacing: 1px;
    font-size: 11px;
    padding: 5px 8px;
    background: #efe6e65e;
    width: 59px;
    border-radius: 12px;
    text-align: center;
    font-weight: 600;
    border: 1px solid #b7b3b31a;
    letter-spacing: 2px;
}
.status-table th {
    padding: 10px 0px 10px 20px;
    font-size: 12px;
    letter-spacing: 1px;
}

.s-header{
    padding: 12px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 3px;
    background: #80808014;
    color: #373333e8;
    font-weight: 600;
}

.date-picker{
    border: none;
    width: 63%;
    height: 35px;
    font-size: 11px;
    letter-spacing: 1px;
}

.date-picker:hover{
    /* border: 1px solid rgb(39, 93, 194, 0.7); */
    cursor: pointer;
    /* border-radius: 1ch; */
}

.create-btn{
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
.create-btn button{
    width: 56px;
    padding: 7px 14px;
    place-self: flex-end;
    background-color: #cbd9cb38;
    color: #151212c9;
    border: 2px solid #cbd9cb52;
    border-radius: 1ch;
    letter-spacing: 1px;
    font-size: 11px;
    font-weight: 600;
    margin: 0px 0px 0px 11px;
}
.cancel-btn {
  margin-left: 10px;
}

.create-btn button:hover{
    cursor: pointer;
}

.click-add:hover{
  cursor: pointer;
  font-style: bold;
}

.s-body th{
  width: 46%;
}

.selected-member{
  font-size: 11px;
}

#tooltip-container {
  position: relative;
}
.tooltip {
    display: block;
    letter-spacing: -1px;
    position: absolute;
    background-color: white;
    color: #1c2b20c2;
    padding: 11px 8px;
    border-radius: 40px;
    white-space: nowrap;
    font-size: 10px;
    border: 3px dotted #184e0178;
    letter-spacing: 1px;
    font-weight: 600;
    top: -55%;
    transform: translateX(15%);
    transform: translateY(48%);
    position: fixed;
    z-index: 1000;
}

.tooltip::before {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 5px;
    border-color: transparent transparent #21750a9e transparent;
    left: 51%;
    bottom: 42px;
    transform: translateX(-53%);
}


</style>
  