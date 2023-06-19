<script lang="ts">
	
	import { settings } from "../utils";
    import ChangeAvatar from "./settings/ChangeAvatar.svelte";
    import ChangeUsername from "./settings/ChangeUsername.svelte";
    import ChangePassword from "./settings/ChangePassword.svelte";
    import TwoFactorManagement from "./settings/TwoFactorManagement.svelte";

	export let	settingsState: settings = settings.other + 1;

</script>

<div>
	{#if settingsState === settings.twoFactorManagement}
		<TwoFactorManagement on:message />
	{:else if settingsState === settings.changeUsername}
		<ChangeUsername on:message />
	{:else if settingsState === settings.changeAvatar}
		<ChangeAvatar on:message />
	{:else if settingsState === settings.changePassword}
		<ChangePassword on:message />
	{:else}
		<p>What are you trying to do?</p>
	{/if}
</div>


<style>

	div {
		background-color: #f8b71d;
		border-radius: 1vw;
		width: 50vw;
		min-height: 20vh;
	}

</style>
