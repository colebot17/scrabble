class Setting {
    constructor(id, linkedEl, linkedElProperty, initSubscribers = []) {
        this.id = id;
        if (localStorage.settings) {
            const lsSettings = JSON.parse(localStorage.settings);
            if (lsSettings[id]) linkedEl[linkedElProperty] = lsSettings[id];
        } else {
            localStorage.settings = '{}';
        }

        this.value = linkedEl[linkedElProperty];
        this.linkedEl = linkedEl;
        this.linkedElProperty = linkedElProperty;
        this.subscribers = initSubscribers;

        // call any initial subscribers
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](this.value);
        }

        // set up the linked element
        this.linkedEl.addEventListener('input', () => {this.#setValue(this.linkedEl[this.linkedElProperty])});
    }

    #setValue(value) {
        this.value = value;
        for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](value);
        }
        let lsSettings = JSON.parse(localStorage.settings);
        lsSettings[this.id] = value;
        localStorage.settings = JSON.stringify(lsSettings);
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
    "hideChatBox": new Setting(
        'hideChatBox',
        document.getElementById('hideChatBoxToggle'),
        'checked',
        [
            v => {
                // update the property on the scrabble grid
                const grid = document.getElementById('scrabbleGrid');
                grid.dataset.hidechatbox = v;
            }
        ]
    )
};