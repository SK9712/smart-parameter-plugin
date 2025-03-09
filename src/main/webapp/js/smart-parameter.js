/**
 * Enhanced JavaScript to handle smart parameter visibility
 */
(function() {
    console.log("Smart Parameter JS loaded");

    // State to track parameter values
    const parameterState = {};

    // Execute when the DOM is fully loaded
    function initialize() {
        console.log("Initializing smart parameters");

        // Store initial parameter values
        cacheParameterValues();

        // Initialize all smart parameters based on current values
        initSmartParameters();

        // Add event listeners to all potential control parameters
        document.querySelectorAll('input, select, textarea').forEach(function(element) {
            element.addEventListener('change', function() {
                console.log("Parameter changed: " + element.name);

                // Update parameter state
                updateParameterState(element);

                // Update visibility of dependent parameters
                updateSmartParameters();
            });
        });
    }

    /**
     * Cache the initial values of all parameters
     */
    function cacheParameterValues() {
        document.querySelectorAll('input, select, textarea').forEach(function(element) {
            const paramName = getParameterName(element);
            if (paramName) {
                parameterState[paramName] = element.value;
            }
        });
        console.log("Cached parameter values:", parameterState);
    }

    /**
     * Update the parameter state when a value changes
     */
    function updateParameterState(element) {
        const paramName = getParameterName(element);
        if (paramName) {
            parameterState[paramName] = element.value;
            console.log("Updated parameter state:", paramName, "=", element.value);
        }
    }

    /**
     * Get the parameter name from an input element
     */
    function getParameterName(element) {
        // If the element has a data-parameter-name attribute, use that
        if (element.hasAttribute('data-parameter-name')) {
            return element.getAttribute('data-parameter-name');
        }

        // Otherwise, use the name attribute
        if (element.name === 'value') {
            // Find parameter name from closest parameter container
            const container = element.closest('[name="parameter"]');
            if (container) {
                const nameInput = container.querySelector('input[name="name"]');
                if (nameInput) {
                    return nameInput.value;
                }
            }
            return null;
        }

        return element.name;
    }

    /**
     * Initialize all smart parameters based on current values
     */
    function initSmartParameters() {
        var smartParams = document.querySelectorAll('.smart-parameter');
        console.log("Found " + smartParams.length + " smart parameters");

        // First process wrappers to ensure proper initial visibility
        smartParams.forEach(function(param) {
            const controlType = param.getAttribute('data-control-type');
            if (controlType === "wrapper") {
                updateParameterVisibility(param);
            }
        });

        // Then process all other parameters
        smartParams.forEach(function(param) {
            const controlType = param.getAttribute('data-control-type');
            if (controlType !== "wrapper") {
                updateParameterVisibility(param);
            }
        });
    }

    /**
     * Update all smart parameters when any input changes
     */
    function updateSmartParameters() {
        // First process wrapper parameters
        document.querySelectorAll('.smart-parameter').forEach(function(param) {
            const controlType = param.getAttribute('data-control-type');
            if (controlType === "wrapper") {
                updateParameterVisibility(param);
            }
        });

        // Then process regular parameters
        document.querySelectorAll('.smart-parameter').forEach(function(param) {
            const controlType = param.getAttribute('data-control-type');
            if (controlType !== "wrapper") {
                updateParameterVisibility(param);
            }
        });
    }

    /**
     * Update the visibility of a single parameter based on its condition
     * @param {Element} param - The parameter element to update
     */
    function updateParameterVisibility(param) {
        // Check if this is a smart wrapper parameter with multiple conditions
        if (param.classList.contains('smart-wrapper-parameter') &&
            param.classList.contains('multi-condition-parameter')) {
            updateMultiConditionWrapperParameter(param);
            return;
        }

        // Handle regular multi-condition parameters
        const paramName = param.getAttribute('data-parameter-name');
        if (paramName && window.smartParams && window.smartParams[paramName]) {
            updateMultiConditionParameter(param, paramName);
            return;
        }

        // Handle existing implementation
        var controlType = param.getAttribute('data-control-type');
        var controlParam = param.getAttribute('data-control-param');
        var condition = param.getAttribute('data-condition');
        var controlValue = param.getAttribute('data-control-value');

        console.log("Updating visibility for param: control=" + controlParam + ", condition=" + condition + ", value=" + controlValue);

        if (!controlParam || !condition || !controlValue) {
            console.log("Missing condition data, always showing");
            return; // No condition set, always show
        }

        if(controlType === "wrapper") {
            toggleReferenceElement(param.getAttribute('data-control-ref-parameter'),
                                   controlParam, condition, controlValue);
            return;
        }

        // Find the control parameter element
        const controlElement = findControlElement(controlParam);
        if (!controlElement) {
            console.log("Control element not found: " + controlParam);
            return; // Control not found, show by default
        }

        const currentValue = controlElement.value;
        console.log("Control element value: " + currentValue);

        let isVisible = evaluateCondition(currentValue, condition, controlValue);

        // Update visibility - find the closest parent TR if parameter is inside a table
        const paramRow = param.closest('.jenkins-form-item') || param;
        paramRow.style.display = isVisible ? '' : 'none';
        console.log("Set visibility: " + isVisible + " for element");
    }

    /**
     * Update a parameter with multiple conditions
     */
    function updateMultiConditionParameter(param, paramName) {
        const paramConfig = window.smartParams[paramName];
        const conditions = paramConfig.conditions || [];
        const operator = paramConfig.logicalOperator || 'AND';

        if (conditions.length === 0) {
            return; // No conditions to check
        }

        let isVisible = operator === 'AND'; // Start with true for AND, false for OR

        for (const condition of conditions) {
            const controlParam = condition.controlParam;
            const conditionType = condition.condition;
            const controlValue = condition.controlValue;

            if (!controlParam || !conditionType || !controlValue) {
                continue; // Skip incomplete conditions
            }

            // Get the current value of the control parameter
            const currentValue = getParameterValue(controlParam);
            if (currentValue === null) {
                continue; // Control parameter not found
            }

            const conditionResult = evaluateCondition(currentValue, conditionType, controlValue);

            if (operator === 'AND') {
                isVisible = isVisible && conditionResult;
                // Short-circuit for AND
                if (!isVisible) break;
            } else {
                isVisible = isVisible || conditionResult;
                // Short-circuit for OR
                if (isVisible) break;
            }
        }

        // Update visibility - find the closest parent form item
        const paramRow = param.closest('.jenkins-form-item') || param;
        paramRow.style.display = isVisible ? '' : 'none';
    }

    /**
     * Update a multi-condition wrapper parameter
     */
    function updateMultiConditionWrapperParameter(param) {
        const refParameter = param.getAttribute('data-control-ref-parameter');
        const operator = param.getAttribute('data-logical-operator') || 'AND';

        // Collect all condition data
        const conditionElements = param.querySelectorAll('.condition-data');
        if (!conditionElements || conditionElements.length === 0) {
            return; // No conditions found
        }

        const conditions = [];
        conditionElements.forEach(function(condElem) {
            conditions.push({
                controlParam: condElem.getAttribute('data-control-param'),
                condition: condElem.getAttribute('data-condition'),
                controlValue: condElem.getAttribute('data-control-value')
            });
        });

        if (conditions.length === 0) {
            return; // No valid conditions
        }

        // Evaluate all conditions
        let isVisible = operator === 'AND'; // Start with true for AND, false for OR

        for (const condition of conditions) {
            const controlParam = condition.controlParam;
            const conditionType = condition.condition;
            const controlValue = condition.controlValue;

            if (!controlParam || !conditionType || !controlValue) {
                continue; // Skip incomplete conditions
            }

            // Get the current value of the control parameter
            const currentValue = getParameterValue(controlParam);
            if (currentValue === null) {
                continue; // Control parameter not found
            }

            const conditionResult = evaluateCondition(currentValue, conditionType, controlValue);

            if (operator === 'AND') {
                isVisible = isVisible && conditionResult;
                // Short-circuit for AND
                if (!isVisible) break;
            } else {
                isVisible = isVisible || conditionResult;
                // Short-circuit for OR
                if (isVisible) break;
            }
        }

        // Update visibility of the wrapped parameter
        updateWrappedParameterVisibility(param, isVisible);

        // Update visibility of all referenced parameters
        if (refParameter) {
            toggleMultiReferenceParameter(refParameter, isVisible);
        }
    }

    /**
     * Update the visibility of a wrapped parameter
     */
    function updateWrappedParameterVisibility(wrapperElement, isVisible) {
        // The wrapper itself should not be hidden, only its content and referenced parameters
        const wrappedContent = wrapperElement.querySelector('.jenkins-form-item');
        if (wrappedContent) {
            wrappedContent.style.display = isVisible ? '' : 'none';
        }
    }

    /**
     * Toggle visibility of referenced parameters based on evaluated conditions
     */
    function toggleMultiReferenceParameter(refs, isVisible) {
        if (!refs) return;

        const paramList = refs.split(',').map(p => p.trim());
        for (let i = 0; i < paramList.length; i++) {
            const paramName = paramList[i];
            if (!paramName) continue;

            // Find parameter elements by name
            const elements = document.querySelectorAll(`div[name="parameter"] > input[name="name"][value="${paramName}"]`);
            elements.forEach(function(element) {
                if (element) {
                    // Update visibility - find the closest parent TR if parameter is inside a table
                    const paramRow = element.closest('.jenkins-form-item') || element;
                    paramRow.style.display = isVisible ? '' : 'none';
                    console.log(`Set visibility: ${isVisible} for referenced parameter: ${paramName}`);
                }
            });
        }
    }

    /**
     * Get the current value of a parameter
     * @param {string} paramName - The name of the parameter
     * @return {string|null} - The parameter value or null if not found
     */
    function getParameterValue(paramName) {
        // First check our cached parameter state
        if (parameterState && parameterState[paramName] !== undefined) {
            return parameterState[paramName];
        }

        // Find the parameter input element
        const element = findControlElement(paramName);
        return element ? element.value : null;
    }

    /**
     * Find the control element by its parameter name
     * @param {string} paramName - The name of the parameter to find
     * @return {Element|null} - The input element or null if not found
     */
    function findControlElement(paramName) {
        // Try to find by name attribute
        let element = document.querySelector(`[name="${paramName}"]`);

        // If not found, try by data-parameter-name attribute
        if (!element) {
            element = document.querySelector(`[data-parameter-name="${paramName}"]`);
        }

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
            }
        }

        return element;
    }

    /**
     * Toggle visibility of reference elements
     */
    function toggleReferenceElement(params, controlParam, condition, controlValue) {
        if (!params) return;

        const paramList = params.split(',').map(p => p.trim());
        for (let i = 0; i < paramList.length; i++) {
            const paramName = paramList[i];
            if (!paramName) continue;

            // Find all matching elements (there could be multiple with the same name)
            const elements = document.querySelectorAll(`div[name="parameter"] > input[name="name"][value="${paramName}"]`);
            elements.forEach(function(element) {
                if (element) {
                    // Find the control parameter element
                    const controlElement = findControlElement(controlParam);
                    if (!controlElement) {
                        console.log("Control element not found: " + controlParam);
                        return; // Control not found, show by default
                    }

                    const currentValue = controlElement.value;
                    console.log("Control element value: " + currentValue);

                    let isVisible = evaluateCondition(currentValue, condition, controlValue);

                    // Update visibility - find the closest parent TR if parameter is inside a table
                    const paramRow = element.closest('.jenkins-form-item') || element;
                    paramRow.style.display = isVisible ? '' : 'none';
                    console.log("Set visibility: " + isVisible + " for element: " + paramName);
                }
            });
        }
    }

    /**
     * Evaluate a condition between a value and a control value
     * @param {string} value - The current value
     * @param {string} conditionType - The type of condition
     * @param {string} controlValue - The value to compare against
     * @return {boolean} - True if the condition is met
     */
    function evaluateCondition(value, conditionType, controlValue) {
        switch (conditionType) {
            case 'equals':
                return value === controlValue;
            case 'notEquals':
                return value !== controlValue;
            case 'contains':
                return value.includes(controlValue);
            case 'startsWith':
                return value.startsWith(controlValue);
            case 'endsWith':
                return value.endsWith(controlValue);
            case 'regex':
                try {
                    const regex = new RegExp(controlValue);
                    return regex.test(value);
                } catch (e) {
                    console.error("Invalid regex pattern:", controlValue, e);
                    return false;
                }
            default:
                return true;
        }
    }

    // Add to window onload to ensure all elements are loaded first
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initialize, 100);
    } else {
        window.addEventListener("DOMContentLoaded", initialize);
    }
    window.addEventListener("load", initialize);

    // Make some functions available globally for diagnostics and advanced usage
    window.SmartParams = {
        updateParameters: updateSmartParameters,
        getParameterValue: getParameterValue,
        evaluateCondition: evaluateCondition
    };
})();