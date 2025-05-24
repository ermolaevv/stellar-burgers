import { BurgerConstructorElementUI } from '../components/ui';
import type { Meta, StoryObj } from '@storybook/react';
import { TConstructorIngredient } from '../utils/types';
import { BurgerConstructorElementUIProps } from '../components/ui/burger-constructor-element/type';

const meta = {
  title: 'Example/BurgerConstructorElement',
  component: BurgerConstructorElementUI,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen'
  }
} satisfies Meta<typeof BurgerConstructorElementUI>;

export default meta;

type StoryArgs = BurgerConstructorElementUIProps;
type Story = StoryObj<StoryArgs>;

const storybookIngredientData = {
  _id: '111',
  id: '222',
  uniqueId: 'unique-story-id-123',
  name: 'Булка',
  type: 'top' as const,
  proteins: 12,
  fat: 33,
  carbohydrates: 22,
  calories: 33,
  price: 123,
  image: '',
  image_large: '',
  image_mobile: ''
};

export const DefaultElement: Story = {
  args: {
    ingredient: storybookIngredientData as TConstructorIngredient & {
      uniqueId: string;
    },
    index: 0,
    totalItems: 1,
    handleMoveUp: () => {},
    handleMoveDown: () => {},
    handleClose: () => {}
  }
};
