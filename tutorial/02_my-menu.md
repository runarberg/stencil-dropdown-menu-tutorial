# `<my-menu>`: A More Involved Example

Next up are the menu components. These are actually two components,
`<my-menu>` and `<my-menu-item>`. You will see why we need two
seperate components in a bit. Let’s scaffold them just like we did
with the button (we will only need CSS for `my-menu`).

```bash
npm run generate my-menu-item
# Uncheck CSS, spec, and E2E

npm run generate my-menu
# Keep CSS, but uncheck spec and E2E
```

We don’t need to touch `my-menu-item` for now, so lets concentrate on
`my-menu` for a bit. We know we want to add a `<menu>` there somewhere
in the render method. But then we hit a snag, how can we express each
child `<my-menu-item>` as an item of that menu:

```tsx
import { Component, ComponentInterface, Host, h } from '@stencil/core';

@Component({
  tag: 'my-menu',
  styleUrl: 'my-menu.css',
  shadow: true,
})
export class MyMenu implements ComponentInterface {
  render() {
    return (
      <Host>
        <menu>
          <li>
            <!-- XXX: All children are inside one `<li>` -->
            <slot></slot>
          </li>
        </menu>
      </Host>
    );
  }
}
```

We will need to collect all the menu-items into an array so we can map
the contents (now you see why we created that component earlier).
Enter the [`@State` decorator][state-decorator].

[state-decorator]: https://stenciljs.com/docs/state

## Managing Internal State

Stencil has a few [lifecycle methods][lifecycle-methods]. For now
let’s concern us with the `componentWillLoad` which fires after the
component is first connected to the DOM. We can use that to collect
the contents of the host. We also need access to component element it
self to find all the child `<my-menu-item>`s. For that we use the
[`@Element` decorator][element-decorator]:

```jsx
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
  // This will be our host element.
  @Element() el: HTMLElement;

  @State() items: HTMLMyMenuItemElement[] = [];

  // This will fire once after the component is connected.
  componentWillLoad() {
    // Collect all `<my-menu-item>`s into an array.
    this.items = Array.from(this.el.querySelectorAll("my-menu-item"));
  }

  render() {
    return (
      <Host>
        <menu>
          {this.items.map((item) => (
            <li>{item.textContent}</li>
          ))}
        </menu>
      </Host>
    );
  }
}
```

This is an improvement, but now we lost our buttons. Notice how we’ve
swapped the `<slot>` for `this.items.map`; and how the mapping
function only returns the text content of each element. Thats a
problem. We somehow need to keep a slot for each found menu item and
assign it to that item specifically. Lucky for us, slots can be named,
and if we add a [`slot` attribute][slot-attr] with a matching value of
a named slot, it will be added to that slot. For example:

```html
<template>
  <em><slot name="em"></slot></em>
  <strong><slot name="strong"></slot></strong>
</template>
<span slot="strong">
  This will go to the “strong” slot above
</span>
<span slot="em">
  This will go to the “em” slot above
</span>
```

In our demo we can dynamically add as many slot as we need in our
render function; each with a specific name. We can then manipulate the
slot attribute of each found `<my-menu-item>` element to match a
specific named slot. So in essence:

```tsx
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
    this.items = Array.from(this.el.querySelectorAll("my-menu-item"));
    this.items.forEach((item, i) => {
      item.slot = `item-${i}`;
    });
  }

  render() {
    return (
      <Host>
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
```

Bingo! But there is a problem. If the consumer changes the slot (say
adds a menu item) after it connected the custom element to the DOM, we
won’t have a slot for it. Or if it removes an item, we are stuck with
an extra list item. I’ll leave it as an exercise to recreate the
bug. But to fix it we’ll re-intruduce the main `<slot>` and attach a
[`slotchange` event] listener, which will fire whenever one of our
slots changes.

```tsx
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
```

Now that we have our menu we can style it in `my-menu.css`.

[element-decorator]: https://stenciljs.com/docs/host-element#element-decorator
[lifecycle-methods]: https://stenciljs.com/docs/component-lifecycle
[slotchange-event]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/slotchange_event

## Styling (Part 2)

Buttons inside the menu should look differently then normal
buttons. In particular the borders are visually distructive so we must
get rid of them. Lets try to do that in `my-menu.css`:

```css
/* src/components/my-menu/my-menu.css */

menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

my-button {
  /* This won’t work */
  border: none;
}
```

This fixed the menu style, but the borders are still there, why? Turns
out that we put the borders on the child button element inside the
shadow DOM, and styles inside the shadow DOM are isolated from style
rules defined outside of it. So even if we’d select `my-button button`
it still wouldn’t work. What can we do?

### Shadow Parts

We saw when we styled the button previously that CSS custom properties
can penetrate the shadow barrier, so we could define the border in
`my-button.css` with:

```css
/* src/components/my-button/my-button.css */

:host {
  --border-width: var(--button-border-width, 2px);
}

button {
  border-color: var(--color);
  border-style: solid;
  border-width: var(--border-width);
}
```

But there is another way. Authors can also mark parts of the structure
as available for styling using the [`part` attribute][part-attr]. In a
stylesheet consumer can then access the part using the [`::part`
pseudo-element][part-pseudo-el]. So lets try that.

First add the part attribute to our button in `my-button.tsx`, lets
name it intuitively “button”:

```tsx
// src/components/my-button/my-button.tsx

@Component(/* ... */)
export class MyButton implements ComponentInterface {
  // ...

  render() {
    // ...

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
```

Now lets try to access it in `my-menu.css`:

```css
/* src/components/my-menu/my-menu.css */

/* ... */

my-button::part(button) {
  /* This still won’t work */
  border: none;
}
```

This still won’t work because `my-menu` isn’t actually the consumer of
the `my-button` component. We have to go all the way back to
`index.html` to find the real consumer. So we need to export something
like a global stylesheet that the users of our component library can
import. So let’s to that.

[part-attr]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part
[part-pseudo-el]: https://developer.mozilla.org/en-US/docs/Web/CSS/::part

### Global Stylesheets

Stencil provides a way to export [global styles][global-styles]. First
let’s create the stylesheet in `src/global/style.css`:

```css
my-menu my-menu-item my-button::part(button) {
  border: none;
}
```

Then add this file to the `globalStyle` field in `stencil.config.ts`.

```ts
export const config: Config = {
  // ...
  globalStyle: "src/global/style.css",
};
```

Finally import it in your `src/index.html`:

```html
<head>
  <!-- ... -->
  <link rel="stylesheet" href="/build/my-components.css" />
</head>
```

Now restart the stencil server, refresh the page and see your
borderless menu buttons.

[global-styles]: https://stenciljs.com/docs/config#globalstyle
[slot-attr]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/slot
