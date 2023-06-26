<script lang="ts">

	import { userInfo, socket, roomSelected } from "../../data";
	import ChatRoom from "./ChatRoom.svelte";

	let			roomOptions: boolean = false;
	let     	toDelete: boolean = false;
  	let     	owningRooms: Array<string> = [];
	let			ownedRooms: Array<Object> = [];
	let			otherRooms: Array<Object> = [];
	let			rooms: Array<Object> = [];
	let			chat: string | null = null;
	let			roomInfo: Object | null = null;
	let			roomChange: boolean = false;
	let			room: string = undefined;

	async function	getRooms(): Promise<void> {
		const	res: Response = await fetch('http://localhost:3000/chat/rooms');
		let		ret: Array<Object> = [];
		if (res.ok)
		{
			const	json: Object = await res.json();
			for (let i = 0; i < Object.keys(json).length; i++) {
				ret.push(json[i]);
			}
		}
		otherRooms = [];
		ownedRooms = [];
		rooms = [];
		if (Object.keys(ret).length === 0) {
			return ;
		}
		else {
			for (let i = 0; i < Object.keys(ret).length; i++) {
				if (ret[i]['admins'].includes($userInfo['username']))
					ownedRooms.push(ret[i]);
				else
					otherRooms.push(ret[i]);
				rooms.push(ret[i]);
			}
		}
	}

	function	isPassword(event): void {
		if (event.target.value === 'protected')
		{
			const	input: HTMLInputElement = document.createElement('input');
			input.type = 'text';
			input.placeholder = 'set your password';
			input.setAttribute('id', 'room-password-create');
			const	select: HTMLElement = document.getElementById('room-privacy');
			select.after(input);
		}
		else if (document.getElementById('room-password-create') !== null)
			document.getElementById('room-password-create').remove();
	}

	async function	createRoom(): Promise<void> {
		const	roomName: string = document.getElementById('room-name').value;
		let		password: string | null = null;
		if (document.getElementById('room-password-create') !== null)
			password = document.getElementById('room-password-create').value;
		const	json: Object = { user: $userInfo['username'], password: password };

		await fetch('http://localhost:3000/chat/create/' + roomName, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(json)
		});
		roomChange = (roomChange) ? false : true;		
	}

	async function	chooseRoom(event): Promise<void> {
		roomInfo = rooms.find(elem => elem['name'] === event.target.innerHTML);
		if (roomInfo['password'] !== null && room === undefined && roomInfo['members'].includes($userInfo['username']) === false)
		{
			room = event.target.innerHTML;
			document.getElementById('insert-password').style.visibility = 'visible';
			return ;
		}
		$roomSelected = event.target.innerHTML;
		if (roomInfo['members'].includes($userInfo['username']) === false) {
			$socket.emit('joinRoom', JSON.stringify({'room': $roomSelected}));
		}
	}

	async function	tryPassword(room: string, password: string): Promise<void> {
		$roomSelected = room;
		if (roomInfo['members'].includes($userInfo['username'] === false)) {
			$socket.emit('joinRoom', JSON.stringify({'room': $roomSelected, 'password': password}));
		}
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

	function	roomPrivacy(room: Object): string {
		if (room['password'] === null)
			return '[public]';
		else
			return '[protected]';
	}

</script>

{#key roomChange}
	{#await getRooms()}
		<p>loading rooms</p>
	{:then} 
		<div id="outer-container">
			<div id="room-container">
				<h3>rooms available</h3>
				<h3>your rooms</h3>
				{#if otherRooms.length === 0}
					<p>No rooms</p>
				{:else}
					<ul>
						{#each otherRooms as room}
							<li><button on:click|preventDefault={chooseRoom}>{room['name']}</button><span>{roomPrivacy(room)}</span></li>
						{/each}
					</ul>
				{/if}
				{#if ownedRooms.length === 0}
					<p>No owned rooms</p>
				{:else}
					<ul>
						{#each ownedRooms as room}
							<li><button on:click|preventDefault={chooseRoom}>{room['name']}</button></li>
						{/each}
					</ul>
				{/if}
				<form on:submit|preventDefault={() => tryPassword(room, document.getElementById('room-password').value)} id="insert-password">
					<button on:click={() => { document.getElementById('insert-password').style.visibility = 'hidden'; }} style="position: absolute; background-color: black; width: 4%; height: 11%; border-radius: 1vw; top: 10px; right: 20px; padding: 0; background: url('cross.png') no-repeat; background-size: cover; background-color: white;"></button>
					<p>This chat room is protected.</p>
					<p>Insert password</p>
					<input id="room-password" type="password" required>
					<input type="submit">
				</form>
			</div>
			<hr>

			<button on:click={() => { roomOptions = (roomOptions === true) ? false : true}}>Create your room</button>

		</div>
	{/await}
{/key}

<!-- <button on:click|preventDefault={getOwningRooms} type="submit">delete room</button> -->

<!-- {#if toDelete === true}
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
{/if} -->

{#if roomOptions === true}
	<form>
		<button on:click={() => { roomOptions = (roomOptions === true) ? false : true}} style="position: absolute; background-color: black; width: 4%; height: 9%; border-radius: 1vw; top: 5px; right: 5px; padding: 0; background: url('cross.png') no-repeat; background-size: cover;"></button>
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

{#key $roomSelected}
	<ChatRoom chat={$roomSelected} />
{/key}

<style>
	#outer-container {
		height: 25%;
		position: relative;
	}
	#room-container {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		justify-content: center;
		max-height: 80%;
		overflow: auto;
	}

	#room-container > h3, #room-container > ul {
		margin: 0;
		padding: 0;
	}

	#room-container > p {
		color: black;
		max-width: fit-content;
		margin: 0 auto;
	}

	#room-container > h3 {
		flex-basis: 50%;
		font-family: 'TrashHand';
		color: black;
	}

	#room-container > ul {
		flex-basis: 49%;
		background-color: white;
		overflow: auto;
	}

	#room-container > ul:first-of-type {
		border-right: 1px solid black;
	}

	form {
		border: 1px solid black;
		border-radius: 1vw;
		width: fit-content;
		margin: 30px auto;
		padding: 25px 15px 15px;
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
		width: 60%;
		height: fit-content;
	}

	li > span {
		font-size: 0.8em;
		margin: 0;
		padding: 0;
	}

	button {
		background-color: black;
		color: #fcd612;
		border-radius: 0;
		padding: 3% 20%;
	}
	
	li:hover {
		background-color: 	#f9c31a;
	}

	li > button {
		background-color: unset;
		width: 100%;
		color: black;
	}

	li > button:hover {
		border: none;
	}

	#insert-password {
		background-color: black;
		position: absolute;
		color: white;
		width: 100%;
		margin: 0;
		height: 60%;
		visibility: hidden;
	}

	#insert-password > p {
		margin: 0;
	}

</style>