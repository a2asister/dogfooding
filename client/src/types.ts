export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface User {
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
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}
