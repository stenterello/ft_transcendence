<script lang="ts">
	import { userInfo, socket, roomSelected, webAppIP } from "../../data";
	import { createEventDispatcher } from "svelte";
    import { retrieveOtherUserInfo, retrieveOtherUserInfoByName } from "./interactionUtils.svelte";

	export let	roomInfo: Object = undefined;
	const		dispatch = createEventDispatcher();

	function    leaveRoom(): void {
        $socket.emit('leaveRoom', JSON.stringify({'room': $roomSelected}))
        $roomSelected = undefined;
		dispatch('reloadRooms', null);
    }

    function    deleteRoom(): void {
        $socket.emit('deleteRoom', JSON.stringify({'room': $roomSelected}))
        $roomSelected = undefined;
		dispatch('reloadRooms', null);
    }

    function    demoteAdmin(user: string): void {
        $socket.emit('demoteAdmin', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    promoteAdmin(user: string): void {
        $socket.emit('promoteAdmin', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    kickUser(user: string): void {
        $socket.emit('kickUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
		dispatch('reloadRooms', null);
    }

    function    banUser(user: string): void {
        $socket.emit('banUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    unbanUser(user: string): void {
        $socket.emit('unbanUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    muteUser(user: string): void {
        $socket.emit('mute', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    unmuteUser(user: string): void {
        $socket.emit('unmute', JSON.stringify({'user': user, 'room': $roomSelected}));
        dispatch('optionChange', null);
    }

    function    changePassword(): void {
        let newPassword: string = prompt('What\'s the new password?');
        $socket.emit('changePwd', JSON.stringify({'room': $roomSelected, 'password': newPassword}));
        dispatch('optionChange', null);
    }

	async function	inviteFriend(): Promise<void> {
		const	user: string = document.getElementById('invite-friend').value;
		const	friend: Object = await retrieveOtherUserInfoByName(user, $webAppIP);
		if (!friend)
		{
			alert("No user with that name!");
			return ;
		}
		$socket.emit('inviteRoom', JSON.stringify({ user: user, room: $roomSelected }));
	}
</script>

<div id="room-management-container">
	{#if roomInfo['admins'].includes($userInfo['username']) === false}
		<button style="margin: 20% auto;" on:click|preventDefault={leaveRoom}>Leave room</button>
	{:else}
		<div id="first">
			{#if roomInfo['password'] !== null}
				<button on:click|preventDefault={changePassword}>Change password</button>
			{/if}
			<button on:click|preventDefault={deleteRoom}>Delete room</button>
		</div>
		<h4>Members management</h4>
		<div id="second">
			<ul class="member-options">
				{#each roomInfo['members'] as member}
					{#if member !== $userInfo['username']}
						{#if roomInfo['admins'].includes(member)}
							<li>
								<p class="user">{member}</p>
								<div>
									<button on:click|preventDefault={() => demoteAdmin(member) }>Demote admin</button>
								</div>
							</li>
						{:else if roomInfo['banlist'].includes(member) === false}
							<li>
								<p class="user">{member}</p>
								<div>
									<button on:click|preventDefault={() => kickUser(member) }>Kick</button>
									<button on:click|preventDefault={() => banUser(member) }>Ban</button>
									{#if roomInfo['mutelist'].includes(member) === false}
										<button on:click|preventDefault={() => muteUser(member) }>Mute</button>
										<button on:click|preventDefault={() => promoteAdmin(member) }>Promote to admin</button>
									{:else}
										<button on:click|preventDefault={() => unmuteUser(member) }>Unmute</button>
									{/if}
								</div>
							</li>
						{/if}
					{/if}
				{/each}
			</ul>
		</div>
		{#if roomInfo['policy'] !== 'PRIVATE'}
			<h4>Banned users</h4>
			<div id="third">
				<ul class="member-options">
					{#each roomInfo['banlist'] as banned}
						<li>
							<p class="user">{banned}</p>
							<div>
								<button on:click|preventDefault={() => unbanUser(banned) }>Unban</button>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
		<h4>Invite new users</h4>
		<div id="third">
			<form>
				<label for="invite-friend">Insert username</label>
				<input id="invite-friend" type="text" name="username" autocomplete="off" required>
				<br>
				<button id="submit-button" type="submit" on:click|preventDefault={inviteFriend}>submit</button>
			</form>
		</div>
		{/if}
	{/if}
</div>


<style>
	h4 {
		margin: 0;
		background-color: black;
		color: #fcd612;
		height: 10%;
	}
	div {
		position: relative;
		overflow: auto;
	}
	#room-management-container {
		position: relative;
		height: 85%;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	button {
		margin: 1px;
		background-color: black;
		color: #fcd612;
		padding: 3px;
	}
	.member-options > li {
        display: flex;
        justify-content: space-between;
    }
	li > div {
		flex-basis: 80%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	#first {
		height: 15%;
		display: flex;
		align-items: center;
		justify-content: space-around;
	}
	#second, #third {
		height: 31%;
	}
	.user {
		flex-basis: 20%;
		font-size: 1.2em;
		color: black;
	}
</style>