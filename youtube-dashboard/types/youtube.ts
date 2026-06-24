export interface ChannelStats {
  channelId: string;
  title: string;
  thumbnailUrl: string | null;
  handle: string | null;
  subscriberCount: string;
  totalViews: string;
  totalVideos: string;
}

export interface VideoItem {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  comments: number;
}

export interface DailyMetric {
  date: string;
  views: number;
  watchTime: number;
  impressions: number;
  ctr: number;
}