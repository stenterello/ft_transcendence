<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { userInfo, bearer, webAppIP } from "../../data";
	import GetBearer from "./GetBearer.svelte";

	const	dispatch = createEventDispatcher();

	async function  toggle2FAuth(): Promise<void> {
		const  obj: Object = { 'username': $userInfo['username'], 'email': $userInfo['email'] };

		const  response: Response = await fetch(`http://${$webAppIP}:3000/auth/2fa/generate`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'Authorization': 'Bearer ' + $userInfo['access_token']
		},
		body: JSON.stringify(obj)
		});

		const  json: Object = await response.json();
		qr = true;
		const  data: string = JSON.stringify(json);
		const  qrImage: HTMLImageElement = document.createElement('img');
		qrImage.setAttribute('src', data.substring(1, data.length - 1));
		document.getElementById('container').appendChild(qrImage);
	}

	async function	verifyTwoFactor(): Promise<void> {

		const	token: string = document.getElementById('token').value;

		if (!token.length)
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('You must insert token');
				err.appendChild(errText);
				err.setAttribute('id', 'error');
				err.style.color = '#d61a1f';
				document.getElementById('container').appendChild(err);
				return ;
			}
			else if (document.getElementById('error').innerText !== 'You must insert token')
				document.getElementById('error').innerText = 'You must insert token';
		}

		const	obj: Object = { 'username': $userInfo['username'], 'twoFactorAuthenticationCode': token };

		const	response: Response = await fetch(`http://${$webAppIP}:3000/auth/2fa/toggle`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + $userInfo['access_token']
			},
			body: JSON.stringify(obj)
		});

		if (!response.ok)
		{
			if (document.getElementById('error') === null)
			{
				const	err: HTMLElement = document.createElement('p');
				const	errText: Text = document.createTextNode('Your request was not valid');
				err.appendChild(errText);
				err.setAttribute('id', 'error');
				err.style.color = '#d61a1f';
				document.getElementById('container').appendChild(err);
				return ;
			}
			else if (document.getElementById('error').innerText !== 'Your request was not valid')
				document.getElementById('error').innerText = 'Your request was not valid';
		}
		else
		{
			dispatch('message', { path: '/profile' });
		}
	}

	let	hasBearer: boolean = (($bearer !== "") ? true : false);
	let	qr: boolean	= false;

	if ($userInfo['isOAuthLogged'] === true)
		dispatch('message', { path: '/profile' });

	$: {
		hasBearer = (($bearer !== "") ? true : false);
	}

</script>

<div id="container">
{#if qr}
	<p id="scan">SCAN ME</p>
	<p>Insert your first token so you can use Google Authenticator to manage this profile</p>
	<input id="token" type="password" required>
	<button on:click={verifyTwoFactor}>Submit</button>
{:else}
	{#key hasBearer}
		{#if hasBearer === false}
			<GetBearer on:bearer={ (event) => hasBearer = event.detail.bearer }/>
		{:else}
			<div id="inner">
				<p>Do you wanna have two factor authentication method?</p>
				<p id="status">Actual status: {$userInfo['istwofaEnable']}</p>
				<button on:click|preventDefault={toggle2FAuth} type="submit">Toggle</button>
			</div>
		{/if}
	{/key}
{/if}
</div>
			
<style>

	#container {
		background-image: url('images/keys.png');
		background-size: cover;
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#inner {
		background-color: rgba(255,255,255,0.6);
		padding: 20px;
		color: black;
	}

	#status {
		width: fit-content;
		color: turquoise;
		background-color: black;
		margin: 20px auto;
		padding: 10px 20px;
	}

	p {
		background-color: black;
		color: white;
	}

</style>
