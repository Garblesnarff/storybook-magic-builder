
export interface ImageStyleOption {
  id: string;
  name: string;
  description: string;
  promptPrefix?: string;
}

export const imageStyleOptions: ImageStyleOption[] = [
  {
    id: 'REALISTIC',
    name: 'Realistic',
    description: 'Photorealistic style with detailed textures and natural lighting.',
    promptPrefix: 'a photorealistic image of'
  },
  {
    id: 'CARTOON',
    name: 'Cartoon',
    description: 'Vibrant colors with bold outlines, similar to children\'s cartoons.',
    promptPrefix: 'a cartoon style illustration of'
  },
  {
    id: 'WATERCOLOR',
    name: 'Watercolor',
    description: 'Soft, flowing style with transparent color washes like watercolor paintings.',
    promptPrefix: 'a watercolor painting of'
  },
  {
    id: 'PIXAR',
    name: 'Pixar-like',
    description: 'Stylized 3D characters with expressive features in a Pixar animation style.',
    promptPrefix: 'a pixar style 3D rendering of'
  },
  {
    id: 'STORYBOOK',
    name: 'Storybook',
    description: 'Classic children\'s book illustration style with whimsical details.',
    promptPrefix: 'a children\'s storybook illustration of'
  },
  {
    id: 'CLAYMATION',
    name: 'Claymation',
    description: 'Characters and scenes that look like they\'re made from clay.',
    promptPrefix: 'a claymation style image of'
  },
  {
    id: 'PAPERCRAFT',
    name: 'Papercraft',
    description: 'Paper cutout style with layered elements and distinct shadows.',
    promptPrefix: 'a paper cutout illustration of'
  },
  {
    id: 'PENCIL_SKETCH',
    name: 'Pencil Sketch',
    description: 'Hand-drawn style with pencil lines and light shading.',
    promptPrefix: 'a detailed pencil sketch of'
  }
];

export default imageStyleOptions;
