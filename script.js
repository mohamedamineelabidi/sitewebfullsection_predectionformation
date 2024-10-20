// Handle form submission
const predictionForm = document.getElementById('predictionForm');
const resultDiv = document.getElementById('result');

predictionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    const submitButton = predictionForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
    `;

    // Get form data
    const formData = {
        xG: parseFloat(document.getElementById('xG').value) || 0,
        xGA: parseFloat(document.getElementById('xGA').value) || 0,
        Poss: parseFloat(document.getElementById('possession').value) || 0,
        xA: parseFloat(document.getElementById('xA').value) || 0,
        KP: parseInt(document.getElementById('keyPasses').value) || 0,
        PPA: parseInt(document.getElementById('progressivePasses').value) || 0,
        PrgP: parseInt(document.getElementById('progressivePasses').value) || 0  // Added PrgP to match backend
    };

    try {
        // Validate form data
        for (const [key, value] of Object.entries(formData)) {
            if (isNaN(value)) {
                throw new Error(`Invalid value for ${key}`);
            }
        }

        // Fetch prediction from API
        const response = await fetch('http://127.0.0.1:5000/predict_formation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch prediction from API');
        }

        const result = await response.json();
        
        // Display result with animation
        resultDiv.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 mt-8 transform transition-all duration-500 opacity-0">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Predicted Formation</h3>
                <p class="text-gray-600">${result.prediction}</p>
            </div>
        `;

        // Animate result appearance
        setTimeout(() => {
            resultDiv.querySelector('div').classList.remove('opacity-0');
        }, 100);

    } catch (error) {
        // Display error message
        resultDiv.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">${error.message}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Reset button state
    submitButton.innerHTML = originalButtonText;
});