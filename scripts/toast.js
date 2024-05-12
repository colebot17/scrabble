export function toast(title, content, duration = 5000, _type = "info", userDismissable = true) {
    // in the future, possible types might be:
    // info (yellow), success (green), error (red)
    
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

    const dismiss = () => {
        toast.style.transition = "opacity 0.2s";
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.remove();
        }, 200);
    };

    if (userDismissable) {
        toast.addEventListener('click', dismiss);
    }

    if (duration !== 0) {
        setTimeout(() => {
            toast.style.opacity = 0;
            setTimeout(() => {
                toast.remove();
            }, 1000);
        }, duration);
    }

    return {
        el: toast,
        dismiss: dismiss
    }
}