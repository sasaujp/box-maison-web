import { proxy } from "valtio";

export type User = {
  position?: { x: number; y: number };
};

export const myState = proxy({
  position: { x: 0, y: 0 },
});

export const usersState = proxy<{ users: ({ id: string } & User)[] }>({
  users: [],
});

export const updateActiveUsers = (userIds: string[]) => {
  usersState.users = userIds.map((id) => ({
    id,
    position: usersState.users.find((user) => user.id === id)?.position,
  }));
};
