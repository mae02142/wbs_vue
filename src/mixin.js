// keyMixin.js

export default {
    data() {
      return {
        key: '0a67404f-045f-41c1-bbfb-1a84e402ee31',
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
  