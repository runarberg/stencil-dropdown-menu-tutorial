# Write A Custom Dropdown Menu With Stencil

Our goal for this tutorial is to write a custom dropdown menu in
[Stencil][stencil] that compiles to a custom element `<my-menu>`
where consumers can write something like:

```html
<my-menu>
  <my-menu-item>
    <my-button>Action 1</my-button>
  </my-menu-item>

  <my-menu-item>
    <my-button>Action 2</my-button>
  </my-menu-item>

  <my-menu-item>
    <my-button>Action 3</my-button>
  </my-menu-item>
</my-menu>
```

By the end of this tutorial you should have some basic understanding
of how to create basic web components using Stencil, as well as give
you the foundational understanding of web components needed for the
task.

This tutorial will not go into detail for every feature that Stencil
provides, nor will it try to give you complete understanding of web
components. Refer to the [Stencil docs][stencil-docs] for the former,
and [MDN][mdn] for the latter.

[mdn]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[stencil]: https://stenciljs.com
[stencil-docs]: https://stenciljs.com/docs/introduction

## Kickstart the Project

We begin our project by writing:

```bash
npm init stencil component my-components
```

This pulls the Stencil starter pack and tells it to start a new
component library called `my-component`. It will also create basic
_Hello, World!_ component under `src/components/my-component`. You can
see it in action by typing:

```bash
npm start
```

This will open up a browser window in <http://localhost:3333> showing
your component in action.

If you open `src/index.html` you will see how this component is consumed:

```html
<!DOCTYPE html>
<html>
  <!-- ... -->

  <body>
    <my-component
      first="Stencil"
      last="'Don't call me a framework' JS"
    ></my-component>
  </body>
</html>
```

We are going to write our goal structure there now and worry about
implementing each component later. So go ahead and add this to the
body of the HTML file:

```html
<!-- src/index.html -->

<!-- ... -->

<body>
  <my-menu>
    <my-menu-item>
      <my-button>Action 1</my-button>
    </my-menu-item>

    <my-menu-item>
      <my-button>Action 2</my-button>
    </my-menu-item>

    <my-menu-item>
      <my-button>Action 3</my-button>
    </my-menu-item>
  </my-menu>
</body>
```

You can also go ahead and delete the `src/components/my-component`
directory as well as `src/utils`, we won’t be needing these during
this tutorial.
