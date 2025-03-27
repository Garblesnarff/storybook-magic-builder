
import { Book, BookPage, DEFAULT_BOOK, DEFAULT_PAGE, PageLayout } from "@/types/book";
import { v4 as uuidv4 } from "uuid";

export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  pageCount: number; // Approximate number of pages
  createBook: () => Book;
}

// Helper function to create pages based on a template
const createTemplatePages = (layouts: PageLayout[], texts: string[]): BookPage[] => {
  return layouts.map((layout, index) => ({
    ...DEFAULT_PAGE,
    id: uuidv4(),
    pageNumber: index,
    text: texts[index] || DEFAULT_PAGE.text,
    layout
  }));
};

// Collection of book templates
export const bookTemplates: BookTemplate[] = [
  {
    id: "blank",
    name: "Blank Book",
    description: "Start with a completely blank book.",
    pageCount: 1,
    createBook: () => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      return {
        ...DEFAULT_BOOK,
        id,
        title: "Untitled Book",
        createdAt: now,
        updatedAt: now,
        pages: [
          {
            ...DEFAULT_PAGE,
            id: uuidv4(),
            pageNumber: 0,
            layout: "text-left-image-right"
          }
        ]
      };
    }
  },
  {
    id: "alphabet",
    name: "Alphabet Book",
    description: "A book with pages for each letter of the alphabet.",
    pageCount: 26,
    createBook: () => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Create layouts alternating between different styles
      const layouts: PageLayout[] = Array(26).fill(null).map((_, i) => {
        if (i % 3 === 0) return "text-left-image-right";
        if (i % 3 === 1) return "image-left-text-right";
        return "text-top-image-bottom";
      });
      
      // Create starter text for each letter
      const texts = Array(26).fill(null).map((_, i) => {
        const letter = String.fromCharCode(65 + i);
        return `${letter} is for...\n\nWrite about things that start with the letter ${letter}.`;
      });
      
      return {
        ...DEFAULT_BOOK,
        id,
        title: "My Alphabet Book",
        createdAt: now,
        updatedAt: now,
        pages: createTemplatePages(layouts, texts)
      };
    }
  },
  {
    id: "counting",
    name: "Counting Book",
    description: "A book for teaching numbers from 1 to 10.",
    pageCount: 10,
    createBook: () => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Create layouts for numbers 1-10
      const layouts: PageLayout[] = Array(10).fill(null).map((_, i) => {
        if (i % 2 === 0) return "text-left-image-right";
        return "image-left-text-right";
      });
      
      // Create starter text for each number
      const texts = Array(10).fill(null).map((_, i) => {
        const number = i + 1;
        return `${number} ${number === 1 ? 'is' : 'are'} for...\n\nWrite about ${number} of something.`;
      });
      
      return {
        ...DEFAULT_BOOK,
        id,
        title: "My Counting Book",
        createdAt: now,
        updatedAt: now,
        pages: createTemplatePages(layouts, texts)
      };
    }
  },
  {
    id: "story",
    name: "Story Book",
    description: "A classic story structure with beginning, middle, and end.",
    pageCount: 12,
    createBook: () => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Create a mix of layouts for a storybook
      const layouts: PageLayout[] = [
        "text-left-image-right", // Title/intro
        "full-page-image", // Setting
        "text-left-image-right", // Character intro
        "image-left-text-right", // Problem appears
        "text-top-image-bottom", // Challenge 1
        "image-top-text-bottom", // Challenge 2
        "text-left-image-right", // Challenge 3
        "image-left-text-right", // Crisis
        "text-top-image-bottom", // Resolution begins
        "image-top-text-bottom", // Resolution continues
        "text-left-image-right", // Conclusion
        "full-page-image" // Final scene
      ];
      
      // Create starter text prompts for a story
      const texts = [
        "Once upon a time...\n\nIntroduce your story here.",
        "",
        "Meet the main character...\n\nDescribe who they are and what they like.",
        "One day, something unexpected happened...\n\nIntroduce the problem or challenge.",
        "First, they tried...\n\nDescribe the first attempt to solve the problem.",
        "Then, they tried...\n\nDescribe the second attempt.",
        "Finally, they tried...\n\nDescribe the third and most difficult attempt.",
        "Everything seemed lost when...\n\nDescribe the moment when things look worst.",
        "But then...\n\nDescribe how things start to get better.",
        "Working together...\n\nDescribe how characters work together to solve the problem.",
        "In the end...\n\nDescribe how the story resolves and what was learned.",
        ""
      ];
      
      return {
        ...DEFAULT_BOOK,
        id,
        title: "My Story Book",
        createdAt: now,
        updatedAt: now,
        pages: createTemplatePages(layouts, texts)
      };
    }
  },
  {
    id: "bedtime",
    name: "Bedtime Book",
    description: "A soothing book perfect for bedtime reading.",
    pageCount: 8,
    createBook: () => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Create layouts for bedtime book
      const layouts: PageLayout[] = [
        "text-left-image-right",
        "image-left-text-right",
        "text-top-image-bottom",
        "image-top-text-bottom",
        "text-left-image-right",
        "image-left-text-right", 
        "text-top-image-bottom",
        "image-top-text-bottom"
      ];
      
      // Create starter text for bedtime theme
      const texts = [
        "As the sun goes down...\n\nDescribe the beginning of evening.",
        "The animals get ready for sleep...\n\nDescribe animals getting ready for bed.",
        "The stars come out one by one...\n\nDescribe the night sky.",
        "In one little house...\n\nDescribe a child getting ready for bed.",
        "Time for a bedtime story...\n\nDescribe the bedtime routine.",
        "Eyelids growing heavy...\n\nDescribe feeling sleepy.",
        "Sweet dreams await...\n\nDescribe what dreams might come.",
        "Goodnight...\n\nA gentle goodnight message."
      ];
      
      return {
        ...DEFAULT_BOOK,
        id,
        title: "My Bedtime Book",
        createdAt: now,
        updatedAt: now,
        pages: createTemplatePages(layouts, texts)
      };
    }
  }
];

// Function to get a specific template by ID
export const getTemplateById = (id: string): BookTemplate | undefined => {
  return bookTemplates.find(template => template.id === id);
};
