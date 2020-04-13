# `<my-dialog>`: Adding The Dropdown Feature

A dropdown menu is really just a menu inside a non-modal dialog. So
lets create our dialog wrapper (like before select CSS and skip spec
and E2E tests):

```bash
npm run generate my-dialog
```

Lets be wishful and wrap our menu inside it (as if it was ready
already):

```tsx
// src/components/my-menu/my-menu.tsx

@Component(/* ... */)
export class MyMenu implements ComponentInterface {
  // ...

  render() {
    return (
      <Host>
        <slot></slot>

        <my-dialog>
          <slot slot="activator" name="label">
            Actions
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
```

So `<my-dialog>` should have an _activator_ slot—where we will place
our label for toggling the menu—and a main slot for the dialog
body—where we will place the menu it self.

## Event Handling

Lets create the `<my-dialog>` component:

```bash
npm run generate my-dialog
# Select CSS, unselect spec and E2E
```

And edit `src/components/my-dialog/my-dialog.tsx` like this:

```tsx
import { Component, ComponentInterface, Host, Prop, h } from "@stencil/core";

@Component({
  tag: "my-dialog",
  styleUrl: "my-dialog.css",
  shadow: true,
})
export class MyDialog implements ComponentInterface {
  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  render() {
    return (
      <Host>
        {/* Add a button with a click listener */}
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
```

The `<dialog>` element has mixed support between browsers so lets add
some styles in `src/components/my-dialog/my-dialog.css` now to make it
consistent:

```css
:host {
  position: relative;
}

dialog {
  border: 1px solid thistle;
  border-radius: 1ex;
  display: none;
  inline-size: max-content;
  inset-block-start: calc(100% + 5px);
  inset-inline-end: auto;
  inset-inline-start: 0;
  padding: 0;
  position: absolute;
}

dialog[open] {
  display: block;
}
```

Notice in the `tsx` file that the activator button has an `onClick`
attribute that mutates `this.open`. This is one way to attach an event
listener. When we click the activator button on our demo page the
function inside the handler will run. Another way is with the
[`@Listen` decorator][listen-decorator], lets use that one closes the
dialog when the user hits <kbd>Esc</kbd>, and another that closes when
the user clicks outside the menu:

```tsx
// src/components/my-dialog/my-dialog.tsx

import { Element, Listen /* ... */ } from "@stencil/core";

@Component(/* ... */)
export class MyDialog implements ComponentInterface {
  @Element() el: HTMLElement;

  // ...

  @Listen("keydown", { target: "window" })
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.open = false;
    }
  }

  @Listen("click", { target: "window" })
  handleWindowClick(event: MouseEvent) {
    // Only close if we click outside the shadow root
    if (!event.composedPath().includes(this.el.shadowRoot)) {
      this.open = false;
    }
  }

  // ...
}
```

## Emitting Events

Say we want to add an icon at the end of the toggle button that points
down when the menu is collapsed, and up when it is expanded. I guess
`<my-dialog>` will need to tell `<my-menu>` when it opens or closes.
We can do that with the [`@Event` decorated][event-decorator] method
that we’ll fire inside a [`@Watch` decorated][watch-decorator] method.
Let’s add these to `src/components/my-dialog/my-dialog.tsx`:

```tsx
import { Event, EventEmitter, Watch /* ... */ } from "@stencil/core";

@Component(/* ... */)
export class MyDialog implements ComponentInterface {
  // ...

  @Watch("open")
  openChangedHandler(open: boolean) {
    this.openChanged.emit({ open });
  }

  @Event() openChanged: EventEmitter;

  // ...
}
```

Now listen for this event on the menu in
`src/components/my-menu/my-menu.tsx`:

```tsx
@Component(/* ... */)
export class MyMenu implements ComponentInterface {
  // ...

  @State() open = false;

  private handleToggle(event: CustomEvent) {
    this.open = event.detail.open;
  }

  render() {
    return (
      <Host>
        {/* ... */}

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

          {/* ... */}
        </my-dialog>
      </Host>
    );
  }
}
```

And add some styles:

```css
// src/components/my-menu/my-menu.css

/* ... */

slot[name="label"] {
  align-items: center;
  display: flex;
}

slot[name="label"] svg {
  fill: currentcolor;
  block-size: 1em;
  inline-size: 0.666em;
  margin-inline-start: 1ex;
}
```

And there we have it: A simple dropdown menu component written in
Stencil.

[event-decorator]: https://stenciljs.com/docs/events#event-decorator
[listen-decorator]: https://stenciljs.com/docs/events#listen-decorator
[watch-decorator]: https://stenciljs.com/docs/reactive-data#watch-decorator
