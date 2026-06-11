import type {
  GivingBudget,
  Kudo,
  KudoMedia,
  Notification,
  PaginatedResponse,
  PaginatedRewards,
  Redemption,
  Reward,
  User,
} from '@/lib/types';

export const mockUser: User = {
  id: 'user-1',
  email: 'alice@goodjob.com',
  name: 'Alice Nguyen',
  role: 'user',
  balance: 350,
};

export const mockBudget: GivingBudget = {
  usedPoints: 50,
  totalBudget: 200,
  yearMonth: '2025-04',
  remaining: 150,
};

export const mockKudo: Kudo = {
  id: 'kudo-1',
  sender: mockUser,
  receiver: {
    id: 'user-2',
    name: 'Bob Tran',
    email: 'bob@goodjob.com',
    role: 'user',
    balance: 100,
  },
  points: 30,
  message: 'Great work on the sprint demo!',
  coreValue: 'teamwork',
  status: 'active',
  media: [],
  reactions: [],
  commentsCount: 0,
  createdAt: '2025-04-10T10:00:00Z',
};

export const mockReward: Reward = {
  id: 'reward-1',
  name: 'Company Hoodie',
  description: 'Official hoodie',
  pointsCost: 500,
  isActive: true,
  quantityTotal: 100,
  quantityRedeemed: 10,
  claimed: 10,
  remaining: 90,
  total: 100,
};

export const mockKudosFeed: PaginatedResponse<Kudo> = {
  data: [mockKudo],
  hasMore: false,
};

export const mockRewardsPaginated: PaginatedRewards = {
  data: [mockReward],
  limit: 12,
  page: 1,
  total: 1,
  totalPages: 1,
};

export const mockRedemption: Redemption = {
  id: 'red-1',
  pointsSpent: 500,
  status: 'completed',
  createdAt: '2025-04-11T12:00:00Z',
  reward: mockReward,
};

export const mockNotification: Notification = {
  id: 'notif-1',
  type: 'kudo_received',
  isRead: false,
  refId: 'kudo-1',
  createdAt: '2025-04-12T08:00:00Z',
};

export const mockKudoMedia: KudoMedia = {
  id: 'media-1',
  type: 'image',
  status: 'ready',
  url: 'https://example.com/media.jpg',
};
