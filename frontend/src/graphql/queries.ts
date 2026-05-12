import { gql } from '@apollo/client';

export const EXTRACT_COLORS_FROM_IMAGE = gql`
  mutation ExtractColorsFromImage($base64Image: String!, $colorCount: Int) {
    extractColorsFromImage(base64Image: $base64Image, colorCount: $colorCount) {
      colors {
        hex
        rgb { r g b }
        hsl { h s l }
        position { x y }
      }
      dominantColor {
        hex
        rgb { r g b }
        hsl { h s l }
      }
      statistics {
        brightness
        saturation
        warmth
        contrast
      }
    }
  }
`;

export const GENERATE_EMOTIONAL_PALETTE = gql`
  query GenerateEmotionalPalette($emotion: String!) {
    generateEmotionalPalette(emotion: $emotion) {
      colors {
        hex
        rgb { r g b }
        hsl { h s l }
      }
      name
      type
      relationships {
        type
        color1
        color2
        strength
      }
    }
  }
`;

export const GENERATE_COMPLEMENTARY_PALETTE = gql`
  query GenerateComplementaryPalette($baseColor: String!) {
    generateComplementaryPalette(baseColor: $baseColor) {
      colors {
        hex
        rgb { r g b }
        hsl { h s l }
      }
      name
      type
      relationships {
        type
        color1
        color2
        strength
      }
    }
  }
`;

export const GENERATE_ANALOGOUS_PALETTE = gql`
  query GenerateAnalogousPalette($baseColor: String!) {
    generateAnalogousPalette(baseColor: $baseColor) {
      colors {
        hex
        rgb { r g b }
        hsl { h s l }
      }
      name
      type
      relationships {
        type
        color1
        color2
        strength
      }
    }
  }
`;

export const GENERATE_TRIADIC_PALETTE = gql`
  query GenerateTriadicPalette($baseColor: String!) {
    generateTriadicPalette(baseColor: $baseColor) {
      colors {
        hex
        rgb { r g b }
        hsl { h s l }
      }
      name
      type
      relationships {
        type
        color1
        color2
        strength
      }
    }
  }
`;

export const SAVE_PALETTE = gql`
  mutation SavePalette($input: SavePaletteInput!) {
    savePalette(input: $input) {
      id
      name
      colors
      type
      emotion
      createdAt
    }
  }
`;

export const GET_SAVED_PALETTES = gql`
  query GetSavedPalettes {
    getSavedPalettes {
      id
      name
      colors
      type
      emotion
      createdAt
    }
  }
`;

export const DELETE_PALETTE = gql`
  mutation DeletePalette($id: String!) {
    deletePalette(id: $id)
  }
`;
