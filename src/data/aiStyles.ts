
export interface ImageStyle {
  id: string;
  name: string;
  description: string;
}

export const imageStyleOptions: ImageStyle[] = [
  {
    id: 'REALISTIC',
    name: 'Realistic',
    description: 'Photorealistic style with natural lighting and details'
  },
  {
    id: 'CARTOON',
    name: 'Cartoon',
    description: 'Playful cartoon style perfect for children\'s books'
  },
  {
    id: 'WATERCOLOR',
    name: 'Watercolor',
    description: 'Soft, artistic watercolor painting style'
  },
  {
    id: 'DIGITAL_ART',
    name: 'Digital Art',
    description: 'Modern digital illustration style'
  }
];

export const getStyleDescriptionById = (id: string): string => {
  const style = imageStyleOptions.find(style => style.id === id);
  return style?.description || '';
};
