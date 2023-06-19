import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export let	page_shown: Writable<string> = writable("/");
export let	userInfo: Writable<Object> | undefined = writable(undefined);
export let	chat: Writable<boolean> = writable(false);
export let	bearer: Writable<string> = writable("");
export let	socket: any = writable(null);
export let  events: Writable<Array<Object>> = writable([]);
export let  generalMessages: Writable<Array<string>> = writable([]);
export let  onlineUsers: Writable<Array<string>> = writable([]);
export let  inGameUsers: Writable<Array<string>> = writable([]);
export let  blockedUsers: Writable<Array<string>> = writable([]);
export let  waitingGame: Writable<boolean> = writable(false);
export let	statusChange: Writable<boolean> = writable(true);
export let	userSelected: Writable<string> = writable(undefined);
export let	newMessage: Writable<boolean> = writable(false);
export let	opponent: Writable<string> = writable(undefined);
export let	pos: Writable<string> = writable(undefined);