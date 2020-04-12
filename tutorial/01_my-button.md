# `<my-button>`: My First Component

We are going to start with the simplest of the three components
`<my-button>`. Honestly it might be an overkill writing this out as a
component as it will be a simple styled wrapper around the native
`<button>`. But the purpose here is to get you acquainted with Stencil
before we write out more involved components:

We can get the component scaffolded by writing in our terminal:

```bash
npm run generate my-button
```

The Stencil tool will ask you if you want to create a stylesheet, spec
tests, and E2E tests for your component as well. We’re not focising on
automated tests for this tutorial, so you can uncheck the E2E and spec
test options. Leave the stylesheet option checked though, we’ll use it
later:

```
> my-components@0.0.1 generate /home/username/dropdown-menu
> stencil generate "my-button"

? Which additional files do you want to generate? ›
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    a: Toggle all
    enter/return: Complete answer
◉   Stylesheet (.css)
◯   Spec Test  (.spec.tsx)
◯   E2E Test (.e2e.ts)
```

Open the newly created `src/components/my-button.tsx`. You will see it
contains a few imports from the `@stencil/core` and an exported class
decorated with `@Component`. You’ll also notice that the class
contains a single `render` method.

Now let’s start the development server again:

```bash
npm run start
```

Let’s make the `<my-button>` elements actual buttons. So dig into the
`render` method and wrap a `<button>` around the `<slot>`.

```tsx
import { Component, ComponentInterface, Host, h } from "@stencil/core";

@Component({
  tag: "my-button",
  styleUrl: "my-button.css",
  shadow: true,
})
export class MyButton implements ComponentInterface {
  render() {
    return (
      <Host>
        <button>
          <slot></slot>
        </button>
      </Host>
    );
  }
}
```

Refresh your browser window and see we now have buttons.

There are a few takeaways here. First is the [`<slot>`
element][slot-element] we put inside the `<button>`. Slots let
consumers write their own markup inside our component. Notice how our
consumer in `src/index.html` says:

```html
<my-button>Action 1</my-button>
```

Well… Our `<slot>` will be replaced by the text “Action 1”. Slots can
include custom markup as well, meaning if a consumer writes:

```html
<my-button>
  <strong>Warning</strong>
  This is <em>dangerous</em>!
</my-button>
```

The correct parts will by strong and emphasized. Go ahead and try it!

The next new takeaway here is the [`<Host>` element][host-element].
This is a functional component provided by Stencil. We can use it to
set attributes and listeners to the host element (in our case
`<my-button>`). We’re not really using it for anything now but it does
us no harm to leave it standing.

Thirdly is the `render` method. This method—as the name
suggests—renders our component to the DOM tree. We can think of it as
the means to keep our component in sync with all the state we provide
to it. We can pass conditionals, loops, or reactive data inside it and
it will render the component to match whatever the state is at any
time.

And Finally we have the [`@Component` decorator][component-decorator].
This will tell the Stencil compiler to create a web component out of
this class. We provide this decorator with a tag name `my-button`, and
optionally with a path to a stylesheet (which we’ll be using in a
moment). The `shadow: true` part makes sure our component is isolated
from the rest of the DOM tree. If we set it to `false` we risk global
styles bleeding into our component, or an ID collision with a
different element on the page.

[component-decorator]: https://stenciljs.com/docs/component#component-decorator
[host-element]: https://stenciljs.com/docs/host-element#host
[slot-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot

## Styling the Button

Phew! Now lets do something more fun. Open `my-button.css` and make
our button a lot prettier. Notice the default style says:

```css
:host {
  display: block;
}
```

The [`:host` pseudo-class][host-pseudo-class] refers to the
`my-button` element it self (the host). We don’t really care how it is
displayed, so lets remove the `display` rule. But the `:host` block is
handy for defining our [custom properties][css-custom-props] (or CSS
variables).

```css
:host {
  --background: var(--button-background, ivory);
  --background-hover: var(--button-background-hover, gold);
  --color: var(--button-color, rebeccapurple);
}

button {
  background: var(--background);
  border: 2px solid currentcolor;
  border-radius: 1ex;
  color: var(--color);
  cursor: pointer;
  padding: 0.5ex 1em;
}

button:hover {
  --background: var(--background-hover);
}
```

Refresh the page and now our buttons look much nicer.

Notice how we define our custom properties in terms of other custom
properties:

```css
--color: var(--button-color, rebeccapurple);
```

This is so a parent can set the `--button-color` and it will overwrite
our default value (`rebeccapurple`). Unlike other styles custom
properties will cascade down into the shadow dom.

You can try it by opening the style inspector in your browser’s
developer tools and adding a rule to you root html element:

```css
--button-color: firebrick;
```

[host-pseudo-class]: https://developer.mozilla.org/en-US/docs/Web/CSS/:host
[css-custom-props]: https://developer.mozilla.org/en-US/docs/Web/CSS/--*

## Passing Properties

Sometimes buttons can be disabled. Say that an action is not allowed
at the moment then disabling the button will prevent user frustration
when they click the button and nothing happens. Lets disable the last
button in the demo menu (`index.html`).

```html
<!-- src/index.html -->

<my-menu>
  <!-- ... -->
  <my-menu-item>
    <my-button disabled>Action 3</my-button>
  </my-menu-item>
</my-menu>
```

Uh-oh! We can still click it, what’s wrong? It turns out that we
neglected to define what happens when our custom button has any
attributes. We can fix that by importing the [`@Prop`
decorator][prop-decorator] and adding it to our class.

First lets add some styles so we can better tell when we have
succeeded our mission:

```css
/* src/components/my-button/my-button.css */

:host {
  /* ... */
  --background-disabled: var(--button-background-disabled, ivory);
  --color-disabled: var(--button-color-disabled, thistle);
}

/* ... */

button:disabled {
  --background: var(--background-disabled);
  --color: var(--color-disabled);

  cursor: not-allowed;
}
```

Next we must import the `@Prop` decorator from `@stencil/core` which
we use to decorate a new boolean property in our class named
`disabled`. We’ll then use this new property to conditionally set the
disabled attribute on the child button in the render function:

```tsx
// src/components/my-button/my-button.tsx

import { Prop /* ... */ } from "@stencil/core";

@Component(/* ... */)
export class MyButton implements ComponentInterface {
  // Setting reflect to true, adds the attribute on the host
  // element (`<my-button>`) as well.
  @Prop({ reflect: true }) disabled: boolean;

  render() {
    return (
      <Host>
        <button disabled={this.disabled}>
          <slot></slot>
        </button>
      </Host>
    );
  }
}
```

Mirroring a string attribute is similar. This time `type` which
defaults to `submit`:

```tsx
export class MyButton implements ComponentInterface {
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true }) type: "button" | "reset" | "submit" = "submit";

  render() {
    return (
      <Host>
        <button disabled={this.disabled} type={this.type}>
          <slot></slot>
        </button>
      </Host>
    );
  }
}
```

Lets add one more property `weight` which allows us to control the
visual weight of the button (slim, normal, or strong):

```tsx
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
        <button class={classMap} disabled={this.disabled} type={this.type}>
          <slot></slot>
        </button>
      </Host>
    );
  }
}
```

```css
/* src/components/my-button/my-button.css */

/* ... */

button.weight-slim {
  border: none;
  background: transparent;
  padding: 0;
  text-decoration: underline;
}

button.weight-strong {
  background: var(--color);
  border-color: var(--color);
  color: white;
}
```

Feel free to alter the attributes your `<my-button>`s in
`src/index.html` to test out these new properties.

[prop-decorator]: https://stenciljs.com/docs/properties
