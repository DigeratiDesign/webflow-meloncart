document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[mc-prefill]').forEach(field => {
        field.value = field.getAttribute('mc-prefill');
    });
});