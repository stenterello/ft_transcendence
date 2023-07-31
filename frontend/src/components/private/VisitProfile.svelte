<script lang="ts">
    import { inGameUsers, onlineUsers, socket, userInfo, blockedUsers, webAppIP, opponent } from "../../data";
	import { blockUser, unblockUser, retrieveOtherUserInfo } from "../chat/interactionUtils.svelte";
    import Stats from "../utils/Stats.svelte";
    import MatchHistory from "../utils/MatchHistory.svelte";
	import { createEventDispatcher } from "svelte";

	const	dispatch = createEventDispatcher();
	let		changed: boolean = false;

	async function	removeFriend(username: string): Promise<void> {
		$socket.emit('delFriend', username);
		await mock();
    }

	function    mock(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 300));
    }

	async function	sendRequest(username: string): Promise<void> {
		$socket.emit('friendRequest', username);
	}

</script>

{#key changed}
	{#await retrieveOtherUserInfo($webAppIP)}
		<p>Loading</p>
	{:then otherUserInfo}
		{#if otherUserInfo === null}
			<h1>NON EXISTENT USER!</h1>
		{:else}
			<div id="container" style="padding-top: 20px;">
				<img id="image-profile" src={otherUserInfo['pictureLink']} alt="profile" height="100%" width="100%" />

				<div id="text-container">
					<p style="font-weight: bold; color: black; font-size: 3em">Username: {otherUserInfo['username']}</p>
					{#if $userInfo['blocklist'].includes(otherUserInfo['username'])}
						<p style="font-weight: bold; color: black; font-size: 2em">Status: blocked</p>
					{:else}
						<p style="font-weight: bold; color: black; font-size: 2em">Status: {otherUserInfo['status']}</p>
					{/if}
				</div>

				<div id="control panel">
					{#if $userInfo['friendsReq'].includes(otherUserInfo['username'])}
						<button>Friend request pending</button>
					{:else if otherUserInfo['friends'].includes($userInfo['username']) === false && $userInfo['blocklist'].includes(otherUserInfo['username']) === false}
						<button on:click={() => { sendRequest(otherUserInfo['username']);}}>Add friend</button>
					{:else if otherUserInfo['friends'].includes($userInfo['username'])}
						<button on:click={async () => { await removeFriend(otherUserInfo['username']); changed = (changed) ? false : true}}>Remove friend</button>
					{/if}
					{#if otherUserInfo['friends'].includes($userInfo['username']) && $inGameUsers.includes(otherUserInfo['username']) === false && $onlineUsers.includes(otherUserInfo['username'])}
						<button on:click={() => { $opponent = otherUserInfo['username']; dispatch('message', { path: "/invitationWindow" }) }}>Invite to play</button>
					{/if}
					{#if $userInfo['blocklist'].includes(otherUserInfo['username']) === false}
						<button on:click|preventDefault={ async () => { await blockUser($userInfo, otherUserInfo['username'], $webAppIP); $blockedUsers = $blockedUsers.concat(otherUserInfo['username']); dispatch('message', { path: '/profile' })} } >Block user</button>
					{:else}
						<button on:click|preventDefault={ async () => { await unblockUser($userInfo, otherUserInfo['username'], $webAppIP); $blockedUsers.splice($blockedUsers.indexOf(otherUserInfo['username']), 1); dispatch('message', { path: '/profile' })} } >Unblock user</button>
					{/if}
				</div>

				<div class="sec" id="match-history">
					<h2 style="margin-bottom: 0;">Match History</h2>
					<p style="color: black; margin-top: 0;">Last 5 battles</p>
					<MatchHistory userInfo={otherUserInfo} on:message />
				</div>

				<div class="sec" id="mine-stats">
					<h2>Stats</h2>
					<Stats userInfo={otherUserInfo} />
				</div>

				<div class="sec" id="achievements">
					<h2>Achievements</h2>
					<button on:click|preventDefault={() => dispatch('message', { path: "/achievements?user=" + otherUserInfo['username'] })}>See all</button>
				</div>
			</div>
		{/if}
	{/await}
{/key}

<style>

	p {
		font-family: 'TrashHand';
	}

	button {
		background-color: black;
		color: #fcd612;
		margin: 15px;
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

	h2, p {
		color: black;
	}

	div {
		margin-bottom: 30px;
	}

</style>
