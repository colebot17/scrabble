function initDefaultLanguageSelectors() {
    const selectors = document.getElementsByClassName('defaultLanguageOption');
    
    for (let el of selectors) {
        el.addEventListener('change', async () => {
            const selectedLang = document.querySelector('.defaultLanguageOption:checked').value;
            const res = await request('setDefaultLang.php', {
                user: account.id,
                pwd: account.pwd,
                newDefaultLang: selectedLang
            });
            if (res.errorLevel) {
                textModal('Error', res.message);

                // put the selector back
                document.querySelector('.defaultLanguageOption[value=' + account.defaultLang + ']').checked = true;
            } else {
                account.defaultLang = selectedLang;
                updateGamesList();
                toast("Language", "Your default language has been updated to " + selectedLang.toTitleCase() + ".");
            }
        });
    }
}