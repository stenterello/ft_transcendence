<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { userInfo, webAppIP } from "../../data";

	const	dispatch = createEventDispatcher();

	function	isPassword(event): void {
		if (event.target.value === 'PROTECTED')
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
		const	policy: string = document.getElementById('room-privacy').value;
		let		password: string | null = null;

		if (document.getElementById('room-password-create') !== null)
			password = document.getElementById('room-password-create').value;

		const	json: Object = { user: $userInfo['username'], password: password, policy: policy};

		const	response: Response = await fetch(`http://${$webAppIP}:3000/chat/create/` + roomName, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(json)
		});
		if (response.status === 400)
		{
			if (document.getElementById('room-creation-err') === null) {
				const	err: HTMLElement = document.createElement('span');
				const	errText: Text = document.createTextNode('Room already exists');
				err.appendChild(errText);
				err.style.color = 'red';
				err.setAttribute('id', 'room-creation-err');
				document.getElementById('room-creation').appendChild(err);
			}
		}
		else {
			if (document.getElementById('room-creation-err') !== null)
				document.getElementById('room-creation-err').remove();
			dispatch('reloadRooms', null);
		}
	}

</script>

<form id="room-creation" on:submit|preventDefault={createRoom}>
	<button on:click={() => dispatch('roomOptions', null)} style="position: absolute; background-color: black; width: 4%; height: 9%; border-radius: 1vw; top: 5px; right: 5px; padding: 0; background: url('cross.png') no-repeat; background-size: cover;"></button>
	<label for="room-name">Insert room name</label>
	<input id="room-name" name="room-name" type="text" placeholder="insert room name">
	<br>
	<br>
	<label for="room-privacy">Set privacy option</label>
	<select id="room-privacy" on:change={isPassword} >
		<option value="PUBLIC">public</option>
		<option value="PROTECTED">protected</option>
	</select>
	<br>
	<br>
	<button>submit</button>
	<br>
</form>


<style>
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

	button {
		background-color: black;
		color: #fcd612;
		border-radius: 0;
		padding: 3% 20%;
	}
</style>
