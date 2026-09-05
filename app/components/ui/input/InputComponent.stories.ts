
import type { Meta, StoryObj } from '@storybook/vue3';
import InputComponent from './InputComponent.vue';

const meta: Meta<typeof InputComponent> = {
  title: 'UI/Input',
  component: InputComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InputComponent>;

export const Default: Story = {
  args: {
    modelValue: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    modelValue: 'Hello World',
  },
};
