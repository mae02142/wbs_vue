// keyMixin.js

export default {
    data() {
      return {
        key: '4c11e20b-3ee8-4f57-8f0a-701e36c882b2'
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
  