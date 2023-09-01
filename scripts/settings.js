class Setting {
    constructor(id, linkedEl, linkedElProperty, initSubscribers = []) {
        this.id = id;
        if (localStorage[id]) linkedEl[linkedElProperty] = localStorage[id];

        this.value = localStorage[id] || linkedEl[linkedElProperty];
        this.linkedEl = linkedEl;
        this.linkedElProperty = linkedElProperty;
        this.subscribers = initSubscribers;

        // set up the linked element
        this.linkedEl.addEventListener('input', () => {this.#setValue(this.linkedEl[this.linkedElProperty])});
    }

    #setValue(value) {
        this.value = value;
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](value);
        }
        localStorage[this.id] = value;
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback) {
        const index = this.subscribers.indexOf(callback);
        if (typeof index !== 'number') return null;
        return this.subscribers.splice(index, 1);
    }
}

var settings = {
    "hideChatBox": new Setting('hideChatBox', document.getElementById('hideChatBoxToggle'), 'checked')
};