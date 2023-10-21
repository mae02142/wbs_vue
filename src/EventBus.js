import { reactive, watch } from 'vue';

export const EventBus = {
  state: reactive({
    event: null,
    payload: null,
  }),
  listeners: {},
  emit(event, payload) {
    this.state.event = event;
    this.state.payload = payload;
  },
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    watch(
      () => this.state.event,
      (newEvent) => {
        if (newEvent === event) {
          this.listeners[event].forEach(listener => listener(this.state.payload));
        }
      }
    );
  },
  off(event) {
    delete this.listeners[event];
  }
}


