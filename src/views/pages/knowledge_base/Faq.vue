<script setup>
import { ref } from 'vue';

const items = ref([
    {
        label: 'Save',
        icon: 'pi pi-check'
    },
    {
        label: 'Update',
        icon: 'pi pi-upload'
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash'
    },
    {
        label: 'Home Page',
        icon: 'pi pi-home'
    }
]);
const cardMenu = ref([
    { label: 'Save', icon: 'pi pi-fw pi-check' },
    { label: 'Update', icon: 'pi pi-fw pi-refresh' },
    { label: 'Delete', icon: 'pi pi-fw pi-trash' }
]);
const menuRef = ref(null);

function toggle() {
    menuRef.value.toggle(event);
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-col md:flex-row gap-8">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Frequently Asked Questions</div>
                <Accordion value="0">
                    <AccordionPanel value="0">
                        <AccordionHeader>How can I reset my password on the mobile app?</AccordionHeader>
                        <AccordionContent>
                            <p class="m-0">
                                You can reset your password on the mobile app by following these steps: 1. Open the app and tap on the 'Forgot Password' link. 2. Enter your email address and tap on the 'Reset Password' button. 3. Check your email
                            </p>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="1">
                        <AccordionHeader>Who can I call for assistance on transactions?</AccordionHeader>
                        <AccordionContent>
                            <p class="m-0">
                                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                            </p>
                        </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="2">
                        <AccordionHeader>Does the bank work 24/7?</AccordionHeader>
                        <AccordionContent>
                            <p class="m-0">
                                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt
                                in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo
                                minus.
                            </p>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </div>
        </div>
    </div>
</template>
