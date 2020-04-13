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
  @State() open = false;

  componentWillLoad() {
    this.el.shadowRoot.addEventListener("slotchange", () => {
      this.items = Array.from(this.el.querySelectorAll("my-menu-item"));
      this.items.forEach((item, i) => {
        item.slot = `item-${i}`;
      });
    });
  }

  private handleToggle(event: CustomEvent) {
    this.open = event.detail.open;
  }

  render() {
    return (
      <Host>
        <slot></slot>

        <my-dialog onOpenChanged={(event) => this.handleToggle(event)}>
          <slot slot="activator" name="label">
            Actions
            <svg
              viewBox="0 0 100 66"
              aria-label={this.open ? "Expanded" : "Collapsed"}
            >
              <polygon
                points={
                  this.open ? "0 66.6, 100 66.6, 50 0" : "0 0, 100 0, 50 66.6"
                }
              />
            </svg>
          </slot>

          <menu>
            {this.items.map((_, i) => (
              <li>
                <slot name={`item-${i}`}></slot>
              </li>
            ))}
          </menu>
        </my-dialog>
      </Host>
    );
  }
}
