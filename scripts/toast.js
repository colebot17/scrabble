export function toast(title, content, duration = 3000) {
    let toastStack = document.getElementById('toastStack');
    if (!toastStack) {
        toastStack = document.createElement('div');
        toastStack.id = "toastStack";
        document.body.appendChild(toastStack);
    }

    const toast = document.createElement('div');
    toast.className = "toast";
    toast.innerHTML = /* html */ `<span class="toastTitle"><b>${title}</b></span><span>${content}</span>`;
    toastStack.appendChild(toast);

    toast.addEventListener('click', () => {
        toast.style.transition = "opacity 0.37s";
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.remove();
        }, 370);
    });

    if (duration !== 0) {
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.remove();
            }, 1000);
        }, duration);
    }
}