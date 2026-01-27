import { describe, it, expect } from "vitest";
import Input from "../Input.vue";

describe("Input.vue", () => {
  it("defines the rightIconLabel prop", () => {
    // console.log('Input props:', (Input as any).props);
    const props = (Input as any).props;

    // In script setup with withDefaults, props should be an object definition
    expect(props).toHaveProperty("rightIconLabel");
    expect(props.rightIconLabel).toBeDefined();
  });
});
