<script lang="ts">

	import { socket, userInfo, webAppIP, events, opponent } from "../../data";
	import { createEventDispatcher } from 'svelte';
    import UserIcon from "./UserIcon.svelte";
    import Game from "../game/Game.svelte";
	
	let			changed: number = 0;
	let			isOpen: boolean = false;
	const		dispatch = createEventDispatcher();

	async function	getNotifications(): Promise<void> {
		const	response: Response = await fetch(`http://${$webAppIP}:3000/users/events/` + $userInfo['username']);
		const	json: Object = await response.json();
		$events = Array.from(Object.values(json['events']));
	}

	if ($socket === null)
		dispatch('message', { path: "/profile" })

	function	showNotifications() {
		isOpen = ((isOpen) ? false : true);
	}

	async function	acceptFriendRequest(event: Object): Promise<void> {
		const	json: Object = { user: event['sender'], bool: true };
		$socket.emit("friendRes", JSON.stringify(json));
		$socket.emit("clearNotification", event['id']);
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

	async function	dismissFriendRequest(event: Object): Promise<void> {
		const	json: Object = { user: event['sender'], bool: false };
		$socket.emit("friendRes", JSON.stringify(json));
		$socket.emit("clearNotification", event['id']);
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

	async function	dismiss(event: Object): Promise<void> {
		$socket.emit("clearNotification", event['id']);
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

	function	dismissGameRequest(event: Object): void {
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

	async function	acceptInviteToRoom(event: Object) {
		$socket.emit('joinRoom', {user: $userInfo['username'], room: event['room']});
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

	async function	acceptInviteToPlay(event: Object) {
		$socket.emit('accept private game', JSON.stringify({user: event['sender'], bool: true, map: event['info']['map'], points: event['info']['points'], speed: event['info']['speed'], size: event['info']['size']}));
		$opponent = event['sender'];
		const	index: number = $events.indexOf(event);
		if (index !== -1)
			$events.splice(index, 1);
		changed++;
	}

</script>

{#await getNotifications()}
	<p>loading</p>
{:then}
	<button on:click={showNotifications} id="notifications">
		<img src="images/phone.png" alt="notifications icon" />
		{#if $events.length > 0 && isOpen === false}
			<div id="notifications-red"></div>
		{/if}
	</button>

	{#if isOpen}
		<div id="notifications-window" style="background-color: white;">
			{#key changed}
				{#if $events.length > 0}
					<ul>
						{#each $events as event}
							{#if event['type'] === "FRIEND"}
								<li>
									<UserIcon username={event['sender']} --flex-direction="column" on:message />
									<p>sent you a friend request.</p>
									<button on:click={() => acceptFriendRequest(event)}>accept</button>
									<button on:click={() => dismissFriendRequest(event)}>dismiss</button>
								</li>
							{:else if event['type'] === "MESSAGE"}
								<li>
									<UserIcon username={event['sender']} --flex-direction="column" on:message />
									<p>sent you new messages.</p>
									<button on:click={() => dismiss(event)}>dismiss</button>
								</li>
							{:else if event['type'] === "INVITEROOM"}
								<li>
									<UserIcon username={event['sender']} --flex-direction="column" on:message />
									<p>invited you to a new room.</p>
									<button on:click={() => acceptInviteToRoom(event)}>accept</button>
									<button on:click={() => dismiss(event)}>dismiss</button>
								</li>
							{:else if event['type'] === "PRIVATEGAME"}
								<li>
									<UserIcon username={event['sender']} --flex-direction="column" on:message />
									<p>invited you to play.</p>
									<button on:click={() => acceptInviteToPlay(event)}>accept</button>
									<button on:click={() => { $socket.emit('deny private game', JSON.stringify({user: event['sender']})); dismissGameRequest(event) }}>dismiss</button>
								</li>
							{/if}
						{/each}
					</ul>
				{:else}
					<p>No notifications to read</p>
				{/if}
			{/key}
		</div>
	{/if}
{/await}

<style>

	#notifications {
		background-color: white;
		border-radius: 50%;
		position: fixed;
		left: 25px;
		top: 15px;
		width: 50px;
		height: 50px;
		padding: 0;
		cursor: pointer;
	}

	#notifications-red {
		position: absolute;
		right: 0;
		top: 0;
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
		background-color: #d61a1f;
	}

	#notifications > img {
		width: 100%;
	}

	#notifications-window {
		position: fixed;
		top: 80px;
		left: 25px;
		width: 15vw;
		border-radius: 5px;
		overflow: auto;
		max-height: 50vh;
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	li {
		border-bottom: 1px solid black;
	}

	li > button {
		background-color: black;
		color: #fcd612;
		padding: 5px 10px;
		margin: 5px;
	}

	li > p {
		margin: 0 5px 5px;
	}

</style>
