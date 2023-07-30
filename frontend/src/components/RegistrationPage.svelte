<script lang="ts">

	import { createEventDispatcher } from 'svelte';
	import { setCookie, getCookie } from 'svelte-cookie';
	import { addDays } from './auth/authenticationUtils.svelte';
	import { webAppIP } from '../data';

	const	dispatch = createEventDispatcher();

	async function	registerWithPassword(username: string, email: string, password: string, cookie: string, cookieDays: number): Promise<Response> {
		const	date: Date = new Date();
		const	map: Map<string, string> = new Map([
			['username', username],
			['password', password],
			['email', email],
			['cookie', cookie],
			['expires', addDays(date, cookieDays).toISOString()]
		]);
		const json: Object = Object.fromEntries(map);
		const response: Response = await fetch(`http://${$webAppIP}:3000/users/create`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(json)
		});
		return (response);
	}

	async function	register(): Promise<void> {
		const username: string = document.getElementById('username').value;
		const email: string = document.getElementById('email').value;
		const password: string = document.getElementById('password').value;
		const cookie: string = username + '-token';
		const cookieDays: number = 7;

		const response: Response = await registerWithPassword(username, email, password, cookie, cookieDays);
		if (response.status >= 200 && response.status < 300) {
			setCookie('transcendence_session', cookie, cookieDays, false);
			dispatch('message', { path: "/profile" });
		}
		else if (document.getElementById('error') === null) {
			const	error: HTMLParagraphElement = document.createElement("p");
			const	body: Object = await response.json();
			const	textError: Text = document.createTextNode(body['message']);
			error.setAttribute('id', 'error');
			error.appendChild(textError);
			error.style.color = "#d61a1f";
			error.style.fontSize = "0.6em";
			document.getElementById('register-form').appendChild(error);
		}
	}

	if (getCookie('transcendence_session').length > 0)
	{
		dispatch('message', { path: "/profile" })
	}

</script>

<section>
	<h2>Welcome to ft_transcendence</h2>
	<p>Fill the fields below and soon you'll play the best videogame on this server.</p>

	<form id="register-form">
		<label for="username">username: </label>
		<input id="username" type="text" name="username" placeholder="Enter your username" required>
		<label for="email">email: </label>
		<input id="email" type="email" name="email" placeholder="Enter your email" required>
		<label for="password">password: </label>
		<input id="password" type="password" name="password" placeholder="Enter your password" required>
		<p></p>
		<button on:click|preventDefault={register}>register</button>
	</form>
</section>

<style>

	section {
		border: 1px solid rgba(255,255,255,0.5);
		width: fit-content;
		padding: 20px 30px;
		border-radius: 1em;
		background-color: rgb(15,15,15);
		box-shadow: 0px 0px 40px white;
		color: white;
	}

	form {
		border-radius: 1vw;
		padding: 10px;
		display: grid;
		grid-template-columns: 40% 50%;
		color: white;
	}
	
	form :global(input), form :global(label) {
		display: block;
		width: fit-content;
		margin: 10px auto;
		border-radius: 1vw;
		padding: 3px 8px;
	}

	form > button {
		padding: 6px 35px;
		margin-top: 10px;
	}

</style>
