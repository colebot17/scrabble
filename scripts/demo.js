async function demo() {
    await signIn("Demo Account", "");
    loadGame(674);
}

document.getElementById('demoButton').addEventListener('click', demo);