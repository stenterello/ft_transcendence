<script lang="ts">
    import { onMount } from "svelte";
	import { userInfo, opponent } from "../../data";

	async function  updateUser(): Promise<void> {
        const   response: Response = await fetch('http://localhost:3000/users/' + $userInfo['username'] + '-token');
        const   json: Object = await response.json();
        $userInfo = json;
    }

	async function	getFriends(): Promise<Array<Object>> {
		await updateUser();
		const	response: Response = await fetch(
			'http://localhost:3000/users/' + $userInfo['username'] + '-token/friends'
		);
		const	json: Object = await response.json();
		let		ret: Array<Object> = [];
		for (let i = 0; i < Object.keys(json).length; i++) {
			const	res: Response = await fetch('http://localhost:3000/users/' + json[i] + '-token');
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

	onMount(() => { if ($opponent !== undefined) { document.getElementById('opponent').value = $opponent; } });

</script>

<div id="container">
	{#await getFriends()}
		<p>loading</p>
	{:then friends} 
		{#if friends.length > 0}
			<form>
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
				<input type="submit" value="Invite friend">
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