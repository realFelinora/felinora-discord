/*
 * FelinoraBubbles, a Vencord userplugin for the Felinora theme
 * Copyright (c) 2026 Felinora
 * SPDX-License-Identifier: MIT
 */

import definePlugin from "@utils/types";
import { UserStore } from "@webpack/common";

// Discord's message rows don't say who wrote them, so the theme can't tell your
// messages apart. This marks your rows with data-fl-own; the theme moves them right.
function markOwn() {
    const me = UserStore.getCurrentUser()?.id;
    if (!me) return;
    document.querySelectorAll<HTMLElement>('li[id^="chat-messages-"]').forEach(li => {
        const key = Object.keys(li).find(k => k.startsWith("__reactFiber$"));
        let fiber = key ? (li as any)[key] : null;
        let own = false;
        for (let i = 0; fiber && i < 15; i++, fiber = fiber.return) {
            const message = fiber.memoizedProps?.message;
            if (message?.author) {
                own = message.author.id === me;
                break;
            }
        }
        if (own !== li.hasAttribute("data-fl-own")) li.toggleAttribute("data-fl-own", own);
    });
}

// runs before paint, so a new message never jumps from left to right
let observer: MutationObserver | null = null;

export default definePlugin({
    name: "FelinoraBubbles",
    description: "For the Felinora theme: shows your own messages on the right side.",
    authors: [{ name: "Felinora", id: 0n }],
    start() {
        observer = new MutationObserver(markOwn);
        observer.observe(document.body, { childList: true, subtree: true });
        markOwn();
    },
    stop() {
        observer?.disconnect();
        observer = null;
        document.querySelectorAll("[data-fl-own]").forEach(e => e.removeAttribute("data-fl-own"));
    }
});
