
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TextareaComponent from './TextareaComponent.vue';

describe('Textarea', () => {
  it('renders with model value', () => {
    const wrapper = mount(TextareaComponent, {
      props: { modelValue: 'multi\nline' },
    });
    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toBe('multi\nline');
  });

  it('emits update:modelValue', async () => {
    const wrapper = mount(TextareaComponent);
    const textarea = wrapper.find('textarea');
    
    await textarea.setValue('updated text');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
