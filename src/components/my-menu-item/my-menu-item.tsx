import { Component, ComponentInterface, Host, h } from '@stencil/core';

@Component({
  tag: 'my-menu-item',
  shadow: true,
})
export class MyMenuItem implements ComponentInterface {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
