
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Button } from './index';

describe('Button', () => {
  it('renders content correctly', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Submit' },
    });
    expect(wrapper.text()).toBe('Submit');
  });

  it('applies correct variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'outline' },
      slots: { default: 'Outline' },
    });
    expect(wrapper.classes()).toContain('border');
  });

  it('applies correct size classes', () => {
    const wrapper = mount(Button, {
      props: { size: 'sm' },
      slots: { default: 'Small' },
    });
    expect(wrapper.classes()).toContain('h-9');
  });
});