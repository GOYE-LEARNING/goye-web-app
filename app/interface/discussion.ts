export interface Author {
  id: string;
  first_name: string;
  last_name: string;
  user_pic: string;
  role: string;
}

export interface NestedReply {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  _count: { likes: number };
  liked?: boolean;
  parent?: { id: string; author: { first_name: string; last_name: string } };
  replyTo?: { id: string; name: string };
}

// app/interface/discussion.ts
export interface Discussion {
  id: string;
  content: string;
  mediaUrls?: any[];
  author: {
    id: string;
    first_name: string;
    last_name: string;
    user_pic: string;
    role: string;
  };
  authorId?: string;
  createdAt: string;
  _count: {
    replies: number;
    likes: number;
  };
  liked?: boolean; // Add this field
  replies?: Reply[];
  category?: string; // Add this line - for post category
  categoryIcon?: string; // Optional: for storing category icon
  categoryColor?: string;
}

export interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
    user_pic: string;
    role: string;
  };
  createdAt: string;
  _count: {
    likes: number;
  };
  liked?: boolean; // Add this field
  replies?: Reply[];
}

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
  uploading: boolean;
  uploadProgress: number;
  uploadedUrl?: string;
}
