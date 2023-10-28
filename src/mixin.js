// keyMixin.js

export default {
    data() {
      return {
        key: 'eeb30819-0fa2-468c-ab58-a2abe15f79f3',
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
  