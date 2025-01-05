async function demo() {
    await signIn("Demo Account", "", false);
    loadGame(674);
}

document.getElementById('demoButton').addEventListener('click', demo);