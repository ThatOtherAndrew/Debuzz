document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();  // Prevents default jump
        const target = document.querySelector(this.getAttribute('href'));

        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

async function debuzz() {
    console.log('Debuzzing...');

    const debuzzButton = document.getElementById('btn-debuzz');

    debuzzButton.ariaBusy = 'true';
    debuzzButton.disabled = true;

    const textarea = document.getElementById('buzzwordInput');
    const text = textarea.value;

    try {
        const response = await fetch('/api/debuzz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([text]),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error occurred.');
        }

        const result = await response.json();
        if (!Array.isArray(result) || result.length === 0) {
            throw new Error("Invalid response format from the server.");
        }

        textarea.value = result[0] || 'No output received';


    } catch (error) {
        console.error('Debuzzing error:', error.message);
        alert(`Error: ${error.message}`);
    } finally {
        debuzzButton.ariaBusy = 'false';
        debuzzButton.disabled = false;
    }
}
