
import type { Meta, StoryObj } from '@storybook/vue3';
import { Button } from './index';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    default: 'Click Me',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    default: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    default: 'Outline Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    default: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    default: 'Large Button',
  },
};
