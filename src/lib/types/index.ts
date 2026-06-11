export type CoreValue =
  | 'teamwork'
  | 'ownership'
  | 'innovation'
  | 'integrity'
  | 'customer_focus';

export interface SendKudoPayload {
  coreValue: CoreValue;
  message: string;
  points: number;
  receiverId: string;
}

export interface CreateRewardPayload {
  description?: string;
  imageUrl?: string;
  name: string;
  pointsCost: number;
  quantityTotal: number;
}

export type KudoStatus = 'pending_media' | 'active';
export type MediaStatus = 'processing' | 'ready' | 'failed';
export type RedemptionStatus = 'pending' | 'completed' | 'failed';
export type UploadState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

export interface User {
  avatarUrl?: string;
  balance: number;
  email: string;
  id: string;
  name: string;
  role: 'user' | 'admin';
}

/** Minimal user shape for recipient picker (id + display name). */
export type RecipientSelection = Pick<User, 'id' | 'name'>;

export interface GivingBudget {
  remaining: number;
  totalBudget: number;
  usedPoints: number;
  yearMonth: string;
}

export interface KudoMedia {
  durationSecs?: number;
  id: string;
  status: MediaStatus;
  type: 'image' | 'video';
  url: string;
}

export interface Kudo {
  commentsCount: number;
  coreValue: CoreValue;
  createdAt: string;
  id: string;
  media: Array<KudoMedia>;
  message: string;
  points: number;
  reactions: Array<Reaction>;
  receiver: User;
  sender: User;
  status: KudoStatus;
}

export interface Reaction {
  emoji: string;
  id: string;
  user: User;
}

export interface Comment {
  content: string;
  createdAt: string;
  id: string;
  user: User;
}

export interface Reward {
  /** Same as `quantityRedeemed` (computed by BE). */
  claimed: number;
  description?: string;
  id: string;
  imageUrl?: string;
  isActive: boolean;
  name: string;
  pointsCost: number;
  quantityRedeemed: number;
  quantityTotal: number;
  /** `max(0, quantityTotal - quantityRedeemed)` from BE. */
  remaining: number;
  /** Same as `quantityTotal` (computed by BE). */
  total: number;
}

export interface Redemption {
  createdAt: string;
  id: string;
  pointsSpent: number;
  reward: Reward;
  status: RedemptionStatus;
}

export interface PaginatedRewards {
  data: Array<Reward>;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface Notification {
  createdAt: string;
  id: string;
  isRead: boolean;
  refId: string;
  type: 'kudo_received' | 'reaction' | 'comment' | 'redemption_success';
}

export interface PaginatedResponse<T> {
  data: Array<T>;
  hasMore?: boolean;
  nextCursor?: string;
}

export type {
  RewardAvailabilityFilter,
  RewardFilters,
  RewardSortKey,
} from './reward-filters';
export { DEFAULT_REWARD_FILTERS } from './reward-filters';
