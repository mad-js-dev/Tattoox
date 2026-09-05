
import type { Meta, StoryObj } from '@storybook/vue3';
import { Badge } from './index';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: 'default',
    default: 'Default Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    default: 'Secondary Badge',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    default: 'Destructive Badge',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    default: 'Outline Badge',
  },
};
