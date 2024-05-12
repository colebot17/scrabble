export function toast(title, content, duration = 5000, dismissable = true) {
    let toastStack = document.getElementById('toastStack');
    if (!toastStack) {
        toastStack = document.createElement('div');
        toastStack.id = "toastStack";
        document.body.appendChild(toastStack);
    }

    const toast = document.createElement('div');
    toast.className = "toast";
    toast.innerHTML = /* html */ `<span class="toastTitle"><b>${title}</b></span>${content ? `<span>${content}</span>` : ``}`;
    toastStack.appendChild(toast);

    if (dismissable) {
        toast.addEventListener('click', () => {
            toast.style.transition = "opacity 0.2s";
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.remove();
            }, 200);
        });
    }

    if (duration !== 0) {
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.remove();
            }, 1000);
        }, duration);
    }
}