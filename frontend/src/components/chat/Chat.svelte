<script lang="ts">

	import { createEventDispatcher } from 'svelte';
	import { chat, socket, userInfo, bearer, userSelected, roomSelected, chatTab } from '../../data';
	import GeneralChat from './GeneralChat.svelte';
	import Rooms from './Rooms.svelte';
	import PrivateMessages from './PrivateMessages.svelte';

	let			height: string = ($chat) ? '90vh' : '0';

	const	dispatch = createEventDispatcher();

	function	toggleChat(): void {
		dispatch('toggle', null);
	}

	function	clear(): void {
		document.getElementById('user-text').value = '';
	}

	async function	sendMessage(): Promise<void> {
		const messages = document.getElementById('user-text').value;
		if (!messages.length || messages === "\n")
		{
			setTimeout(clear, 10);
			return ;
		}
		switch (+$chatTab) {
			case 0: {
				$socket.emit('general', messages); break ;
			}
			case 1: {
				$socket.emit('sendToRoom', JSON.stringify({'room': $roomSelected, 'message': messages}));
				console.log( JSON.stringify({'room': $roomSelected, 'message': messages}));
				console.log('ei')
				break ;
			}
			case 2: {
				$socket.emit('private message', JSON.stringify({ user: $userSelected, message: messages }));
				break ;
			}
		}
		setTimeout(clear, 10);
	}

	async function	updateUserInfo(): Promise<void> {
		const	response: Response = await fetch('http://localhost:3000/users/' + $userInfo['username'] + '-token');
		const	json: Object = await response.json();
		$userInfo = json;
		if ($bearer.length > 0)
			$userInfo['bearer'] = $bearer;
	}

	async function	setUserSelected(event): Promise<void> {
		await updateUserInfo();
		$userSelected = event.detail.user;
	}

	function	checkAndSendMessage(event: KeyboardEvent): void {
		if (event.key === 'Enter')
			sendMessage();
	}

	function	animateChat(b: boolean): void {
		const	elem: HTMLElement = document.getElementById('chat-window');

		if (b === true)
			elem.style.height = '0';
		else
			elem.style.height = '90vh';
	}

</script>

<section id="chat-container">
	{#if $chat === true}
		<button id="trigger">close chat</button>
		<button on:click={animateChat($chat)} id="trigger-open" on:click|preventDefault={toggleChat}>close chat</button>
	{:else}
		<button on:click={animateChat($chat)} id="trigger" on:click|preventDefault={toggleChat}>open chat</button>
	{/if}
	<div id="chat-window" style="height: {height}">
		<div id="menu">
			<button on:click={() => { $chatTab = 0; $userSelected = undefined; $roomSelected = undefined; } } style="color: #d61a1f;">general chat</button>
			<button on:click={() => { $chatTab = 1; $userSelected = undefined; $roomSelected = undefined; } } style="color: white;">rooms</button>
			<button on:click={() => $chatTab = 2} style="color: #fcd612;">private messages</button>
		</div>
		{#if $chatTab === 0}
			<GeneralChat on:message />
		{:else if $chatTab === 1}
			<Rooms on:message />
		{:else if $chatTab === 2}
			<PrivateMessages on:select-change={setUserSelected} />
		{/if}
		<div id="user-input">
			<textarea on:keydown={checkAndSendMessage} id="user-text" name="user-text" placeholder="write your message..."></textarea>
			<button on:click={sendMessage} id="send">send</button>
		</div>
	</div>
</section>

<style>

	#chat-container {
		width: 23vw;
		position: fixed;
		top: 15px;
		right: 15px;
		height: fit-content;
	}

	#trigger {
		background-color: black;
		color: #fcd612;
		box-shadow: 0px 0px 20px white;
		width: 100%;
		position: relative;
	}

	#trigger:hover, #trigger-open:hover {
		border-color: #fcd612;
	}

	#trigger-open {
		background-color: black;
		color: #fcd612;
		width: 100%;
		position: absolute;
		left: 0;
		z-index: 2;
	}
	
	#chat-window {
		width: 90%;
		margin: 0 auto;
		padding-top: 19px;
		border-radius: 5px;
		position: relative;
		top: -26px;
		position: relative;
		background-color: #f8b71d;
		transition: height 0.5s;
		overflow: hidden;
		z-index: -1;
		border: 3px solid #f8b71d;
	}

	#menu {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		height: 14%;
	}

	#menu > button {
		border-radius: 0;
		margin: 0;
		flex-basis: 34%;
		padding: 8% 0 5%;
		font-family: 'TrashHand';
		font-size: 1.2em;
		background-color: black;
		border: 1px solid white;
	}

	#user-input {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 13%;
	}

	textarea {
		background-color: #fcd612;
		color: black;
		width: 98%;
		margin: 0;
		padding: 0 1%;
		position: absolute;
		top: 0;
		right: 0;
		resize: none;
		border-top: 1px solid black;
		height: 60%;
	}

	textarea:focus-visible {
		outline: none;
	}

	#send {
		width: 100%;
		background-color: black;
		color: #fcd612;
		margin: 0;
		padding: 0;
		position: absolute;
		bottom: 0;
		right: 0;
		border-radius: 0;
		height: 40%;
	}

</style>
