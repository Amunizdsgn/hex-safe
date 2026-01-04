/**
 * Script para resetar a aplicação localmente
 * Execute este código no Console do navegador (F12 → Console)
 * Ou adicione um botão de "Reset" na aplicação
 */

// Limpar todo o localStorage
localStorage.clear();

// Limpar sessionStorage também
sessionStorage.clear();

// Limpar cookies (se houver)
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Limpar cache do service worker (se houver)
if ('caches' in window) {
    caches.keys().then(function (names) {
        for (let name of names) caches.delete(name);
    });
}

// Recarregar a página
console.log('✅ Aplicação resetada! Recarregando...');
setTimeout(() => {
    window.location.reload(true);
}, 500);
