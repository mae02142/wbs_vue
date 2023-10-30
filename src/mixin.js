// keyMixin.js

export default {
    data() {
      return {
        key: '355293a5-485b-4f53-9964-6a26549030c2',
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
  