export interface Skill {
  id: number;
  name: string;
  description?: string;
  proficiency: number;
  category?: string;
  icon?: string;
  primaryColor: string;
  secondaryColor: string;
  positionX: number;
  positionY: number;
  rotation: number;
  userId: number;
}