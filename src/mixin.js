// keyMixin.js

export default {
    data() {
      return {
<<<<<<< HEAD
        key: '0a67404f-045f-41c1-bbfb-1a84e402ee31',
=======
        key: '09e5427c-7287-4c1f-9dae-95e7daebbd7c',
>>>>>>> projectManagement
      };
    },
    mounted() {
      this.checkInput();
    },
    methods: {
      checkInput() {
        if(document.getElementsByName('t_key').length > 0  && document.getElementsByName('t_key')[0].value){
          console.log(document.getElementsByName('t_key')[0].value);
          this.getTodo(document.getElementsByName('t_key')[0].value);
        } else {
          //console.log('not found input');
        }
      },
      getTodo(value) {
        this.key = value;
      },
      parseDate(dateString) {
        return new Date(dateString);
    }
    }
  }
  