<script lang="ts">
	import { getParams } from "../utils";
	import { authenticationState } from "./auth/authenticationUtils.svelte";
	import Login from "./auth/Login.svelte";
	import GetToken from "./auth/GetToken.svelte";
	import AuthError from "./auth/AuthError.svelte";
    import Logged from "./Logged.svelte";

	let			codeBench: string | undefined = undefined;

	function	defineState(): authenticationState {
		const	params: Object = getParams(location.href);
		const	nParams: number = Object.keys(params).length;

		if (nParams === 0)
			return (authenticationState.initial);
		else if (nParams === 1 && params['code'] !== undefined)
		{
			codeBench = params['code'];
			return (authenticationState.authorizationCode);
		}
		return (authenticationState.error);
	}

	const state: authenticationState = defineState();
	
</script>

{#if state === authenticationState.initial}
	<Login on:message />
{:else if state === authenticationState.authorizationCode}
	<GetToken code={codeBench} on:message />
{:else if state === authenticationState.withCookie}
	<Logged on:message />
{:else}
	<AuthError on:message />
{/if}
