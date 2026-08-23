// src/lib/copy-code.ts

const timeouts = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();

function isCopyButton(target: EventTarget | null): target is HTMLButtonElement {
  return (
    target instanceof HTMLElement &&
    target.closest("[data-copy-button]") !== null
  );
}

document.addEventListener("click", async (e) => {
  const button = (e.target as HTMLElement)?.closest<HTMLButtonElement>(
    "[data-copy-button]",
  );
  if (!button) return;

  const pre = button.closest(".code-block")?.querySelector("pre");
  if (!pre) return;

  try {
    await navigator.clipboard.writeText(pre.textContent ?? "");
    button.dataset.copied = "true";

    const existing = timeouts.get(button);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      delete button.dataset.copied;
      timeouts.delete(button);
    }, 1500);

    timeouts.set(button, timeout);
  } catch {
    // Clipboard API gak tersedia / permission ditolak — silent fail
  }
});
