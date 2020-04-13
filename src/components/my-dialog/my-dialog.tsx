import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Listen,
  Prop,
  Watch,
  h,
} from "@stencil/core";

@Component({
  tag: "my-dialog",
  styleUrl: "my-dialog.css",
  shadow: true,
})
export class MyDialog implements ComponentInterface {
  @Element() el: HTMLElement;

  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  @Watch("open")
  openChangedHandler(open: boolean) {
    this.openChanged.emit({ open });
  }

  @Event() openChanged: EventEmitter;

  @Listen("keydown", { target: "window" })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.open = false;
    }
  }

  @Listen("click", { target: "window" })
  handleWindowClick(event: MouseEvent) {
    if (!event.composedPath().includes(this.el.shadowRoot)) {
      this.open = false;
    }
  }

  render() {
    return (
      <Host>
        <my-button
          onClick={() => {
            this.open = !this.open;
          }}
        >
          <slot name="activator">Activate</slot>
        </my-button>

        <dialog open={this.open}>
          <slot></slot>
        </dialog>
      </Host>
    );
  }
}
