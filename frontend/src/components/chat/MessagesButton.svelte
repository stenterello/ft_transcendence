<script lang="ts">

	import { createEventDispatcher } from "svelte";
	import { statusChange, newMessage, userSelected, userInfo, webAppIP } from "../../data";
	import { getStatus, getLastMessage } from "./interactionUtils.svelte";

	export let	user: Object = undefined;
	const		dispatch = createEventDispatcher();
</script>

<li>
	<div class="info">
		<p>{user['username']}</p>
		{#key $statusChange}
			{#await getStatus(user['username'], $webAppIP)}
				<span style="color: rgba(255,255,255,0);">online</span>
			{:then status}
				<span>{status}</span>
			{/await}
		{/key}
	</div>
	{#key $newMessage}
		{#await getLastMessage($userInfo, user['username'], $webAppIP)}
			<div class="message">
				<p id="truncate"></p>
			</div>
			<p id="time"></p>
		{:then message}
			<div class="message">
				<p id="truncate">{message['author']}: {message['message']}</p>
			</div>
			<p class="time">{message['createdAt'].substring(0, 10)}</p>
		{/await}
	{/key}
	<button on:click={() => { dispatch('select-change', { user: user['username'] }); $userSelected = user['username']; } }></button>
</li>

<style>
	li {
		display: flex;
		background-color: white;
		border-radius: 1vw;
		margin: 5px;
		border: 1px solid black;
		position: relative;
		align-items: center;
	}
	button {
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 1vw;
		box-shadow: 0px 0px 4px black inset;
		background-color: rgba(255,255,255,0);
		margin: 0;
	}
	.info {
		width: 20%;
		border-right: 1px solid black;
		padding: 7px 20px;
		background-color: black;
		border-top-left-radius: 1vw;
		border-bottom-left-radius: 1vw;
	}
	.info > p {
		margin: 0;
	}
	.message {
		width: 80%;
	}
	.message > p {
		width: fit-content;
		margin: 10% auto;
	}
	.info > p, .info > span {
		font-family: 'TrashHand';
		color: white;
	}
	.time {
		margin: 0 10px;
		color: rgba(0,0,0,120);
		font-size: 0.7em;
		text-align: right;
		width: fit-content;
		white-space: nowrap;
	}
</style>