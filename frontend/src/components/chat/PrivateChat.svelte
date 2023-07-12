<script lang="ts">

	import { userInfo, statusChange, socket, webAppIP } from "../../data";
	import { createEventDispatcher, onMount } from "svelte";
	import { getStatus } from "./interactionUtils.svelte";
    import ChatSettings from "./ChatSettings.svelte";
	import Message from "./Message.svelte";

	const	dispatch = createEventDispatcher();

	export let	user: string = undefined;
	let			settings: boolean = false;
	let			messages: Array<Object> = [];

	async function	getPrivateMessages(): Promise<void> {
		const	res: Response = await fetch(`http://${$webAppIP}:3000/chat/` + $userInfo['username'] + '/' + user);
		const	json: Object = await res.json();
		messages = Object.values(json);
	}

	function	scrollDown(): void {
        if (document.getElementById('message-list-active') === null)
            return ;
		const	messages: HTMLCollection = document.getElementById('message-list-active').children;
		const	lastMessage: Element = messages[messages.length - 1];
        if (lastMessage !== undefined && lastMessage.nodeName !== "P")
    		lastMessage.scrollIntoView(false);
		else setTimeout(scrollDown, 200);
	}

	function	toggleChatSettings() {
		settings = (settings) ? false : true;
	}

	$socket.on('private message', async (info: Object) => {
		messages = messages.concat({createdAt: '', author: info['from'], message: info['msg']});
		setTimeout(scrollDown, 50);
	});

	onMount(() => scrollDown());

</script>

<section>
	<div id="header">
		<button on:click={() => { dispatch('unselect', null); } }><img src="left-arrow.png" alt="go back" /></button>
		{#key $statusChange}
			{#await getStatus(user, $webAppIP)}
				<h2>{user}</h2>
			{:then status}
				<h2>{user} <span>{status}</span></h2>
			{/await}
		{/key}
		<div class="settings">
			<img src="wrench.png" alt="settings" />
			<button on:click={toggleChatSettings} ></button>
		</div>
	</div>
	{#key settings}
		{#if settings === false}
			<ul id="message-list-active">
				{#await getPrivateMessages()}
					<p>loading</p>
				{:then}
					{#each messages as privateMessage}
						<Message {privateMessage} on:message />
					{/each}
				{/await}
			</ul>
		{:else}
			<ChatSettings {user} />
		{/if}
	{/key}
</section>

<style>
	section {
		height: 47%;
		background-color: white;
	}
	div {
		background-color: white;
	}
	#header {
		display: flex;
		background-color: black;
	}
	.settings {
		position: relative;
		padding: 3px;
		width: 15%;
	}
	.settings > img {
		width: 100%;
		height: 100%;
	}
	.settings > button {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: rgba(255,255,255,0);
	}
	button {
		display: inline-block;
		margin: 0;
		border: 2px solid black;
		border-radius: unset;
		width: 20%;
		border-right: none;
	}
	button > img {
		width: 100%;
		height: 100%;
		rotate: 180deg;
	}
	h2 {
		font-family: 'TrashHand';
		font-size: 2em;
		border: 2px solid black;
		margin: 0;
		width: 80%;
		color: white;
	}
	h2 > span {
		font-size: 0.4em;
	}
	ul {
		list-style-type: none;
        background-color: white;
        padding: 0;
        margin: 0;
        overflow: auto;
        height: 85%;
        overflow-wrap: anywhere;
        overflow: auto;
	}

</style>