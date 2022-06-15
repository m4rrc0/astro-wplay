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
    <!-- <span>{@html emailEncoded}</span> -->

    <!-- <style>
        .cryptedmail:after {
            content: attr(data-name) "@" attr(data-domain) "." attr(data-tld); 
        }
    </style> -->

    <!-- <a href="#" class="cryptedmail"
        data-name="info"
        data-domain="example"
        data-tld="org"
        onclick="window.location.href = 'mailto:' + this.dataset.name + '@' + this.dataset.domain + '.' + this.dataset.tld; return false;"
        ></a> -->
        <!-- onLoad="this.innerHTML = this.dataset.name + '@' + this.dataset.domain + '.' + this.dataset.tld;" -->
{:else}
    <span></span>
{/if}