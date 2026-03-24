export type Unsubscribe = () => void;
export type Listener<T> = (state: T) => void;

export function createStore<T extends object>(initial: T) {
    let state = initial;
    // Listeners are a SET of callback functions.
    const listeners = new Set<Listener<T>>();
    return {
        get: () => state,
        // set() accepts a object 'patch' of type T or a updater function.
        // Updater function updates the current state based on a callback function.
        // Hence why we are passing in the current state patch(state) as prev: T.
        set: (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
            const nextPatch = typeof patch === "function" ? patch(state) : patch;
            state = { ...state, ...nextPatch };
            for (const l of listeners) l(state);
        },
        // subscribe adds the listener/callback function to the set.
        // returns a function that will unsubscribe from the store.
        subscribe: (listener: Listener<T>): Unsubscribe => {
            listeners.add(listener);
            listener(state);
            return () => listeners.delete(listener);
        }
    }
}