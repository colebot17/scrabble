export function toast(title, content, duration = 3000, urgent = false) {
    let toastStack = document.getElementById('toastStack');
    if (!toastStack) {
        toastStack = document.createElement('div');
        toastStack.id = "toastStack";
        document.body.appendChild(toastStack);
    }

    const toast = document.createElement('div');
    toast.className = "toast";
    if (urgent) toast.classList.add('urgent');
    toast.innerHTML = /* html */ `<span class="toastTitle"><b>${title}</b></span><span>${content}</span>`;
    toastStack.appendChild(toast);

    toast.addEventListener('click', () => toast.remove());

    if (duration !== 0) {
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.remove();
            }, 1000);
        }, duration);
    }
}