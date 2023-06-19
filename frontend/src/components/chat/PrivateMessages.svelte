<script lang="ts">
    import { newMessage, onlineUsers, statusChange, userInfo, userSelected } from "../../data";
	import { createEventDispatcher } from "svelte";
    import OnlineUsersPrivateMessages from "./OnlineUsersPrivateMessages.svelte";
	import PrivateChat from "./PrivateChat.svelte";
    import { retrieveOtherUserInfoByName, getStatus } from "./interactionUtils.svelte";
	import MessagesButton from "./MessagesButton.svelte";

	const	dispatch = createEventDispatcher();

	function	otherUsers(): Array<string> {
		const	ret: Array<string> = [];
		$onlineUsers.forEach((user) => {
			if ($userInfo['friends'].includes(user) === false)
				ret.push(user);
		})
		return (ret);
	}


</script>

<div id="users-container">
	<h4>Friends</h4>
	{#key $statusChange}
		<OnlineUsersPrivateMessages users={$userInfo['friends']} areFriends={true} --height="30%" on:message on:select-chat={ (event) => { $userSelected = event.detail.user; dispatch('select-change', { user: event.detail.user }); } }/>
	{/key}

	<h4>Other users</h4>
	{#key $statusChange}
		<OnlineUsersPrivateMessages users={otherUsers()} --height="30%" on:message on:select-chat={ (event) => { $userSelected = event.detail.user; dispatch('select-change', { user: event.detail.user }); } }/>
	{/key}
</div>

{#key $newMessage}
	{#key $userSelected}
		{#if $userSelected !== undefined}
			<PrivateChat user={$userSelected} on:unselect={ () => { dispatch('select-change', { user: undefined }); $userSelected = undefined; }} />
		{:else if $userInfo['privateConv'].length > 0}
			<div id="message-history">
				<ul>
				{#each $userInfo['privateConv'] as conversation}
					{#await retrieveOtherUserInfoByName(conversation)}
						<p>loading</p>
					{:then user}
						<MessagesButton {user} on:select-change />
					{/await}
				{/each}
				</ul>
			</div>
		{:else}
			<p>no private messages in your history</p>
		{/if}
	{/key}
{/key}

<style>
	h4 {
		margin: 0;
		background-color: black;
		color: #f9c31a;
		height: 20%;
		margin: 0;
		box-shadow: 0px 0px 10px #fcd612 inset;
		justify-content: center;
		align-items: center;
		display: flex;
	}
	ul {
		list-style-type: none;
		padding: 0;
	}
	#message-history {
		overflow: auto;
		height: 46%;
		border-top: 1px solid black;
	}
	#users-container {
		height: 25%;
	}
</style>