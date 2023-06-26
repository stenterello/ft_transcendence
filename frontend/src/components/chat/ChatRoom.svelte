<script lang="ts">
    import { statusChange } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";

    export let  chat: string | null = null;

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
                    <h4>{roomInfo['name']}</h4>
                    {#if Object.values(messages).length > 0}
                        <ul>

                        </ul>
                    {:else}
                        <p>still no messages</p>
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
    h4 {
        margin: 0;
        padding: 0;
        font-family: 'TrashHand';
        color: #fcd612;
        background-color: black;
        height: 10%;
    }
    ul {
        margin: 0;
        height: 90%;
        padding: 0;
    }
</style>