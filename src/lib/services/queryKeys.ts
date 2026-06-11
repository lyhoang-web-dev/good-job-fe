export const queryKeys = {
  me: () => ['me'] as const,

  kudos: {
    all: () => ['kudos'] as const,
    feed: () => [...queryKeys.kudos.all(), 'feed'] as const,
    comments: (kudoId: string) =>
      [...queryKeys.kudos.all(), kudoId, 'comments'] as const,
    userList: (userId: string, tab: 'received' | 'sent') =>
      [...queryKeys.kudos.all(), 'user', userId, tab] as const,
  },

  users: {
    all: () => ['users'] as const,
    user: (id: string) => [...queryKeys.users.all(), id] as const,
    search: (q: string) => [...queryKeys.users.all(), 'search', q] as const,
    givingBudget: () => [...queryKeys.users.all(), 'giving-budget'] as const,
  },

  rewards: {
    all: () => ['rewards'] as const,
    /** Admin list: `GET /rewards?all=true` */
    admin: () => [...queryKeys.rewards.all(), 'admin'] as const,
    /** Catalog: server-side filters + offset pagination */
    catalog: (
      filters: unknown,
      userBalance: number | null,
      page: number,
      limit: number
    ) =>
      [
        ...queryKeys.rewards.all(),
        'catalog',
        filters,
        userBalance,
        page,
        limit,
      ] as const,
    /** Catalog infinite scroll (mobile): same filters, page param in fetch. */
    catalogInfinite: (
      filters: unknown,
      userBalance: number | null,
      limit: number
    ) =>
      [
        ...queryKeys.rewards.all(),
        'catalog-infinite',
        filters,
        userBalance,
        limit,
      ] as const,
    redemptions: () => ['redemptions'] as const,
  },

  notifications: {
    all: () => ['notifications'] as const,
  },
} as const;
