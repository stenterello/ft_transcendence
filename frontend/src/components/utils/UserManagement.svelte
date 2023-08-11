<script lang="ts">

    import { createEventDispatcher } from "svelte/internal";
    import { socket, blockedUsers, userInfo, statusChange, webAppIP, opponent } from "../../data";
    import { blockUser, unblockUser } from "../chat/interactionUtils.svelte";

    export let  user: Object = undefined;

    const   dispatch = createEventDispatcher();
    
    async function	removeFriend(username: string): Promise<void> {
		$socket.emit('delFriend', username);
        $userInfo['friends'].splice($userInfo['friends'].indexOf(username, 1));
	}

    async function	sendRequest(username: string): Promise<void> {
		$socket.emit('friendRequest', username);
	}

</script>

<li>
    <div class="left">
        <img src={user['pictureLink']} alt="{user['username']} picture"/>
        <p id="username">{user['username']}</p>
        {#key $statusChange}
            {#if user['status'] === 'online'}
                <p>[ status: <span class="dot online">·</span> online ]</p>
            {:else if user['status'] === 'in game'}
                <p>[ status: <span class="dot ingame">·</span> in game ]</p>
            {:else}
                <p>[ status: <span class="dot offline">·</span> offline ]</p>
            {/if}
        {/key}
        {#if $userInfo['blocklist'].includes(user['username'])}
            <p style="font-weight: bold; color: #d61a1f">this user is blocked</p>
        {/if}
    </div>
    <div class="right">
        <button on:click={ () => dispatch('message', { path: '/profile?user=' + user['username'] }) }>Show profile</button>

        {#key $statusChange}
            {#if $userInfo['friends'].includes(user['username']) && user['status'] === 'online' && $userInfo['blocklist'].includes(user['username']) === false}
                <button on:click={ () => {$opponent = user['username']; dispatch('message', { path: '/invitationWindow'})} }>Invite to play</button>
            {/if}

            {#if $userInfo['friends'].includes(user['username'])}
                <button on:click={ async () => { await removeFriend(user['username']); dispatch('change', null)}}>Remove friend</button>
            {:else if $userInfo['friendsReq'].includes(user['username'])}
                <button>Friend request pending</button>
            {:else if $userInfo['blocklist'].includes(user['username']) === false}
                <button on:click={ async () => { await sendRequest(user['username']); dispatch('change', null)}}>Add friend</button>
            {/if}
        {/key}

        {#if $userInfo['blocklist'].includes(user['username'])}
            <button on:click={async () => { await unblockUser($userInfo, user['username'], $webAppIP); $blockedUsers.splice($blockedUsers.indexOf(user['username']), 1); dispatch('change', null) } }>Unblock user</button>
        {:else}
            <button on:click={async () => { await blockUser($userInfo, user['username'], $webAppIP); $blockedUsers = $blockedUsers.concat(user['username']); dispatch('change', null) } }>Block user</button>
        {/if}
    </div>
</li>

<style>

    #username {
        font-family: 'TrashHand';
        font-size: 2em;
        margin: 0;
    }

    .dot {
        font-size: 3em;
        position: relative;
        top: 10px;
        margin: 0;
    }

    .online {
        color: green;
    }

    .ingame {
        color: #d61a1f;
    }

    .offline {
        color: black;
    }

    li {
        background-color: #f8b71d;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px dashed #d61a1f;
        padding: 15px;
    }

    li:last-of-type {
        border-bottom: none;
    }

    img {
        width: 5vw;
    }

    .left {
        flex-basis: 30%;
    }

    button {
        margin: 7px auto;
        background-color: black;
        color:#fcd612;
    }

</style>