import { atom } from "jotai";

export const socketAtom = atom<WebSocket | null>(null);
export const isConnnectedAtom = atom<boolean>(false);

export const myPositionAtom = atom<{ x: number; y: number }>({ x: 0, y: 0 });

export const avaterPositionsAtom = atom<{
  [key: string]: { x: number; y: number };
}>({});

export const activeUsersAtom = atom<string[]>([]);
