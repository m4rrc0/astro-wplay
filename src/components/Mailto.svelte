<script>
import { onMount } from 'svelte'
import { protectEmail } from 'protect-email';
const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL

console.log(CONTACT_EMAIL)
// Depends on random
const email = protectEmail(CONTACT_EMAIL);

let isJS = 'no'

onMount(() => {
    isJS = 'yes'
});

</script>

<div>test: {isJS}</div>