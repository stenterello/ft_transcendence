<script lang="ts">
    import { statusChange, socket, roomSelected, userInfo } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";
    import RoomManagement from "./RoomManagement.svelte";

    export let  chat: string | null = null;
    let         roomManagement: boolean = false;
    let         optionChange: boolean = false;

    async function  getMessages(): Promise<Object> {
        const   res: Response = await fetch('http://localhost:3000/chat/' + chat);
        const   json: Object = await res.json();

        return json;
    }

    async function  getRoomObject(): Promise<Object> {
        const   res: Response = await fetch('http://localhost:3000/chat/rooms');
        const   json: Object = await res.json();
        for (let i = 0; i < Object.values(json).length; i++) {
            if (json[i]['name'] === chat)
                return json[i];
        }
    }

    function    leaveRoom(): void {
        $socket.emit('leaveRoom', JSON.stringify({'room': $roomSelected}))
        $roomSelected = undefined;
    }

    function    demoteAdmin(user: string): void {
        $socket.emit('demoteAdmin', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    promoteAdmin(user: string): void {
        $socket.emit('promoteAdmin', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    kickUser(user: string): void {
        $socket.emit('kickUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    banUser(user: string): void {
        $socket.emit('banUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    unbanUser(user: string): void {
        $socket.emit('banUser', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    muteUser(user: string): void {
        $socket.emit('mute', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    unmuteUser(user: string): void {
        $socket.emit('unmute', JSON.stringify({'user': user, 'room': $roomSelected}));
        optionChange = (optionChange) ? false : true;
    }

    function    changePassword(): void {
        let newPassword: string = prompt('What\'s the new password?');
        $socket.emit('changePwd', JSON.stringify({'room': $roomSelected, 'password': newPassword}));
        optionChange = (optionChange) ? false : true;
    }

</script>

{#await getRoomObject()}
    <p>loading</p>
{:then roomInfo} 
    <section id="chat-space">
        {#if chat !== null}
            {#key $statusChange}
                <OnlineUsers users={roomInfo['members']} --height="25%" />
            {/key}
            {#await getMessages()}
                <p>loading</p>
            {:then messages}
                <div id="messages">
                    <RoomManagement {roomInfo} on:options={ () => {roomManagement = (roomManagement) ? false : true;} } />
                    {#if roomManagement === false}
                        {#if Object.values(messages).length > 0}
                            <ul>

                            </ul>
                        {:else}
                            <p>still no messages</p>
                        {/if}
                    {:else}
                        {#key optionChange}
                            {#if roomInfo['admins'].includes($userInfo['username']) === false}
                                <button on:click|preventDefault={leaveRoom}>Leave room</button>
                            {:else}
                                {#if roomInfo['password'] !== null}
                                    <button on:click|preventDefault={changePassword}>Change password</button>
                                {/if}
                                <button on:click|preventDefault={leaveRoom}>Delete room</button>
                                <h4>Members management</h4>
                                <ul class="member-options">
                                    {#each roomInfo['members'] as member}
                                        {#if member !== $userInfo['username']}
                                            {#if roomInfo['admins'].includes(member)}
                                                <li>
                                                    <p>{member}</p>
                                                    <div>
                                                        <button on:click|preventDefault={() => demoteAdmin(member) }>Demote admin</button>
                                                    </div>
                                                </li>
                                            {:else}
                                                <li>
                                                    <p>{member}</p>
                                                    <div>
                                                        <button on:click|preventDefault={() => kickUser(member) }>Kick user</button>
                                                        <button on:click|preventDefault={() => banUser(member) }>Ban user</button>
                                                        {#if roomInfo['mutelist'].includes(member) === false}
                                                            <button on:click|preventDefault={() => muteUser(member) }>Mute user</button>
                                                            <button on:click|preventDefault={() => promoteAdmin(member) }>Promote to admin</button>
                                                        {:else}
                                                            <button on:click|preventDefault={() => unmuteUser(member) }>Unmute user</button>
                                                        {/if}
                                                    </div>
                                                </li>
                                            {/if}
                                        {/if}
                                    {/each}
                                </ul>
                                <h4>Banned users</h4>
                                <ul class="member-options">
                                    {#each roomInfo['banlist'] as banned}
                                    <li>
                                        <p>{banned}</p>
                                        <div>
                                            <button on:click|preventDefault={() => unbanUser(banned) }>Unban user</button>
                                        </div>
                                    </li>
                                    {/each}
                                </ul>
                            {/if}
                        {/key}
                    {/if}
                </div>
            {/await}
        {/if}
    </section>
{/await}


<style>
    #chat-space {
		background-color: white;
		position: absolute;
		bottom: 13%;
		height: 43%;
        width: 100%;
        z-index: 1;
	}
    #messages {
        background-color: white;
        border: 1px solid black;
        height: 75%;
    }
    ul {
        margin: 0;
        height: 90%;
        padding: 0;
    }
    .member-options > li {
        display: flex;
        justify-content: space-between;
    }
</style>