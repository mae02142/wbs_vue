// keyMixin.js

export default {
    data() {
      return {
        key: '98e43b8f-6caf-4ceb-b382-744cf8b426d8',
      };
    },
    mounted() {
      this.checkInput();
    },
    methods: {
      checkInput() {
        //console.log('checkInput');
        if(document.getElementsByName('tKey').length > 0  && document.getElementsByName('tKey')[0].value){
          console.log(document.getElementsByName('tKey')[0].value);
          this.getTodo(document.getElementsByName('tKey')[0].value);
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
  