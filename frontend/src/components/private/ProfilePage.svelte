<script lang="ts">

	import { createEventDispatcher } from 'svelte';
	import { deleteCookie, getCookie } from 'svelte-cookie';
    import { socket, waitingGame, events, generalMessages, bearer, chat, onlineUsers, inGameUsers, userInfo, userSelected, opponent, pos, blockedUsers, roomSelected, webAppIP, chatTab, mapUrl, racketSize } from '../../data';
	import Stats from '../utils/Stats.svelte';
    import MatchHistory from '../utils/MatchHistory.svelte';
    import Game from '../game/Game.svelte';
	
	const	dispatch = createEventDispatcher();
	let		isSomeonePlaying: boolean = false;
	let		userIsWatching: boolean = false;

	function	sendSetting(path: string): void {
		stopWatching();
		dispatch('message', { path: window.location.pathname + path	});
	}

	function	set2fa(): void {
		stopWatching();
		sendSetting("#2fa");
	}

	function	setAvatar(): void {
		stopWatching();
		sendSetting("#avatar");
	}

	function	setUsername(): void {
		stopWatching();
		sendSetting("#username");
	}

	function	setPassword(): void {
		stopWatching();
		sendSetting("#password");
	}

	function	logout(): void {
		deleteCookie('transcendence_session');
		$socket.disconnect();
		$events.length = 0;
		$generalMessages.length = 0;
		$onlineUsers.length = 0;
		$inGameUsers.length = 0;
		$waitingGame = false;
		$socket = null;
		$bearer = "";
		$chat = false;
		$userInfo = undefined;
		$userSelected = undefined;
		$blockedUsers.length = 0;
		$waitingGame = false;
		$roomSelected = undefined;
		$opponent = undefined;
		$pos = undefined;
		$webAppIP = 'localhost';
		$chatTab = 0;
		stopWatching();
		dispatch('logout', { path: "/" });
	}

	function	stopWatching(): void {
		if (userIsWatching)
		{
			$socket.off('update', toggleSomeIsPlayingVar);
			$socket.emit('watchLiveGameoff')
			userIsWatching = false
		}
	}

	function	casualGame(): void {
		stopWatching();
		$socket.emit('JoinGame');
		$waitingGame = true;
		$socket.on('gameReady', (data) => {
			$opponent = data['opponent'];
			$pos = data['pos'];
			$waitingGame = false;
		})
		dispatch('message', { path: "/waitingRoom" })
	}

	$socket.on('gameReady', () => { stopWatching(); dispatch('message', { path: "/game" }) })
	$socket.on('privateGameReady', (data) => { stopWatching(); $mapUrl = data['map']; $racketSize = data['size']; dispatch('message', { path: "/privateGame" }) })

	let	cookie: string;

	function	resetHome(): void {
		$userInfo = undefined;
		history.replaceState({"href_to_show": "/"}, "", "/");
	}

	async function	retrieveInfo(): Promise<void> {
		let	bearer: string = "";
		if ($userInfo && $userInfo.hasOwnProperty('access_token'))
			bearer = $userInfo['access_token'];
		cookie = getCookie('transcendence_session');
		if (cookie.length === 0)
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
		if (bearer !== "")
			ret['access_token'] = bearer;
		$userInfo = ret;
	}

	let	friend: Object = null;
	let	friendErr: boolean = false;

	async function	searchFriend(): Promise<void> {
		const	username: string = document.getElementById('friend-input').value;
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/` + username + '-token');

		try {
			friend = await response.json();
			friendErr = false;
		}
		catch {
			friendErr = true;
		}
	}

	function	toggleSomeIsPlayingVar(): void {
		isSomeonePlaying = true;
		$socket.off('update', toggleSomeIsPlayingVar);
	}

	function	watchLiveGame(): void {
		userIsWatching = (userIsWatching) ? false : true;
		if (userIsWatching)
		{
			$socket.on('update', toggleSomeIsPlayingVar);
			$socket.emit('watchLiveGameOn');
		}
		else
		{
			$socket.emit('watchLiveGameOff');
		}
	}

</script>

{#await retrieveInfo()}
	<p>Loading</p>
{:then}
	<div id="container" style="padding-top: 20px;">

		<img id="image-profile" src={$userInfo['pictureLink']} alt="profile" height="100%" width="100%" />

		<div id="text-container">
			<p style="font-weight: bold; color: black; font-size: 3em">Codename: {$userInfo['username']}</p>
		</div>

		<div class="sec" id="game-controls">
			<h2>Game</h2>
			<button on:click|preventDefault={casualGame}>Play casual game</button>
			<br>
			<button style="white-space: pre" on:click|preventDefault={() => { stopWatching(); dispatch('message', { path: "/invitationWindow" })}}>Play game with a friend  &#123; no ranking &#125;</button>
			<br>
			<button on:click|preventDefault={watchLiveGame}>Watch live game</button>
			<br>
			{#if userIsWatching === true}
				<div id="live-game-container">
				{#key isSomeonePlaying}
					{#if isSomeonePlaying === true}
						<Game isSpectator={true} on:endgame={() => {
							$socket.removeAllListeners('update');
							isSomeonePlaying = false;
							$socket.on('update', toggleSomeIsPlayingVar);
						}} />
					{:else}
						<video muted loop autoplay>
							<source src="videos/noise.webm" type="video/webm">
							<track kind="captions">
						</video>
						<p>No game right now</p>
					{/if}
				{/key}
				</div>
			{/if}
		</div>

		<div class="sec" id="match-history">
			<h2 style="margin-bottom: 0;">Match History</h2>
			<p style="color: black; margin-top: 0;">Last 5 battles</p>
			<MatchHistory userInfo={$userInfo} on:message />
		</div>

		<div class="sec" id="mine-stats">
			<h2>Stats</h2>
			<Stats userInfo={$userInfo} />
			<button style="margin-top: 45px" on:click={ () => dispatch('message', { path: '/leaderboard' }) } >Leaderboard</button>
		</div>

		<div class="sec" id="achievements">
			<h2>Achievements</h2>
			<button on:click|preventDefault={() => { stopWatching(); dispatch('message', { path: "/achievements" })}}>See all</button>
		</div>

		<div class="sec" id="add-friend">
			<h2>Search user</h2>
			<form>
				<label for="friend-input">Insert username</label>
				<input id="friend-input" type="text" name="username" autocomplete="off" required>
				<br>
				<button id="submit-button" type="submit" on:click|preventDefault={searchFriend}>submit</button>
			</form>
			{#if friend !== null && friend['username'] !== $userInfo['username']}
				<div id="search-result">
					<img src={friend['pictureLink']} alt="result profile" style="max-width: 4vw;" />
					<a on:click|preventDefault={ (event) => { stopWatching(); dispatch('message', { path: event.target.getAttribute('href') })}} href="/profile?user={friend['username']}">{friend['username']}</a>
					<button on:click={ () => {stopWatching(); dispatch('message', { path: "/profile?user=" + document.getElementById('friend-input').value })}}>show profile</button>
				</div>
			{:else if friend !== null && friend['username'] === $userInfo['username']}
				<div id="search-result">
					<p>you're looking for yourself... maybe a trip could be healthy</p>
				</div>
			{:else if friendErr === true}
				<div id="search-result">
					<p>No user with this name!</p>
				</div>
			{/if}
		</div>

		<div class="sec" id="settings">
			<h2>Settings</h2>
			<button on:click|preventDefault={setAvatar}>change avatar</button>
			<br>
			<button on:click|preventDefault={setUsername}>change username</button>
			<br>
			{#if $userInfo['isOAuthLogged'] === false}
				<button on:click|preventDefault={set2fa}>manage two-factor authentication</button>
				<br>
				<button on:click|preventDefault={setPassword}>change password</button>
				<br>
			{/if}
		</div>
		
		<div class="sec" style="padding: 30px;">
			<button on:click|preventDefault={logout}>logout</button>
		</div>
	</div>
{/await}


<style>

	p, label, a {
		font-family: 'TrashHand';
	}

	#container {
		width: 50vw;
		background-color: #fcd612;
		border-radius: 0.5vw;
	}

	#image-profile {
		max-width: 26vw;
	}

	.sec {
		border-top: 5px dotted black;
	}

	#search-result {
		display: flex;
		width: 50%;
		margin: 0 auto;
		justify-content: space-around;
		align-items: center;
	}

	#search-result > a {
		font-size: 2em;
	}

	#submit-button {
		margin: 20px;
		font-family: 'TrashHand';
		font-size: 2em;
		color: #d61a1f;
		cursor: pointer;
		background-color: unset;
		box-shadow: unset;
		text-decoration: underline;
		rotate:-10deg;
	}

	h2, p, label {
		color: black;
	}

	label {
		margin-right: 15px;
	}

	input {
		background-color: transparent;
		border: 0;
		border-bottom: 1px solid black;
		color: black;
		text-align: center;
	}

	input:focus-visible {
		outline: none;
	}

	button {
		margin: 5px;
		box-shadow: 0px 0px 10px white;
		background-color: black;
		color: white;
	}

	div {
		margin-bottom: 30px;
	}

	#live-game-container {
		width: 80%;
		padding: 30px 10px;
		background-color: black;
		border-radius: 1vw;
		margin: 30px auto;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#live-game-container > p {
		position: absolute;
		width: fit-content;
		font-size: 2em;
	}

	video {
		width: 80%;
	}

</style>
