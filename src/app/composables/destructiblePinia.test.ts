import { describe, expect, it, beforeEach } from "vitest";
import { computed, reactive, ref } from "vue";

import {
  defineDestructibleStore,
  setActivePinia,
  createPinia,
} from "./destructiblePinia";
setActivePinia(createPinia());

const storeDefinition = defineDestructibleStore("test-store", () => {
  const testRefString = ref("");
  const testRefObjectString = ref({ value: "" });
  const testRefArrayString = ref<string[]>([]);
  const testReactiveObject = reactive({ value: "" });
  const testReactiveArray = reactive<string[]>([]);
  const testComputed = computed(
    () =>
      `${testRefString.value} ${testReactiveArray[0]} ${testRefObjectString.value?.value}`,
  );

  const initialize = () => {
    testRefString.value = "test-ref-string";
    testRefObjectString.value = { value: "test-ref-object-string" };
    testRefArrayString.value = [
      "test-ref-array-string1",
      "test-ref-array-string2",
    ];
    Object.assign(testReactiveObject, {
      value: "test-reactive-object-string",
    });
    testReactiveArray.length = 0;
    testReactiveArray.push(
      "test-reactive-array-string1",
      "test-reactive-array-string2",
    );
  };
  initialize();

  return {
    reset: initialize,
    testRefString,
    testRefObjectString,
    testRefArrayString,
    testReactiveObject,
    testReactiveArray,
    testComputed,
    changeRefString: (value: string) => {
      testRefString.value = value;
    },
    changeRefArrayString: (value: string) => {
      testRefArrayString.value[0] = value;
    },
    changeRefObjectString: (value: string) => {
      testRefObjectString.value.value = value;
    },
    changeReactiveObject: (value: string) => {
      testReactiveObject.value = value;
    },
    changeReactiveArray: (value: string) => {
      testReactiveArray[0] = value;
    },
  };
});

describe("destructablePinia", () => {
  beforeEach(() => {
    const store = storeDefinition({ makeDestructable: false });
    store.reset();
  });

  it("should work correctly with ref string", async () => {
    const { testRefString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testRefString: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity

    expect(testRefString.value).toBe("test-ref-string");
    expect(store.testRefString).toBe("test-ref-string");
    expect(withoutReactivity).toBe("test-ref-string");

    testRefString.value = "first-test";
    expect(testRefString.value).toBe("first-test");
    expect(store.testRefString).toBe("first-test");
    expect(withoutReactivity).toBe("test-ref-string");

    store.testRefString = "second-test";
    expect(testRefString.value).toBe("second-test");
    expect(store.testRefString).toBe("second-test");
  });

  it("should work correctly with actions on ref string", async () => {
    const { changeRefString, testRefString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });

    expect(testRefString.value).toEqual("test-ref-string");

    changeRefString("test1");
    expect(store.testRefString).toBe("test1");
    expect(testRefString.value).toBe("test1");

    store.changeRefString("test2");
    expect(testRefString.value).toBe("test2");
    expect(store.testRefString).toBe("test2");
  });

  it("should work correctly with ref object", async () => {
    const { testRefObjectString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testRefObjectString: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity

    expect(testRefObjectString.value).toEqual({
      value: "test-ref-object-string",
    });
    expect(store.testRefObjectString).toEqual({
      value: "test-ref-object-string",
    });
    expect(withoutReactivity).toEqual({ value: "test-ref-object-string" });

    testRefObjectString.value = { value: "first-test" };
    expect(testRefObjectString.value).toEqual({ value: "first-test" });
    expect(store.testRefObjectString).toEqual({ value: "first-test" });
    expect(withoutReactivity).toEqual({ value: "test-ref-object-string" });

    testRefObjectString.value.value = "second-test";
    expect(testRefObjectString.value).toEqual({ value: "second-test" });
    expect(store.testRefObjectString).toEqual({ value: "second-test" });
    expect(withoutReactivity).toEqual({ value: "test-ref-object-string" });

    store.testRefObjectString.value = "third-test";
    expect(testRefObjectString.value).toEqual({ value: "third-test" });
    expect(store.testRefObjectString).toEqual({ value: "third-test" });
  });

  it("should work correctly with actions on ref object", async () => {
    const { changeRefObjectString, testRefObjectString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });

    expect(testRefObjectString.value).toEqual({
      value: "test-ref-object-string",
    });

    changeRefObjectString("test1");
    expect(store.testRefObjectString).toEqual({ value: "test1" });

    store.changeRefObjectString("test2");
    expect(testRefObjectString.value).toEqual({ value: "test2" });
  });

  it("should work correctly with ref array", async () => {
    const { testRefArrayString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testRefArrayString: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity

    expect(testRefArrayString.value).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);
    expect(store.testRefArrayString).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);
    expect(withoutReactivity).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);

    testRefArrayString.value = ["first-test"];
    expect(testRefArrayString.value).toEqual(["first-test"]);
    expect(store.testRefArrayString).toEqual(["first-test"]);
    expect(withoutReactivity).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);

    store.testRefArrayString = ["second-test"];
    expect(testRefArrayString.value).toEqual(["second-test"]);
    expect(store.testRefArrayString).toEqual(["second-test"]);

    store.testRefArrayString[0] = "third-test";
    expect(testRefArrayString.value).toEqual(["third-test"]);
    expect(store.testRefArrayString).toEqual(["third-test"]);
    expect(withoutReactivity).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);
  });

  it("should work correctly with actions on ref array", async () => {
    const { changeRefArrayString, testRefArrayString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });

    expect(testRefArrayString.value).toEqual([
      "test-ref-array-string1",
      "test-ref-array-string2",
    ]);

    changeRefArrayString("test1");
    expect(store.testRefArrayString).toEqual([
      "test1",
      "test-ref-array-string2",
    ]);

    store.changeRefArrayString("test2");
    expect(testRefArrayString.value).toEqual([
      "test2",
      "test-ref-array-string2",
    ]);
  });

  it("should work correctly with reactive object", async () => {
    const { testReactiveObject } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testReactiveObject: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity normally... but appearently with an reactive object not

    expect(testReactiveObject.value).toEqual({
      value: "test-reactive-object-string",
    });
    expect(store.testReactiveObject).toEqual({
      value: "test-reactive-object-string",
    });
    expect(withoutReactivity).toEqual({ value: "test-reactive-object-string" });

    Object.assign(store.testReactiveObject, { value: "first-test" });
    expect(testReactiveObject.value).toEqual({ value: "first-test" });
    expect(store.testReactiveObject).toEqual({ value: "first-test" });
    expect(withoutReactivity).toEqual({ value: "first-test" }); // still works

    testReactiveObject.value.value = "second-test";
    expect(testReactiveObject.value).toEqual({ value: "second-test" });
    expect(store.testReactiveObject).toEqual({ value: "second-test" });
    expect(withoutReactivity).toEqual({ value: "second-test" }); // still works

    store.testReactiveObject.value = "third-test";
    expect(testReactiveObject.value).toEqual({ value: "third-test" });
    expect(store.testReactiveObject).toEqual({ value: "third-test" });
  });

  it("should work correctly with actions on reactive object", async () => {
    const { changeReactiveObject, testReactiveObject } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });

    expect(store.testReactiveObject).toEqual({
      value: "test-reactive-object-string",
    });
    expect(testReactiveObject.value).toEqual({
      value: "test-reactive-object-string",
    });

    changeReactiveObject("test1");
    expect(store.testReactiveObject).toEqual({ value: "test1" });

    store.changeReactiveObject("test2");
    expect(testReactiveObject.value).toEqual({ value: "test2" });
  });

  it("should work correctly with reactive array", async () => {
    const { testReactiveArray } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testReactiveArray: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity. Not when using a reactive array

    expect(testReactiveArray.value).toEqual([
      "test-reactive-array-string1",
      "test-reactive-array-string2",
    ]);
    expect(store.testReactiveArray).toEqual([
      "test-reactive-array-string1",
      "test-reactive-array-string2",
    ]);
    expect(withoutReactivity).toEqual([
      "test-reactive-array-string1",
      "test-reactive-array-string2",
    ]);

    // With an reactive array we cannot replace the value in one go, we need to use ref() for this
    // testReactiveArray.value = ['first-test'];
    // store.testReactiveArray = ['second-test'];
    // Not possible, will replace the object and you can get in trouble later. When I did this the intialize method on the reactive object/array didn't work anymore.

    store.testReactiveArray[0] = "third-test";
    expect(testReactiveArray.value).toEqual([
      "third-test",
      "test-reactive-array-string2",
    ]);
    expect(store.testReactiveArray).toEqual([
      "third-test",
      "test-reactive-array-string2",
    ]);
    expect(withoutReactivity).toEqual([
      "third-test",
      "test-reactive-array-string2",
    ]); // Also still works
  });

  it("should work correctly with actions on reactive array", async () => {
    const { changeReactiveArray, testReactiveArray } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });

    expect(testReactiveArray.value).toEqual([
      "test-reactive-array-string1",
      "test-reactive-array-string2",
    ]);

    changeReactiveArray("test1");
    expect(store.testReactiveArray).toEqual([
      "test1",
      "test-reactive-array-string2",
    ]);

    store.changeReactiveArray("test2");
    expect(testReactiveArray.value).toEqual([
      "test2",
      "test-reactive-array-string2",
    ]);
  });
  it("should work correctly with computed", async () => {
    const { testComputed, testRefString } = storeDefinition();
    const store = storeDefinition({ makeDestructable: false });
    const { testComputed: withoutReactivity } = storeDefinition({
      makeDestructable: false,
    }); // Incorrect way, loses reactivity

    expect(testComputed.value).toBe(
      "test-ref-string test-reactive-array-string1 test-ref-object-string",
    );
    testRefString.value = "changed";
    expect(testComputed.value).toBe(
      "changed test-reactive-array-string1 test-ref-object-string",
    );
    expect(store.testComputed).toBe(
      "changed test-reactive-array-string1 test-ref-object-string",
    );
    expect(withoutReactivity).toBe(
      "test-ref-string test-reactive-array-string1 test-ref-object-string",
    );
  });
});
