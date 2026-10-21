export const createProductStore = (listen, releaseDelay = 15000) => {
  let state = { products: [], loading: true, error: null };
  let stopListening = null;
  let consumers = 0;
  let releaseTimer = null;

  const subscribers = new Set();

  const emit = () => {
    subscribers.forEach((notify) => notify());
  };

  const startListening = () => {
    if (stopListening) return;
    stopListening = listen(
      (products) => {
        state = { products, loading: false, error: null };
        emit();
      },
      (error) => {
        state = { products: state.products, loading: false, error };
        emit();
      }
    );
  };

  const stopListeningAndReset = () => {
    if (!stopListening) return;
    stopListening();
    stopListening = null;
    state = { ...state, loading: true };
  };

  return {
    getSnapshot: () => state,

    subscribe(notify) {
      subscribers.add(notify);
      return () => subscribers.delete(notify);
    },

    acquire() {
      consumers += 1;
      if (releaseTimer) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      startListening();
    },

    release() {
      consumers = Math.max(0, consumers - 1);
      if (consumers > 0 || releaseTimer) return;

      releaseTimer = setTimeout(() => {
        releaseTimer = null;
        if (consumers === 0) stopListeningAndReset();
      }, releaseDelay);
    },
  };
};
