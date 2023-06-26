<script lang="ts">
    import { statusChange } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";

    export let  chat: string | null = null;

    async function  getMessages(): Promise<Object> {
        const   res: Response = await fetch('http://localhost:3000/chat/' + chat);
        const   json: Object = await res.json();

    }

    async function  getRoomObject(): Promise<Object> {
        const   res: Response = await fetch('http://localhost:3000/chat/rooms');
        const   json: Object = await res.json();
        for (let i = 0; i < Object.values(json).length; i++) {
            if (json[i]['name'] === chat)
                return json[i];
        }
    }

    getMessages();

</script>

{#await getRoomObject()}
    <p>loading</p>
{:then roomInfo} 
    <section id="chat-space">
        {#if chat !== null}
            {#key $statusChange}
                <OnlineUsers users={roomInfo['members']} --height="40%" />
            {/key}
            <ul>

            </ul>
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
</style>