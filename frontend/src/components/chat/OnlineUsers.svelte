<script lang="ts">
    import UserIcon from "../utils/UserIcon.svelte";
    import { onlineUsers, inGameUsers, blockedUsers } from "../../data";

    export let  users: Array<string> | undefined = [];
    export let  areFriends: boolean = false;

    async function  someoneOnline(users: Array<string> | undefined): Promise<boolean> {
        if (users === undefined)
            return false;
        for (let i = 0; i < users.length; i++) {
            if ($inGameUsers.includes(users[i]) || $onlineUsers.includes(users[i]))
                return true;
        }
    }

</script>

<section>
    {#await someoneOnline(users)}
        <p>Loading...</p>
    {:then someoneOnline}
        {#if someoneOnline === true}
            {#each users as user}
                {#if $inGameUsers.includes(user) && $blockedUsers.includes(user) === false}
                    <UserIcon username={user} expandable={true} on:message />
                    <hr>
                {:else if $onlineUsers.includes(user) && $blockedUsers.includes(user) === false}
                    <UserIcon username={user} expandable={true} on:message />
                    <hr>
                {/if}
            {/each}
        {:else if areFriends}
            <p>no friends online</p>
        {:else}
            <p>no users online</p>
        {/if}
    {/await}
</section>

<style>
    section {
        height: var(--height);
        overflow: auto;
    }

    hr {
        background-color: black;
        border: none;
        border-bottom: 1px solid black;
    }
</style>