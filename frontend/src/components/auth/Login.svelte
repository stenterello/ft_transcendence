<script lang="ts">

	import { loginWithPassword } from "./authenticationUtils.svelte";
	import { createEventDispatcher } from "svelte";
	import { setCookie } from 'svelte-cookie';
	import { webAppIP } from "../../data";

	const appUID: string = 'u-s4t2ud-adc0efe1a0bf91978d89796314b8297930becce3a35c95f623c2059b571c45ad';

	const	dispatch = createEventDispatcher();

	async function	login(): Promise<void> {
		const username: string = document.getElementById('username').value;
		const password: string = document.getElementById('password').value;
		const cookie: string = username + '-token';
		const cookieDays: number = 7;

		const response: Response = await loginWithPassword(username, password, $webAppIP);
		if (response.ok) {
			const	json: Object = await response.json();
			const	bearer: string = json['access_token'];
			const	tmpResponse: Response = await fetch(`http://${$webAppIP}:3000/users/` + cookie);
			const	tmpJson: Object = await tmpResponse.json();
			if (tmpJson.hasOwnProperty('istwofaEnable') && tmpJson['istwofaEnable'] === true)
			{
				dispatch('message', { path: "/2faToken", userInfo: tmpJson, bearer: bearer });
				return ;
			}
			setCookie('transcendence_session', cookie, cookieDays, false);
			dispatch('message', { path: "/profile", bearer: bearer });
		}
		else if (document.getElementById('error') === null) {
			const	error = document.createElement("p");
			const	textError = document.createTextNode("Login failed: username or password incorrect.");
			error.setAttribute('id', 'error');
			error.appendChild(textError);
			error.style.color = "#d61a1f";
			error.style.fontSize = "0.6em";
			document.getElementById('login-form').appendChild(error);
		}
	}

	function	changePath(event) {
		dispatch('message', { path: event.target.getAttribute("href") });
	}

</script>

<section>
	
	<div style="margin-bottom: 35px;">
		<a href="https://api.intra.42.fr/oauth/authorize?client_id={appUID}&redirect_uri=http%3A%2F%2F10.12.5.1%3A3000%2Fauth%2Fcode&response_type=code">
			Login to ft_transcendence with 42intra
		</a>
	</div>

	<div>
		<p>Login to ft_transcendence</p>
		<form id="login-form">
			<input id="username" type="text" placeholder="Enter your username" required autocomplete="off">
			<input id="password" type="password" placeholder="Enter your password" required>
			<button on:click|preventDefault={login}>Login</button>
		</form>
		<br>
		<p>You don't have an account? <a on:click|preventDefault={changePath} href="/register">Register here</a></p>
	</div>

</section>

<style>

	section {
		border: 1px solid rgba(255,255,255,0.5);
		width: fit-content;
		padding: 20px 30px;
		border-radius: 1em;
		background-color: rgb(15,15,15);
		box-shadow: 0px 0px 40px white;
	}

	div {
		width: 100%;
		height: 100%;
		background-color: inherit;
		color: white;
		margin: 0;
		border-radius: 1vw;
		margin-bottom: 10px;
	}
	
	a {
		color: white;
		background-color: gray;
		border-radius: 1vw;
		padding: 6px 15px;
		margin-left: 1vw;
	}

	p {
		margin: 0 0 10px 0;
	}

	form :global(input) {
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
