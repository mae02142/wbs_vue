// keyMixin.js

export default {
    data() {
      return {
        key: 'f43f8702-d373-4074-8fe3-91a276cb89c2',
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
  