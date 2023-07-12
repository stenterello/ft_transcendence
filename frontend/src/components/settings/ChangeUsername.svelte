<script lang="ts">

	import { createEventDispatcher } from 'svelte';
	import { deleteCookie, setCookie } from 'svelte-cookie';
	import { userInfo, bearer, webAppIP } from '../../data';
    import GetBearer from './GetBearer.svelte';

	const	dispatch = createEventDispatcher();

	async function	changeUsername(): Promise<void> {
		const   body: Object = new Object();
		body['oldUsername'] = $userInfo['username'];
		body['username'] = document.getElementById('new-username').value;

		const	res: Response = await fetch(`http://${$webAppIP}:3000/users/update/name`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(body)
		});

		if (res.status !== 400)
		{
			$userInfo['username'] = body['username'];
			deleteCookie('transcendence_session');
			setCookie('transcendence_session', $userInfo['username'] + '-token');
			dispatch('message', { path: "/profile" });
		}
		else if (document.getElementById('error') === null)
		{
			const	error: HTMLParagraphElement = document.createElement('p');
			const	body: Object = await res.json();
			const	textError: Text = document.createTextNode(body['message']);
			error.setAttribute('id', 'error');
			error.appendChild(textError);
			error.style.color = "#d61a1f";
			error.style.fontWeight = "bold";
			error.style.fontSize = "1.5em";
			document.getElementById('change-username-form').appendChild(error);
		}
	}

	$userInfo['new-username'] = "";

	let	hasBearer: boolean = (($bearer !== "") ? true : false);

	$: {
		hasBearer = (($bearer !== "") ? true : false);
	}

	
</script>

{#key hasBearer}
	{#if hasBearer === false && $userInfo['isOAuthLogged'] === false}
		<GetBearer on:bearer={ (event) => hasBearer = event.detail.bearer }/>
	{:else}
		<div class="outer">
			<form id="change-username-form">
				<h2>Set your new username</h2>
				<input id="new-username" bind:value={$userInfo['new-username']} type="text" required>
				<div>
					<img src="images/number_1.png" alt="number one logo" style="display:inline-block;" />
					<h1>{$userInfo['new-username']}</h1>
				</div>
				<button on:click|preventDefault={() => changeUsername()} style="font-family: TrashHand; color: white;">Submit</button>
			</form>
		</div>
	{/if}
{/key}

<style>

	.outer {
		background-image: url('images/notebook-page.jpg');
		min-height: 80vh;
		background-repeat: round;
	}

	form {
		background-color: unset;
	}

	div {
		height: 150px;
	}

	input {
		margin: 10px auto;
		min-width: 14vw;
		background-color: rgba(255,255,255,0);
		display: block;
		color: black;
		text-align: center;
		font-size: 2em;
	}

	h2 {
		font-family: 'TrashHand';
		color: #d61a1f;
		width: fit-content;
		margin: 7vh auto;
		font-size: 3em;
		border-radius: 2vw;
		padding: 0px 44px;
		box-shadow: 0px 0px 37px white inset;
		position: relative;
		top: 15px;
	}

	h1 {
		text-decoration: underline;
		width: fit-content;
		display: inline-block;
		position: relative;
		bottom: 10px;
		color: black;
		font-family: 'TrashHand';
		padding-left: 1vw;
	}

	button {
		background-color: black;
		width: 7vw;
		margin: 20px;
		box-shadow: 0px 0px 20px inset white;
		border: none;
	}

</style>
