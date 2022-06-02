<script>
import { onMount } from 'svelte'
import { protectEmail } from 'protect-email';

export let email;
export let target = '_blank';
export let rel = 'noopener noreferrer';
export let referrerpolicy;

let isClient = typeof window !== 'undefined'
const emailEncoded = email && protectEmail(email);

onMount(() => {
    isClient = typeof window !== 'undefined'
});

</script>

{#if isClient && emailEncoded}
    <a href={`mailto:${email}`} {target} {rel} {referrerpolicy}>{@html emailEncoded}</a>
{:else if emailEncoded}
    <span>{@html emailEncoded}</span>
{:else}
    <span></span>
{/if}