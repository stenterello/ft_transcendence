<script lang="ts">
    import { statusChange } from "../../data";
    import OnlineUsers from "./OnlineUsers.svelte";

    export let  chat: string | null = null;
    export let  roomInfo: Object | null = null;

    async function  getMessages() {
        const   res: Response = await fetch('http://localhost:3000/chat/' + chat);
        const   json: Object = await res.json();
    }

    getMessages();

</script>

<section id="chat-space">
    {#if chat !== null}
        {#key $statusChange}
            <OnlineUsers users={roomInfo['members']} --height="40%" />
        {/key}
        <ul>

        </ul>
    {/if}
</section>


<style>
    #chat-space {
		background-color: white;
		position: absolute;
		bottom: 10vh;
		height: 43%;
        width: 100%;
        z-index: 1;
	}
</style>