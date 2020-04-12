import {
  Component,
  ComponentInterface,
  Element,
  Host,
  State,
  h,
} from "@stencil/core";

@Component({
  tag: "my-menu",
  styleUrl: "my-menu.css",
  shadow: true,
})
export class MyMenu implements ComponentInterface {
  @Element() el: HTMLElement;

  @State() items: HTMLMyMenuItemElement[] = [];

  componentWillLoad() {
    this.el.shadowRoot.addEventListener("slotchange", () => {
      this.items = Array.from(this.el.querySelectorAll("my-menu-item"));
      this.items.forEach((item, i) => {
        item.slot = `item-${i}`;
      });
    });
  }

  render() {
    return (
      <Host>
        <slot></slot>
        <menu>
          {this.items.map((_, i) => (
            <li>
              <slot name={`item-${i}`}></slot>
            </li>
          ))}
        </menu>
      </Host>
    );
  }
}
