<script lang="ts">

	import { userInfo } from "../../data";
	import ChatRoom from "./ChatRoom.svelte";
	import { socket } from "../../data";

	let			roomOptions: boolean = false;
	let      toDelete: boolean = false;
  	let      owningRooms: Array<string> = [];
	let			rooms: Array<Object> = [];
	let			chat: string | null = null;
	let			roomInfo: Object | null = null;

	async function	getRooms(): Promise<Array<Object>> {
		const	res: Response = await fetch('http://localhost:3000/chat/rooms');
		if (res.ok)
		{
			const	json: Object = await res.json();
			const	ret: Array<Object> = [];
			for (let i = 0; i < Object.keys(json).length; i++) {
				ret.push(json[i]);
			}
			return ret;
		}
	}

	function	isPassword(event): void {
		if (event.target.value === 'protected')
		{
			const	input: HTMLInputElement = document.createElement('input');
			input.type = 'text';
			input.placeholder = 'set your password';
			input.setAttribute('id', 'room-password');
			const	select: HTMLElement = document.getElementById('room-privacy');
			select.after(input);
		}
		else if (document.getElementById('room-password') !== null)
			document.getElementById('room-password').remove();
	}

	async function	createRoom() {
		const	roomName: string = document.getElementById('room-name').value;
		let		password: string | null = null;
		if (document.getElementById('room-password') !== null)
			password = document.getElementById('room-password').value;
		const	json: Object = { user: $userInfo['username'], password: password };

		await fetch('http://localhost:3000/chat/create/' + roomName, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(json)
		});

		rooms = await getRooms();
	}

	async function	chooseRoom(event): Promise<void> {
		chat = event.target.innerHTML;
		roomInfo = rooms.find(elem => elem['name'] === chat);
	}

	async function	loadRooms(): Promise<void> {
		rooms = await getRooms();
	}

	async function getOwningRooms(): Promise<Array<Object>> {
		const  res: Response = await fetch('http://localhost:3000/chat/rooms');
		if (res.ok)
		{
		owningRooms = [];
		const  json: Object = await res.json();
		for (let i = 0; i < Object.keys(json).length; i++) {
			owningRooms.push(json[i]['name']);
		}
		console.log(owningRooms);
		toDelete = true;
		return owningRooms;
		}
	}

	async function deleteRoom(event) {
		chat = event.target.innerHTML;
		$socket.emit("deleteRoom", chat);
	}

	loadRooms();

</script>

{#key rooms}
	{#if rooms.length === 0}
		<p>No rooms yet</p>
	{:else}
		<ul>
			{#each rooms as room}
				<li><button on:click|preventDefault={chooseRoom}>{room['name']}</button></li>
			{/each}
		</ul>
	{/if}
{/key}

<hr>

<button on:click={() => { roomOptions = (roomOptions === true) ? false : true}}>Create your room</button>
<button on:click|preventDefault={getOwningRooms} type="submit">delete room</button>

{#if toDelete === true}
    {#key owningRooms}
      {#if owningRooms.length === 0}
        <p>No rooms yet</p>
      {:else}
        <ul>
          {#each owningRooms as room}
            <li><button on:click|preventDefault={deleteRoom}>{room}</button></li>
          {/each}
        </ul>
      {/if}
    {/key}
{/if}

{#if roomOptions === true}
	<form>
		<label for="room-name">Insert room name</label>
		<input id="room-name" name="room-name" type="text" placeholder="insert room name">
		<br>
		<br>
		<label for="room-privacy">Set privacy option</label>
		<select id="room-privacy" on:change={isPassword} >
			<option value="public">public</option>
			<option value="protected">protected</option>
			<option value="private">private</option>
		</select>
		<br>
		<br>
		<input on:click|preventDefault={createRoom} type="submit">
	</form>
{/if}

{#key chat}
	<ChatRoom {chat} {roomInfo} />
{/key}

<style>
	form {
		border: 1px solid black;
		border-radius: 1vw;
		width: fit-content;
		margin: 30px auto;
		padding: 15px;
		z-index: 2;
		position: relative;
		background-color: inherit;
	}

	label {
		background-color: aliceblue;
		border-radius: 3px;
		padding: 3px;
		margin: 5px;
	}

	ul {
		list-style-type: none;
		padding: 10px;
		max-height: 10%;
		overflow: auto;
	}

	li {
		border: 1px solid black;
		margin: 7px auto;
	}
	
	li:hover {
		background-color: 	#f9c31a;
	}

	li > button {
		background-color: unset;
		width: 100%;
	}

	li > button:hover {
		border: none;
	}

</style>