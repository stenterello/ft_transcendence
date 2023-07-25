<script lang="ts">
import { getParams } from "../../utils";
import { authenticationState } from "./authenticationUtils.svelte";
import AuthError from "./AuthError.svelte";
import { createEventDispatcher } from 'svelte';
import { setCookie } from 'svelte-cookie';

    let            cookie: string | undefined = undefined;
    const       dispatch = createEventDispatcher();
    const       cookieDays: number = 7;

function    getBackendCookie(): boolean {
        const    params: Object = getParams(location.href);
        const    nParams: number = Object.keys(params).length;

        if (nParams === 0)
            return false;
        else if (nParams === 1 && params['code'] !== undefined)
        {
            cookie = params['code'];
            setCookie('transcendence_session', cookie, cookieDays, false);
            dispatch('message', {path: "/profile"});
            return true;
        }
        return false;
    }
</script>
{#await getBackendCookie()}
    <p>Loading</p>
{:then result}
    {#if result === false}
        <AuthError on:message />
    {/if}
{/await}
