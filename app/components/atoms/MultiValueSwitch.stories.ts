
import type { Meta, StoryObj } from '@storybook/vue3';
import MultiValueSwitch from './MultiValueSwitch.vue';

const meta: Meta<typeof MultiValueSwitch> = {
  title: 'Atoms/MultiValueSwitch',
  component: MultiValueSwitch,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof MultiValueSwitch>;

export const Default: Story = {
  args: {
    options: [
      { label: 'All', value: 'all' },
      { label: 'Ready', value: 'ready' },
      { label: 'Sprints', value: 'sprints' },
      { label: 'Archive', value: 'archive' },
    ],
    modelValue: 'all',
    rangeMap: {
      all: { start: 0, end: 3 },
      ready: { start: 1, end: 1 },
      sprints: { start: 2, end: 2 },
    },
  },
  render: (args) => ({
    components: { MultiValueSwitch },
    setup() { return { args }; },
    template: '<MultiValueSwitch v-bind="args" @update:model-value="(val) => args.modelValue = val" />',
  }),
};