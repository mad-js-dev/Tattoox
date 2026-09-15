
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Badge } from './index';

describe('Badge', () => {
  it('renders content correctly', () => {
    const wrapper = mount(Badge, {
      slots: { default: 'Test Badge' },
    });
    expect(wrapper.text()).toBe('Test Badge');
  });

  it('applies correct variant classes', async () => {
    const wrapper = mount(Badge, {
      props: { variant: 'destructive' },
      slots: { default: 'Error' },
    });
    // Check if it has the destructive class (approximate match based on cva output)
    expect(wrapper.classes()).toContain('bg-destructive');
  });
});