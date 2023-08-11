<script lang="ts">
	import { webAppIP, userInfo, page_shown, chat, bearer, socket, events, onlineUsers, inGameUsers, statusChange, generalMessages, newMessage, waitingGame } from "./data";
    import Redirect from './components/auth/Redirect.svelte';
    import MainPage from "./components/MainPage.svelte";
    import Logged from "./components/Logged.svelte";
    import RegistrationPage from "./components/RegistrationPage.svelte";
	import TwoFactorToken from './components/auth/TwoFactorToken.svelte';
    import Chat from "./components/chat/Chat.svelte";
	import { getCookie, deleteCookie } from 'svelte-cookie';
    import AuthError from "./components/auth/AuthError.svelte";
	import io from 'socket.io-client';

	$page_shown = window.location.pathname + window.location.search;
	$webAppIP = window.location.host.split(':')[0];
	console.log($webAppIP);

	window.addEventListener("popstate", e => {
		$userInfo = retrieveInfo();
		$page_shown = e.state.href_to_show;
	})

	function	show_page(event): void {
		if (($page_shown === "/waitingRoom" || $page_shown === '/waitingUser') && event.detail.path !== '/game')
		{
			$waitingGame = false;
			$socket.emit('leaveGame');
		}
		if ($userInfo === undefined && event.detail.userInfo === undefined)
			retrieveInfo();
		if (event.detail.userInfo !== undefined)
			$userInfo = event.detail.userInfo;
		if (event.detail.bearer !== undefined && $userInfo !== undefined)
			$userInfo['access_token'] = event.detail.bearer;
		history.pushState({"href_to_show": event.detail.path}, "", event.detail.path);
		$page_shown = event.detail.path;
	}

	function	toggleChat(): void {
		$chat = (($chat === true) ? false : true);
	}

	function	resetHome(): void {
		$userInfo = undefined;
		history.replaceState({"href_to_show": "/"}, "", "/");
		$page_shown = "/";
	}

	async function	isCookieValid(cookie: string) {
		if (cookie.length === 0)
			return (false);
		const	map: Map<string, string> = new Map([
			['cookie', cookie]
		]);
		const	json: Object = Object.fromEntries(map);
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/isCookie`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(json)
		})
		if (response.status !== 200)
			return (false);
		return (true);
	}

	async function	setSocket(): Promise<void> {
		$socket = io(`http://${$webAppIP}:3000/`, {
			extraHeaders: {
				username: $userInfo['username']
			}
		});
		$socket.emit("log", (users) => {
			users.forEach((user) => {
				if ($userInfo['blocklist'].includes(user) === false && user !== $userInfo['username'] && $onlineUsers.includes(user) === false)
					$onlineUsers = $onlineUsers.concat(user);
			})
		})
		$socket.on("status", (info: Object) => {
			$statusChange = ($statusChange === true) ? false : true;
			if (info['username'] === $userInfo['username'] || $userInfo['blocklist'].includes(info['username']))
				return ;
			switch (info['status'])
			{
				case 'online': {
					if ($onlineUsers.includes(info['username']) === false)
						$onlineUsers = $onlineUsers.concat(info['username']);
					break ;
				}
				case 'offline': {
					const	idx: number = $onlineUsers.indexOf(info['username']);
					const	idx2: number = $inGameUsers.indexOf(info['username']);
					if (idx !== -1)
						$onlineUsers.splice(idx, 1);
					if (idx2 !== -1)
						$inGameUsers.splice(idx2, 1);
					break ;
				}
				case 'in game': {
					if ($inGameUsers.includes(info['username']) === false)
						$inGameUsers = $inGameUsers.concat(info['username']);
					break ;
				}
				default: break ;
			}
		})
		$socket.on('general', (message: string) => {
			const   sender: string = message.split(':')[0];
			if ($userInfo['blocklist'].includes(sender) === false)
			{
				$generalMessages = $generalMessages.concat(message);
			}
		})
		$socket.on('event', (event) => {
			$events = $events.concat(event['data']['events'][0]);
		});
		$socket.on('events', (event, string, info) => {
			let	data: Object = {
				type: event,
				sender: string,
				info: info
			}
			$events = $events.concat(data);
		});
		$socket.on('forbidden', () => {
			$socket.disconnect();
			$userInfo = undefined;
			deleteCookie('transcendence_session');
			$page_shown = "/";
		})
	}

	async function	retrieveInfo(): Promise<void> {
		let		cookie: string = getCookie('transcendence_session');
		const	b:	boolean = await isCookieValid(cookie);
		if ($page_shown === "/2faToken")
			return ;
		if (b === false)
			deleteCookie('transcendence_session');
		else if ($page_shown === "/" || $page_shown === "/register" || $page_shown === "/2faToken")
		{
			history.replaceState({"href_to_show": "/profile"}, "", "/profile");
			$page_shown = "/profile";
		}
		cookie = getCookie('transcendence_session');
		if ($page_shown === "/register" || (window.location.search !== "" && $page_shown.startsWith("/profile?user=") === false && $page_shown !== "/profile"))
			return null;
		if (cookie.length === 0 && $page_shown !== "/2faToken")
		{
			resetHome();
			return (null);
		}
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/` + cookie);
		if (response.body === null)
		{
			resetHome();
			return (null);
		}
		const	ret: Object = await response.json();
		if ($bearer !== "")
			ret['access_token'] = $bearer;
		$userInfo = ret;
		if ($socket === null)
			setSocket();
	}

	function	isInPrivateSpace(path: string): boolean {
		if (path === "/waitingRoom" ||
			path === "/waitingUser" ||
			path === "/game" ||
			path === "/privateGame" ||
			path === "/friends" ||
			path === "/invitationWindow" ||
			path === "/leaderboard" ||
			path.startsWith('/achievements') ||
			path.startsWith("/profile"))
			return true;
		return false;
	}

</script>

{#key $page_shown}
	<main>
		{#await retrieveInfo()}
			<p>Loading...</p>
		{:then}
			{#if $page_shown === "/" || $page_shown.startsWith("/?")}
				<MainPage on:message={show_page} />
			{:else if $page_shown.startsWith("/redirect")}
        		<Redirect on:message={show_page} />
			{:else if $page_shown === "/register"}
				<RegistrationPage on:message={show_page} />
			{:else if isInPrivateSpace($page_shown)}
				<Logged on:message={show_page} on:logout={resetHome} on:endgame={show_page} />
			{:else if $page_shown === "/2faToken"}
				<TwoFactorToken on:message={show_page} />
			{:else}
				<AuthError />
			{/if}

			{#if $userInfo !== undefined && $socket !== null}
				<Chat on:message={show_page} on:toggle={toggleChat}/>
			{/if}
		{/await}
	</main>
{/key}

<style>
	:global(::-webkit-scrollbar) {
		width: 5px;
		background: black;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #fcd612;
		border-radius: 3vw;
	}
</style>
