<script lang="ts">
import { getParams } from "../../utils";
import AuthError from "./AuthError.svelte";
import { createEventDispatcher } from 'svelte';
import { setCookie } from 'svelte-cookie';

    let             cookie: string | undefined = undefined;
    const           dispatch = createEventDispatcher();
    const           cookieDays: number = 7;

    function    getBackendCookie(): boolean {
        const    params: Object = getParams(location.href);
        const    nParams: number = Object.keys(params).length;

        if (nParams === 0)
            return false;
        else if (nParams === 1 && params['code'] !== undefined)
        {
            cookie = params['code'];
            setCookie('transcendence_session', cookie, cookieDays, false);
            setTimeout(() => dispatch('message', { path: "/profile" }), 100);
            return true;
        }
        return false;
    }

</script>

{#if getBackendCookie() === false}
    <AuthError on:message />
{/if}
