
import type { Meta, StoryObj } from '@storybook/vue3';
import TextareaComponent from './TextareaComponent.vue';

const meta: Meta<typeof TextareaComponent> = {
  title: 'UI/Textarea',
  component: TextareaComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextareaComponent>;

export const Default: Story = {
  args: {
    modelValue: 'Enter multi-line text...',
  },
};