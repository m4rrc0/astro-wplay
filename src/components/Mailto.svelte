<script>
import { onMount } from 'svelte'
import { protectEmail } from 'protect-email';
import { restructureEmail } from '@utils'

export let em;
export let target = '_blank';
export let rel = 'noopener noreferrer';
export let referrerpolicy = 'no-referrer';

const _email = restructureEmail(em)
let isClient = typeof window !== 'undefined'
const emailEncoded = _email && protectEmail(_email);

onMount(() => {
    isClient = typeof window !== 'undefined'
});

// console.log($$slots)
</script>

{#if isClient && emailEncoded}
    <a href={`mailto:${_email}`} {target} {rel} {referrerpolicy}>{@html emailEncoded}</a>
{:else if emailEncoded}
    <span>{@html emailEncoded}</span>
{:else}
    <span></span>
{/if}