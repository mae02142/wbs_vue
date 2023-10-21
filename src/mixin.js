// keyMixin.js

export default {
    data() {
      return {
        key: 'c4719e85-1933-4dbf-8acd-8139e0f227af',
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
  