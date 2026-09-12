
import type { Meta, StoryObj } from '@storybook/vue3';
import ResponsiveLayout from './ResponsiveLayout.vue';

const meta: Meta<typeof ResponsiveLayout> = {
  title: 'Templates/ResponsiveLayout',
  component: ResponsiveLayout,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResponsiveLayout>;

export const Default: Story = {
  args: {
    switchModel: 'all',
    switchOptions: [
      { label: 'All', value: 'all' },
      { label: 'Col 1', value: 'col1' },
      { label: 'Col 2', value: 'col2' },
      { label: 'Col 3', value: 'col3' },
      { label: 'Archive', value: 'archive' },
    ],
    switchRangeMap: {
      all: { start: 0, end: 4 },
    },
  },
  render: (args) => ({
    components: { ResponsiveLayout },
    setup() { return { args }; },
    template: `
      <div class="h-[600px] w-full bg-slate-100 p-8">
        <ResponsiveLayout 
          v-bind="args" 
          @update:switchModel="(val) => args.switchModel = val"
        >
          <template #header>
            <h1 class="text-2xl font-bold">Project Dashboard</h1>
          </template>
          <template #col1>
            <div class="p-4 bg-white rounded-xl shadow-sm h-full">Column 1 Content</div>
          </template>
          <template #col2>
            <div class="p-4 bg-white rounded-xl shadow-sm h-full">Column 2 Content</div>
          </template>
          <template #col3>
            <div class="p-4 bg-white rounded-xl shadow-sm h-full">Column 3 Content</div>
          </template>
          <template #col4>
            <div class="p-4 bg-white rounded-xl shadow-sm h-full">Archive Content</div>
          </template>
        </ResponsiveLayout>
      </div>
    `,
  }),
};
