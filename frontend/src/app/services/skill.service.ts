import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Skill } from '../models/skill.model';

const GET_SKILLS = gql`
  query GetSkills($userId: Int!) {
    skills(userId: $userId) {
      id
      name
      description
      proficiency
      category
      icon
      primaryColor
      secondaryColor
      positionX
      positionY
      rotation
      userId
    }
  }
`;

const CREATE_SKILL = gql`
  mutation CreateSkill(
    $name: String!
    $userId: Int!
    $description: String
    $proficiency: Int
    $category: String
    $icon: String
    $primaryColor: String
    $secondaryColor: String
  ) {
    createSkill(
      name: $name
      userId: $userId
      description: $description
      proficiency: $proficiency
      category: $category
      icon: $icon
      primaryColor: $primaryColor
      secondaryColor: $secondaryColor
    ) {
      id
      name
      description
      proficiency
      category
      icon
      primaryColor
      secondaryColor
      positionX
      positionY
      rotation
      userId
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  constructor(private apollo: Apollo) {}

  getSkills(userId: number) {
    return this.apollo
      .watchQuery<{ skills: Skill[] }>({
        query: GET_SKILLS,
        variables: { userId },
      })
      .valueChanges.pipe(map((result) => result.data.skills));
  }

  createSkill(skill: Partial<Skill>) {
    return this.apollo.mutate<{ createSkill: Skill }>({
      mutation: CREATE_SKILL,
      variables: skill,
    });
  }

  getMockSkills(): Skill[] {
    return [
      {
        id: 1,
        name: 'Angular',
        description: '现代Web应用开发框架，支持TypeScript和响应式编程',
        proficiency: 85,
        category: '前端框架',
        icon: '🅰️',
        primaryColor: '#DD0031',
        secondaryColor: '#C3002F',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
      {
        id: 2,
        name: 'TypeScript',
        description: 'JavaScript的超集，提供强类型系统和更好的开发体验',
        proficiency: 90,
        category: '编程语言',
        icon: '📘',
        primaryColor: '#3178C6',
        secondaryColor: '#235A9E',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
      {
        id: 3,
        name: 'GraphQL',
        description: 'API查询语言，灵活高效的数据获取方式',
        proficiency: 80,
        category: 'API设计',
        icon: '◈',
        primaryColor: '#E10098',
        secondaryColor: '#B80080',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
      {
        id: 4,
        name: 'NestJS',
        description: '企业级Node.js后端框架，提供模块化架构',
        proficiency: 75,
        category: '后端框架',
        icon: '🪺',
        primaryColor: '#E0234E',
        secondaryColor: '#C71D43',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
      {
        id: 5,
        name: 'CSS3',
        description: '现代样式设计，支持动画、渐变和响应式布局',
        proficiency: 88,
        category: '样式设计',
        icon: '🎨',
        primaryColor: '#1572B6',
        secondaryColor: '#0D5A94',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
      {
        id: 6,
        name: 'Three.js',
        description: '3D图形库，创建沉浸式Web体验',
        proficiency: 70,
        category: '3D图形',
        icon: '🎯',
        primaryColor: '#000000',
        secondaryColor: '#333333',
        positionX: 0,
        positionY: 0,
        rotation: 0,
        userId: 1,
      },
    ];
  }
}