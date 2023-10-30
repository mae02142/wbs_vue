<template>
    <div v-if="visible" class="create-modal">
      <div class="modal-content">
        <span @click="close" class="close">&times;</span>
        <h3>프로젝트 생성</h3>
        <div class="m-container">
            <div class="m-left">
                <div class="todo">
                    <span class="project-title">프로젝트명</span>
                    <input v-model="project_title" placeholder="프로젝트명 입력" @keyup.prevent="preventComma"/>
                </div>
            </div>
                <div class="status">
                    <span class="status-title">진행 상황</span>
                    <select class="do-select" name="status" v-model="selectedStatus" v-bind="status">
                      <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                      {{ option.text }}
                      </option>
                    </select>
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
                                    <td class="pm-member">{{ member.member_name }}</td>
                                  </tr>
                                  <tr>
                                    <th>참여 인원</th>
                                      <td @click="openMemberSearchModal" class="click-add">
                                        <div v-if="hasSelectedMembers">
                                        <span v-for="member in selectedMembers" :key="member.member_num" class="selected-member">
                                          {{ member.div_name }} {{ member.member_name }} {{ member.rank }}<br>
                                        </span>
                                        </div>
                                        <span v-else class="member-add">+add</span>
                                      </td>
                                </tr>
                                <tr>
                                    <th>시작일</th>
                                    <td><input type="date" class="date-picker" v-model="start_date" :max="due_date"></td>
                                </tr>
                                <tr>
                                    <th>마감일</th>
                                    <td><input type="date" class="date-picker" v-model="due_date" :min="start_date"></td>
                                </tr>
                            </tbody>
                        </table>
                      </div>
                    </div>
                    <MemberSearchModal :visible="showMemberSearchModal" @close="closeMemberSearchModal"
                    @update-selected-members="updateSelectedMembers">
                    </MemberSearchModal>
                    <div class="create-btn"> 
                    <button @click="createProject($event)">확인</button>
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
    name:"CreateProjectModal",
    mixins:[mixin],
    inject:["eventBus"],
    components:{MemberSearchModal},
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        project_title: '',
        start_date: '',
        due_date:'',
        projectDuration: '',
        showMemberSearchModal: false,
        member:'',
        selectedMembers: [],
        hasSelectedMembers: false,
        selectedStatus: 'todo',
        statusOptions: [
        { value: 'todo', text: '예정' },
        { value: 'ongoing', text: '진행중' },
        { value: 'done', text: '완료' },
      ],
      };
    },
    mounted(){
      this.searchPM();
    },
    methods: {
    updateSelectedMembers(updatedMembers) {
      this.selectedMembers = updatedMembers;
      this.hasSelectedMembers = this.selectedMembers.length > 0;
  },

      close() {
        this.setClearData();
        this.$emit('close');
      },
      setClearData(){
        this.project_title='';
        this.selectedMembers=[],
        this.start_date= '',
        this.due_date='',
        this.selectedStatus='todo'

      },
      openMemberSearchModal() {
        this.showMemberSearchModal = true;
      },

      closeMemberSearchModal() {
        this.showMemberSearchModal = false;
      },

      triggerToast(param) {
        this.eventBus.emit('toast-event', param);
      },
    
      async searchPM(){
        try {
        const response = await axios.get("http://localhost:8030/api/createPM?t_key="+this.key);
        this.member = response.data;
        this.$store.commit('setLoginMember', response.data);

      } catch (error) {
        console.log(error);
      }
      },
      //프로젝트 생성
      async createProject(event) {
        const inputs = [this.project_title, this.start_date, this.due_date];
          if (inputs.some(input => input === null || input === '')) {
          this.triggerToast({'type':2, 'text':'하나 이상의 입력 필드가 비어 있습니다'});
          event.preventDefault();
          return;
        }
        if (this.project_title.includes(',')) {
          this.triggerToast({'type':4, 'text':'프로젝트 제목에 쉼표(,)를 사용할 수 없습니다'});
          event.preventDefault();
          return;
        }
        if(this.start_date===this.due_date){
          this.triggerToast({'type':2, 'text':'프로젝트 기간은 최소 2일 이상으로 선택하십시오'});
          event.preventDefault();
          return;
        }
        try {
          const projectDTO = {
              project_title: this.project_title,
              status: this.selectedStatus,
              start_date:this.start_date,
              due_date:this.due_date,
              project_manager: this.member.member_name,
              member_num: this.member.member_num
          };
          const members = this.selectedMembers.map(member => member.member_num);
          const response = await axios.post("http://localhost:8030/api/createProject", {
            t_key: this.key,
            projectDTO: projectDTO,
            members:members
        });
        this.$emit('projectCreated', response.data);
        // 멤버 정보를 Vuex 스토어에 직접 저장
        const project = response.data;
        response.data.member_list=this.selectedMembers;
        project.member_list.push(this.$store.state.loginMember);
        this.$store.commit('setSelectedProject', project);
        // window.ws.send(
        //     members +","
        //     +response.data.project_num +","
        //     +response.data.project_title
        //   );
        
        this.setClearData();
        this.$emit('close');
      } catch (error) {
        console.log(error);
      }
    },
    preventComma(event){
      if (event.key === ',') {
        this.triggerToast({'type':2, 'text':'제목에 특수문자 (,)를 사용할 수 없습니다.'});
        event.preventDefault();
      }
    }
    }
  };
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
    z-index: 10000;
  }
  .modal-content {
    background-color: #ffffff;
    padding: 27px 39px 28px 39px;
    border-radius: 4ch;
    width: 320px;
  }

  .modal-content h3 {
    color: #030b01b8;
    letter-spacing: 2px;
    font-size: 13px;
    margin: 40px 0px 3px 0px;
    text-align: center;
    padding: 5px 5px;
    border-radius: 20px;
    background: #ececec59;
  }
  .close {
    cursor: pointer;
    float: right;
    font-size: 21px;
    margin: 0 0 10px 10px;
  }
  
  .m-container{
      display: flex;
      flex-direction: column;
      gap: 12px;
  }
  .project-title {
    margin: 20px 0px -3px 7px;
    letter-spacing: 1px;
    font-size: 12px;
    color: #211f1fa8;
    font-weight: 600;
  }
  .todo, .todo-detail{
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
.m-left{
    width: 99%;
} 

.todo input{
    height: 23px;
    border-radius: 7ch;
    border: 2px solid #80808030;
    padding: 2px 20px 2px 16px;
    font-size: 12px;
    letter-spacing: 1px;
}
.todo input:focus{
    border-color: rgb(94, 94, 214);
    border: none;
}

.status-title{
    margin: 0px 0px 6px 6px;
    font-weight: 600;
    font-size: 12px !important;
    color: #211f1fa8;
    letter-spacing: 1px;
    font-size: 13px;
}

.status-detail{
    border: 2px solid #80808030;
    border-radius: 2ch;
}

.status-table{
    width: 100%;
    padding: 10px;
}
.status{
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
}

.status-table th {
    padding: 10px 0px 10px 30px;
    font-size: 12px;
    letter-spacing: 1px;
}

.s-header{
    color: #211f1fa8;
    padding: 12px;
    text-align: center;
    font-size: 12px;
    letter-spacing: 3px;
    background: #80808014;
    font-weight: 600;
}
.do-select{
    height: 30px;
    width: 100px;
    border-radius: 20px;
    padding: 5px 10px;
    font-size: 12px;
    border: 2px solid #80808030;
    color: #625151;
}
.pm-member{
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: normal;
  padding-left: 4px;
}
.date-picker{
    border: none;
    width: 66%;
    height: 37px;
    font-size: 11px;
    letter-spacing: 1px;
}

.date-picker:hover{
    cursor: pointer;
}

.create-btn{
    display: flex;
    justify-content: center;
    margin-top: 9px;
}
.create-btn button{
    width: 80px;
    padding: 7px;
    place-self: flex-end;
    background-color: #cbd9cb4a;
    color: #151212;
    border: 2px solid #cbd9cb70;
    border-radius: 2ch;
    letter-spacing: 2px;
    font-size: 11px;
}

.create-btn button:hover{
    cursor: pointer;
}

.click-add {
  font-size: 12px;
  letter-spacing: 0px;
  font-weight: normal;
  padding-left: 4px;
}
.click-add:hover{
  cursor: pointer;
  font-style: bold;
}

.s-body th{
  min-width: 65px;
}

.selected-member{
  font-size: 11px;
}
.member-add {
  border: 1px solid #cbd9cbeb;
    background: #cbd9cbeb;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 12px;
    letter-spacing: 3px;
}
  </style>
  