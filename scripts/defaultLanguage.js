function initDefaultLanguageSelectors() {
    const selectors = document.getElementsByClassName('defaultLanguageOption');
    
    for (let el of selectors) {
        el.addEventListener('change', async () => {
            const selectedLang = document.querySelector('.defaultLanguageSelector:checked').value;
            await request('setDefaultLang.php', {
                user: account.id,
                pwd: account.pwd,
                newDefaultLang: selectedLang
            });
        });
    }
}
initDefaultLanguageSelectors();