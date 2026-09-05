
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import InputComponent from './InputComponent.vue';

describe('Input', () => {
  it('renders with default value', () => {
    const wrapper = mount(InputComponent, {
      props: { modelValue: 'test' },
    });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('test');
  });

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(InputComponent);
    const input = wrapper.find('input');
    
    await input.setValue('new value');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value']);
  });
});
