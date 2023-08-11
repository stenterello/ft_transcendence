<script lang="ts">

	import { settings } from "../utils";
	import Settings from "./Settings.svelte";
	import ProfilePage from "./private/ProfilePage.svelte";
	import Notifications from "./utils/Notifications.svelte";
    import NavBar from "./utils/NavBar.svelte";
	import { userInfo, page_shown, webAppIP } from '../data';
	import VisitProfile from "./private/VisitProfile.svelte";
	import Friends from "./private/Friends.svelte";
    import InvitationWindow from "./private/InvitationWindow.svelte";
    import Achievements from "./private/Achievements.svelte";
    import WaitingRoom from "./game/WaitingRoom.svelte";
	import Game from "./game/Game.svelte";
    import LeaderBoard from "./private/LeaderBoard.svelte";
    import WaitingUser from "./game/WaitingUser.svelte";
    import { retrieveOtherUserInfoByName } from "./chat/interactionUtils.svelte";
    import PrivateGame from "./game/PrivateGame.svelte";

	function	resetHome(): void {
		$userInfo = undefined;
		history.replaceState({"href_to_show": "/"}, "", "/");
		$page_shown = "/";
	}

	async function	checkSetting(hash: string): Promise<settings> {
		switch (hash) {
			case "": return settings.other + 1;
			case "#2fa": return settings.twoFactorManagement;
			case "#avatar": return settings.changeAvatar;
			case "#username": return settings.changeUsername;
			case "#password": return settings.changePassword;
			default: return settings.other + 1;
		}
	}

	async function	getUserSearched(): Promise<Object> {
		const	ret: Object = await retrieveOtherUserInfoByName(window.location.search.split('=')[1], $webAppIP);
		return ret;
	}

</script>

{#await checkSetting(window.location.hash)}
	<p>Loading...</p>
{:then setting}
	{#if $page_shown === "/waitingRoom"}
		<WaitingRoom on:message />
	{:else if $page_shown === '/game'}
		<Game on:message />
	{:else if $page_shown === '/privateGame'}
		<PrivateGame on:message />
	{:else}
		<Notifications />
		<NavBar on:message on:logout />
		{#if $page_shown === "/friends"}
			<Friends on:message on:logout={resetHome} />
		{:else if $page_shown === "/invitationWindow"}
			<InvitationWindow on:message />
		{:else if $page_shown === '/waitingUser'}
			<WaitingUser />
		{:else if $page_shown === "/achievements"}
			<Achievements />
		{:else if $page_shown.startsWith("/achievements?user=")}
			{#await getUserSearched()}
				<p>loading</p>
			{:then user}
				<Achievements {user} />
			{/await}
		{:else if $page_shown === "/leaderboard"}
			<LeaderBoard on:message />
		{:else if $page_shown.startsWith("/profile?") && userInfo['username'] !== window.location.search.substring(6)}
			<VisitProfile on:message />
		{:else}
			{#if setting > settings.other}
				<ProfilePage on:message on:logout />
			{:else}
				<Settings settingsState={setting} on:message />
			{/if}
		{/if}
	{/if}
{/await}
