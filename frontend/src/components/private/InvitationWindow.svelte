<script lang="ts">
    import { onMount } from "svelte";
	import { userInfo, opponent, socket, webAppIP } from "../../data";
	import { createEventDispatcher } from 'svelte';

	const	dispatch = createEventDispatcher();

	async function  updateUser(): Promise<void> {
        const   response: Response = await fetch(`http://${$webAppIP}:3000/users/` + $userInfo['username'] + '-token');
        const   json: Object = await response.json();
        $userInfo = json;
    }

	async function	getFriends(): Promise<Array<Object>> {
		await updateUser();
		const	response: Response = await fetch(
			`http://${$webAppIP}:3000/users/` + $userInfo['username'] + '-token/friends'
		);
		const	json: Object = await response.json();
		let		ret: Array<Object> = [];
		for (let i = 0; i < Object.keys(json).length; i++) {
			const	res: Response = await fetch(`http://${$webAppIP}:3000/users/` + json[i] + '-token');
			const	elem: Object = await res.json();
			ret.push(elem);
		}
		return ret;
	}

	function	changeMapPreview(event): void {
		const	selectElement: HTMLSelectElement = event.target;
		const	value: string = selectElement.options[selectElement.selectedIndex].value;
		const	img: HTMLElement = document.getElementById('preview');
		if (value !== 'default')
			img.setAttribute('src', 'images/maps/' + value);
		else
			img.setAttribute('src', 'images/maps/previews/default-preview.png');
	}

	async function	isOnline(user: string): Promise<boolean> {
		const	userObj: Response = await fetch(`http://${$webAppIP}:3000/users/` + user + '-token');
		const	json: Object = await userObj.json();
		if (json['status'] === 'online')
			return true;
		return false;
	}

	async function	inviteFriendToPlay(info: Object): Promise<void> {
		const	online: boolean = await isOnline(info['user']);
		if (online === false) {
			if (document.getElementById('status-err') === null) {
				const	err: HTMLElement = document.createElement('span');
				const	errText: Text = document.createTextNode('User is not available');
				err.appendChild(errText);
				err.style.color = 'red';
				err.setAttribute('id', 'status-err');
				document.getElementById('custom-game').appendChild(err);
			}
			return ;
		}
		$opponent = info['user'];
		const	gameInfo: Object = {
			map: info['map'],
			points: info['points'],
			speed: info['speed'],
			size: info['size']
		};
		info['gameInfo'] = gameInfo;
		$socket.emit('invite to private game', JSON.stringify(info));
		dispatch('message', { path: "/waitingUser" });
	}

	onMount(() => { if ($opponent !== undefined) { setTimeout(() => {document.getElementById('opponent').value = $opponent;}, 100); } });

</script>

<div id="container">
	{#await getFriends()}
		<p>loading</p>
	{:then friends} 
		{#if friends.length > 0}
			<form id="custom-game">
				<label for="opponent">choose your opponent</label>
				<select id="opponent">
					{#each friends as friend}
						<option value="{friend['username']}">{friend['username']}</option>
					{/each}
				</select>
				<br>
				<label for="map">select map</label>
				<select id="map" on:change={changeMapPreview}>
					<option value="default">default map (black and white)</option>
					<option value="beatrix-vs-oren.jpg">The House of Blue Leaves</option>
				</select>
				<br>
				<label for="points">select points goal</label>
				<select id="points">
					<option value="5">default (5)</option>
					<option value="10">10</option>
					<option value="20">20</option>
				</select>
				<br>
				<label for="racket-size">select racket size</label>
				<select id="racket-size">
					<option value="15">small</option>
					<option value="30">normal</option>
					<option value="45">large</option>
				</select>
				<br>
				<label for="ball-speed">select ball speed</label>
				<select id="ball-speed">
					<option value="0.5">slow</option>
					<option value="1">normal</option>
					<option value="1.5">fast</option>
				</select>
				<br>
				<input on:click|preventDefault={() => inviteFriendToPlay({
					user: document.getElementById('opponent').value,
					map: document.getElementById('map').value,
					points: document.getElementById('points').value,
					speed: document.getElementById('ball-speed').value,
					size: document.getElementById('racket-size').value
				})} type="submit" value="Invite friend">
			</form>
			<div id="map-preview">
				<p>Map preview</p>
				<img id="preview" src="images/maps/previews/default-preview.png" alt="default map preview" />
			</div>
		{:else}
			<p>You have no friends yet :(</p>
		{/if}
	{/await}
</div>

<style>
	#container {
		padding: 3vw;
		width: 45vw;
		border-radius: 1vw;
		background-color: #fcd612;
	}
	form {
		display: flex;
		width: 70%;
		margin: 0 auto;
		flex-wrap: wrap;
		row-gap: 3vh;
		justify-content: space-between;
	}
	label {
		font-family: 'TrashHand';
		font-size: 2em;
		flex-basis: 40%;
		color: black;
	}
	select {
		flex-basis: 40%;
		border-radius: 1vw;
	}
	option {
		text-align: center;
	}
	input[type="submit"] {
		flex-basis: 100%;
		height: 3em;
		font-family: 'TrashHand';
		font-size: 1.5em;
		background-color: black;
		color: #fcd612;
		border-radius: 1vw;
	}
	#map-preview {
		width: 75%;
		margin: 40px auto 0;
	}
	#map-preview > img {
		width: 96%;
	}
	p {
		font-family: 'TrashHand';
		font-size: 2em;
		color: black;
	}
</style>