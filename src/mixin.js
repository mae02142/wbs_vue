// keyMixin.js

export default {
    data() {
      return {
        key: '2d434819-953d-4edb-b7ff-5f8f91e4164b',
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
  