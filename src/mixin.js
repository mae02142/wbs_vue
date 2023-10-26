// keyMixin.js

export default {
    data() {
      return {
        key: '2cc9c0bc-fba4-4091-bd4d-f25177964c28',
      };
    },
    mounted() {
      this.checkInput();
    },
    methods: {
      checkInput() {
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
  