import type {
  DefineSetupStoreOptions,
  _ExtractStateFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractActionsFromSetupStore,
  StoreGeneric,
  Pinia,
  Store,
  _ActionsTree,
  StoreState,
  PiniaCustomStateProperties,
  StoreGetters,
} from "pinia";
import {
  defineStore as defineStoreInternal,
  storeToRefs,
  createPinia,
  setActivePinia,
} from "pinia";
import type { ComputedRef, Ref, ToRef, ToRefs } from "vue";

/**
 * Please use the defineDestructibleStore;
 * @deprecated Please use the defineDestructibleStore */
const defineStore = defineStoreInternal;

export { createPinia, setActivePinia, type Pinia };

type ToComputedRefs<T> = {
  [K in keyof T]: ToRef<T[K]> extends Ref<infer U>
    ? ComputedRef<U>
    : ToRef<T[K]>;
};
/**
 * Extracts the return type for `storeToRefs`.
 * Will convert any `getters` into `ComputedRef`.
 */
export type StoreToRefs<SS> = ToRefs<
  StoreState<SS> & PiniaCustomStateProperties<StoreState<SS>>
> &
  ToComputedRefs<StoreGetters<SS>>;

/**
 * Conditional return type, either destructable or not.
 */
type StoreReturnType<T, Id extends string, SS> = T extends true
  ? _ExtractActionsFromSetupStore<SS> &
      StoreToRefs<
        Store<
          Id,
          _ExtractStateFromSetupStore<SS>,
          _ExtractGettersFromSetupStore<SS>,
          _ActionsTree
        >
      >
  : Store<
      Id,
      _ExtractStateFromSetupStore<SS>,
      _ExtractGettersFromSetupStore<SS>,
      _ExtractActionsFromSetupStore<SS>
    >;

/**
 * Return type of `defineDestructibleStore()`. Function that allows instantiating a store.
 */
export declare interface StoreDefinition<Id extends string, SS> {
  /**
   * Returns a store, creates it if necessary.
   *
   * @param options - allows to pass extra options, like whether the store should be destructable or not, depending on how you want to use it.
   * @param pinia - Pinia instance to retrieve the store
   * @param hot - dev only hot module replacement
   */
  (
    options?: { makeDestructable: true },
    pinia?: Pinia | null | undefined,
    hot?: StoreGeneric,
  ): StoreReturnType<true, Id, SS>;
  (
    options?: { makeDestructable: false },
    pinia?: Pinia | null | undefined,
    hot?: StoreGeneric,
  ): StoreReturnType<false, Id, SS>;

  /**
   * Id of the store. Used by map helpers.
   */
  $id: Id;
  /* Excluded from this release type: _pinia */
}

/** Creates a store that is invokeable in a destructable matter (an object with properties that are Refs) or as a reactive object */
export const defineDestructibleStore = <Id extends string, SS>(
  id: Id,
  storeSetup: () => SS,
  options?: DefineSetupStoreOptions<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>,
    _ExtractActionsFromSetupStore<SS>
  >,
) => {
  const definition = defineStore(id, storeSetup, options);

  const intializer = (
    options = { makeDestructable: true },
    pinia?: Pinia | null | undefined,
    hot?: StoreGeneric,
  ): StoreReturnType<false, Id, SS> | StoreReturnType<true, Id, SS> => {
    const store = definition(pinia, hot);

    if (options?.makeDestructable === false) {
      return store;
    }

    // Store without its actions
    const gettersAndState = storeToRefs(store as StoreGeneric);
    // now include the actions and the reactive props for the getters and state
    return {
      ...store,
      ...gettersAndState,
    };
  };
  intializer.$id = id;

  return intializer as StoreDefinition<Id, SS>;
};
