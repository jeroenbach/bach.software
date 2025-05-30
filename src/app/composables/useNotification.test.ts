import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";

import { useNotification } from "./useNotification";
import { setActivePinia, createPinia } from "./destructiblePinia";
setActivePinia(createPinia());

describe("useNotification", () => {
  beforeEach(() => {
    const { clearAll } = useNotification();
    clearAll();
  });

  describe("different instances", () => {
    it("should keep track of its own notifications and remove only those when calling clear", async () => {
      const {
        notifications: notifications1,
        add: add1,
        clear: clear1,
        clearAll: clearAll1,
      } = useNotification();
      const { notifications: notifications2, add: add2 } = useNotification();
      const {
        notifications: notifications4,
        add: add3,
        clearAll: clearAll3,
      } = useNotification();
      const {
        notifications: notifications3,
        add: add4,
        clear: clear4,
      } = useNotification();
      clearAll1();

      add1("error", "Message added by 1");
      add1("error", "Another message added by 1");
      add2("error", "Message added by 2");
      add3("error", "Message added by 3");
      add4("error", "Message added by 4");
      expect(notifications1.value.length).toBe(5);
      expect(notifications1.value).toEqual(notifications2.value);
      expect(notifications2.value).toEqual(notifications3.value);
      expect(notifications3.value).toEqual(notifications4.value);

      clear1();
      expect(notifications1.value.length).toBe(3);

      clear4();
      expect(notifications1.value).toEqual([
        {
          options: {},
          title: "Message added by 2",
          notificationId: 2,
          severity: "error",
        },
        {
          options: {},
          title: "Message added by 3",
          notificationId: 3,
          severity: "error",
        },
      ]);

      clearAll3();
      expect(notifications2.value.length).toBe(0);
    });
  });

  describe("unmounting component that created notifications", () => {
    it("should keep track of its own notifications and when parent is unmounted remove only those", async () => {
      const showParent1 = ref(true);
      const showParent2 = ref(true);
      const { notifications: notifications } = useNotification();
      const parent1 = defineComponent({
        data() {
          const { add } = useNotification();
          add("error", "Error reported from parent 1");
          add("error", "Another Error reported from parent 1");
          return {};
        },
        template: `dummy`,
      });
      const parent2 = defineComponent({
        data() {
          const { add } = useNotification();
          add("warning", "Warning reported from parent 2");
          add("warning", "Another Warning reported from parent 2");
          return {};
        },
        template: `dummy`,
      });
      const controller = defineComponent({
        components: { Parent1: parent1, Parent2: parent2 },
        data() {
          return { showParent1, showParent2 };
        },
        template: `
        <Parent1 v-if="showParent1"/>
        <Parent2 v-if="showParent2" />
        `,
      });
      mount(controller);
      expect(notifications.value.length).toBe(4);
      showParent2.value = false;
      await nextTick();
      expect(notifications.value.length).toBe(2);
      showParent1.value = false;
      await nextTick();
      expect(notifications.value.length).toBe(0);
    });
  });

  describe("adding & removing notifications", () => {
    const { notifications, add, clear } = useNotification();

    beforeEach(() => {
      clear();
    });

    it("should add error message", async () => {
      expect(notifications.value.length).toBe(0);
      add("error", "Some message for the user");
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: "Some message for the user",
          severity: "error",
        }),
      );
    });
    it("should add info message", async () => {
      expect(notifications.value.length).toBe(0);
      add("info", "Some message for the user");
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: "Some message for the user",
          severity: "info",
        }),
      );
    });
    it("should add warning message", async () => {
      expect(notifications.value.length).toBe(0);
      add("warning", "Some message for the user");
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: "Some message for the user",
          severity: "warning",
        }),
      );
    });
    it("should add success message", async () => {
      expect(notifications.value.length).toBe(0);
      add("success", "Some message for the user");
      expect(notifications.value[0]).toEqual(
        expect.objectContaining({
          title: "Some message for the user",
          severity: "success",
        }),
      );
    });
    it("should clear all notifications", async () => {
      add("error", "Some message for the user");
      add("success", "Some message for the user");
      add("warning", "Some message for the user");
      add("info", "Some message for the user");
      expect(notifications.value.length).toBe(4);
      clear();
      expect(notifications.value.length).toBe(0);
    });
  });
});
