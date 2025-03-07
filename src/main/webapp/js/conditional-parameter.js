/**
 * JavaScript to handle conditional parameter visibility
 */
(function() {
    console.log("Conditional Parameter JS loaded");

    // Execute when the DOM is fully loaded
    function initialize() {
        console.log("Initializing conditional parameters");
        initConditionalParameters();

        // Add event listeners to all potential control parameters
        document.querySelectorAll('input, select, textarea').forEach(function(element) {
            element.addEventListener('change', function() {
                console.log("Parameter changed: " + element.name);
                updateConditionalParameters();
            });
        });
    }

    /**
     * Initialize all conditional parameters based on current values
     */
    function initConditionalParameters() {
        var conditionalParams = document.querySelectorAll('.conditional-parameter');
        console.log("Found " + conditionalParams.length + " conditional parameters");

        conditionalParams.forEach(function(param) {
            updateParameterVisibility(param);
        });
    }

    /**
     * Update all conditional parameters when any input changes
     */
    function updateConditionalParameters() {
        document.querySelectorAll('.conditional-parameter').forEach(function(param) {
            updateParameterVisibility(param);
        });
    }

    /**
     * Update the visibility of a single parameter based on its condition
     * @param {Element} param - The parameter element to update
     */
    function updateParameterVisibility(param) {
        const controlParam = param.getAttribute('data-control-param');
        const condition = param.getAttribute('data-condition');
        const controlValue = param.getAttribute('data-control-value');

        console.log("Updating visibility for param: control=" + controlParam + ", condition=" + condition + ", value=" + controlValue);

        if (!controlParam || !condition || !controlValue) {
            console.log("Missing condition data, always showing");
            return; // No condition set, always show
        }

        // Find the control parameter element
        const controlElement = findControlElement(controlParam);
        if (!controlElement) {
            console.log("Control element not found: " + controlParam);
            return; // Control not found, show by default
        }

        const currentValue = controlElement.value;
        console.log("Control element value: " + currentValue);

        let isVisible = false;

        // Check the condition
        switch (condition) {
            case 'equals':
                isVisible = (currentValue === controlValue);
                break;
            case 'notEquals':
                isVisible = (currentValue !== controlValue);
                break;
            case 'contains':
                isVisible = currentValue.includes(controlValue);
                break;
            case 'startsWith':
                isVisible = currentValue.startsWith(controlValue);
                break;
            case 'endsWith':
                isVisible = currentValue.endsWith(controlValue);
                break;
            default:
                isVisible = true;
        }

        // Update visibility - find the closest parent TR if parameter is inside a table
        const paramRow = param.closest('.jenkins-form-item') || param;
        paramRow.style.display = isVisible ? '' : 'none';
        console.log("Set visibility: " + isVisible + " for element");
    }

    /**
     * Find the control element by its parameter name
     * @param {string} paramName - The name of the parameter to find
     * @return {Element|null} - The input element or null if not found
     */
    function findControlElement(paramName) {
        // Try to find by name attribute
        let element = document.querySelector(`[name="${paramName}"]`);

        // If not found, try with common Jenkins parameter patterns
        if (!element) {
            element = document.querySelector(`input[name="value"][data-parameter-name="${paramName}"]`);
        }

        if (!element) {
            element = document.querySelector(`select[name="value"][data-parameter-name="${paramName}"]`);
        }

        if (!element) {
            // Try name="parameter" pattern
            element = document.querySelector(`div[name="parameter"] > input[name="name"][value="${paramName}"]`);
            if (element) {
                // If found, get the associated value input
                return element.nextElementSibling;
//                if (nextRow) {
//                  element = nextRow.querySelector('input') || nextRow.querySelector('select');
//                }
            }
        }

        return element;
    }

    // Add to window onload to ensure all elements are loaded first
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initialize, 100);
    } else {
        window.addEventListener("DOMContentLoaded", initialize);
    }
    window.addEventListener("load", initialize);
})();