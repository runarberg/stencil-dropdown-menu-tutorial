# my-dialog



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type      | Default |
| -------- | --------- | ----------- | --------- | ------- |
| `open`   | `open`    |             | `boolean` | `false` |


## Events

| Event         | Description | Type               |
| ------------- | ----------- | ------------------ |
| `openChanged` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [my-menu](../my-menu)

### Depends on

- [my-button](../my-button)

### Graph
```mermaid
graph TD;
  my-dialog --> my-button
  my-menu --> my-dialog
  style my-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
