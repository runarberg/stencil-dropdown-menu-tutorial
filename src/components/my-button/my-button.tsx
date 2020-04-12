import { Component, ComponentInterface, Prop, Host, h } from "@stencil/core";

@Component({
  tag: "my-button",
  styleUrl: "my-button.css",
  shadow: true,
})
export class MyButton implements ComponentInterface {
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true }) type: "button" | "reset" | "submit" = "submit";
  @Prop() weight: "slim" | "normal" | "strong" = "normal";

  render() {
    const classMap = {
      "weight-slim": this.weight === "slim",
      "weight-normal": this.weight === "normal",
      "weight-strong": this.weight === "strong",
    };

    return (
      <Host>
        <button
          class={classMap}
          type={this.type}
          disabled={this.disabled}
          part="button"
        >
          <slot></slot>
        </button>
      </Host>
    );
  }
}
