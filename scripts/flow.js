export class Flow {
    constructor(steps) {
        if (steps.length < 1) return false;

        this.steps = steps;
        this.currentStep = 0;
        this.collectedData = {};

        steps[0].action();
    }

    nextStep(data = {}) {
        this.collectedData = {...this.collectedData, ...data};

        this.currentStep++;
        this.steps[this.currentStep].action();
    }

    reset() {
        this.currentStep = 0;
        this.collectedData = {};
        steps[0].action();
    }
}

export class FlowStep {
    constructor(action) {
        this.action = action;
    }
}