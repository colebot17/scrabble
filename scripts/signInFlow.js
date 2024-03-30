// This script file is a module.

import { Flow, FlowStep } from "./flow.js";

const signInFlow = new Flow([
    new FlowStep(() => setSIFP('default')),
    new FlowStep(() => setSIFP('signIn')),
    new FlowStep(() => setSIFP('chooseUsername')),
    // new FlowStep(() => setSIFP('choosePassword')),
    // new FlowStep(() => setSIFP('confirmPassword')),
    // new FlowStep(() => setSIFP('chooseLanguage'))
]);

function listeners() {
    document.getElementById('startFlowTemp').addEventListener('click', () => signInFlow.nextStep({hi: true, nothing: "bubbles"}));
    document.getElementById('nextFlowTemp').addEventListener('click', () => signInFlow.nextStep({this: "is", just: "a", test: "object"}));

    document.getElementById('showDataTemp').addEventListener('click', () => alert(JSON.stringify(signInFlow.collectedData)));
}
listeners();