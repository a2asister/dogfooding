export class CreateCommentDto {
  content: string;
  author: string;
  parentId?: string;
}

export class UpdateCommentDto {
  content?: string;
  likes?: number;
  isLiked?: boolean;
}
