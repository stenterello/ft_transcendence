<script lang="ts">

	import { userInfo, socket, roomSelected, webAppIP } from "../../data";
	import ChatRoom from "./ChatRoom.svelte";
    import RoomCreation from "./RoomCreation.svelte";

	let			roomOptions: boolean = false;
	let			ownedRooms: Array<Object> = [];
	let			otherRooms: Array<Object> = [];
	let			rooms: Array<Object> = [];
	let			roomInfo: Object | null = null;
	let			reloadRooms: boolean = false;
	let			room: string = undefined;

	async function	getRooms(): Promise<void> {
		const	res: Response = await fetch(`http://${$webAppIP}:3000/chat/rooms`);
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

	async function	chooseRoom(event): Promise<void> {
		roomInfo = rooms.find(elem => elem['name'] === event.target.innerHTML);
		if (roomInfo['banlist'].includes($userInfo['username']))
		{
			alert('You are banned. You can wait until room admins unban you - but you could find yourself waiting your entire life.')
			return ;
		}
		if (roomInfo['password'] !== null && roomInfo['members'].includes($userInfo['username']) === false)
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
		const bool = roomInfo['members'].includes($userInfo['username']);
		if (bool === false) {
			$socket.emit('joinRoom', JSON.stringify({'room': room, 'password': password}), (res: boolean) => {
				if (res === false) {
					if (document.getElementById('insert-password-err') === null) {
						const	err: HTMLElement = document.createElement('span');
						const	errText: Text = document.createTextNode('wrong password');
						err.appendChild(errText);
						err.style.color = 'red';
						err.setAttribute('id', 'insert-password-err');
						document.getElementById('insert-password').appendChild(err);
					}
					return ;
				}
				else {
					$roomSelected = room;
					if (document.getElementById('insert-password-err') !== null) {
						document.getElementById('insert-password-err').remove();
					}
				}
			});
		}
	}

	function	roomPrivacy(room: Object): string {
		if (room['password'] === null)
			return '[public]';
		else
			return '[protected]';
	}

	function	isToShow(room: Object): boolean {
		if (room['banlist'].includes($userInfo['username']))
			return false;
		if (room['policy'] === 'PRIVATE' && room['members'].includes($userInfo['username']) === false)
			return false;
		return true;
	}

	$socket.on('roomsChanged', () => { reloadRooms = (reloadRooms) ? false : true; })

</script>

{#key reloadRooms}
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
							{#if isToShow(room)}
								<li><button on:click|preventDefault={chooseRoom}>{room['name']}</button><span>{roomPrivacy(room)}</span></li>
							{/if}
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
				<form on:submit|preventDefault={() => { tryPassword(room, document.getElementById('room-password').value); document.getElementById('insert-password').style.visibility = 'hidden';}} id="insert-password" style="padding-top: 10px;">
					<button on:click|preventDefault={() => { document.getElementById('insert-password').style.visibility = 'hidden'; }} style="position: absolute; background-color: black; width: 4%; height: 11%; border-radius: 1vw; top: 10px; right: 20px; padding: 0; background: url('cross.png') no-repeat; background-size: cover; background-color: white;"></button>
					<p>This chat room is protected.</p>
					<p>Insert password</p>
					<input id="room-password" type="password" required>
					<input type="submit">
					<br>
				</form>
			</div>
			<hr>

			<button on:click={() => { roomOptions = (roomOptions === true) ? false : true}}>Create your room</button>

		</div>
	{/await}
{/key}

{#if roomOptions === true}
	<RoomCreation 
		on:roomOptions={() => { roomOptions = (roomOptions === true) ? false : true } } 
		on:reloadRooms={() => { roomOptions = false; reloadRooms = (reloadRooms) ? false : true; } } />
{/if}

{#key $roomSelected}
	<ChatRoom on:message on:reloadRooms={() => { roomOptions = false; reloadRooms = (reloadRooms) ? false : true; } }  />
{/key}

<style>
	#outer-container {
		height: 21%;
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
		height: 66%;
		visibility: hidden;
	}

	#insert-password > p {
		margin: 0;
	}

</style>