export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface MockUser {
  id: string;
  name: string;
  nickname: string;
  bio: string;
  avatar: string;
  location: string;
  company: string;
  website: string;
  socialLinks: SocialLink[];
  skills: string[];
  experience: string;
  joinDate: string;
}

const imgApi = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;

export const mockUsers: MockUser[] = [
  {
    id: 'user_001',
    name: '张明远',
    nickname: '星辰大海',
    bio: '热爱编程，追求技术的边界',
    avatar: imgApi('professional portrait of a male software developer coding, modern tech background, realistic photo'),
    location: '北京, 中国',
    company: '星辰科技',
    website: 'https://example.com/zhang',
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/', icon: 'github' },
      { platform: 'Twitter', url: 'https://twitter.com/', icon: 'twitter' }
    ],
    skills: ['TypeScript', 'React', 'Node.js'],
    experience: '全栈开发工程师 @ 星辰科技 · 5年经验',
    joinDate: '2021-03-15'
  },
  {
    id: 'user_002',
    name: '李思琪',
    nickname: '设计师Luna',
    bio: '创造美好的用户体验',
    avatar: imgApi('professional portrait of a female UI designer with creative workspace, colorful design tools around, realistic photo'),
    location: '上海, 中国',
    company: '创意工坊',
    website: 'https://example.com/luna',
    socialLinks: [
      { platform: 'Dribbble', url: 'https://dribbble.com/', icon: 'dribbble' },
      { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' }
    ],
    skills: ['Figma', 'UI/UX', 'Motion Design'],
    experience: '高级UI设计师 @ 创意工坊 · 8年经验',
    joinDate: '2019-07-22'
  },
  {
    id: 'user_003',
    name: '王浩然',
    nickname: 'HR',
    bio: '产品思维，技术实现',
    avatar: imgApi('professional portrait of a male product manager in modern office, data charts on screen in background, realistic photo'),
    location: '深圳, 中国',
    company: '创新产品',
    website: 'https://example.com/hr',
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/', icon: 'linkedin' },
      { platform: 'Medium', url: 'https://medium.com/', icon: 'medium' }
    ],
    skills: ['产品设计', '数据分析', 'Python'],
    experience: '产品经理 @ 创新产品 · 6年经验',
    joinDate: '2020-01-10'
  },
  {
    id: 'user_004',
    name: '陈雨萱',
    nickname: 'Rain',
    bio: '用代码写诗的前端工程师',
    avatar: imgApi('professional portrait of a female creative frontend developer with neon lights and code visualization background, artistic realistic photo'),
    location: '杭州, 中国',
    company: '数字艺术',
    website: 'https://example.com/rain',
    socialLinks: [
      { platform: 'CodePen', url: 'https://codepen.io/', icon: 'codepen' },
      { platform: 'GitHub', url: 'https://github.com/', icon: 'github' }
    ],
    skills: ['CSS动画', 'Three.js', 'Creative Coding'],
    experience: '创意前端工程师 @ 数字艺术 · 4年经验',
    joinDate: '2022-05-08'
  }
];
