// keyMixin.js

export default {
    data() {
      return {
        key: '9040b168-5d88-4ccd-99aa-f78a77e1c815',
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
  