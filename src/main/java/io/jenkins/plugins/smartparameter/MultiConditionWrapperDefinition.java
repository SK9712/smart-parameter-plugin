package io.jenkins.plugins.smartparameter;

import hudson.Extension;
import hudson.model.ParameterDefinition;
import hudson.model.ParameterValue;

import org.jenkinsci.Symbol;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.DataBoundSetter;
import org.kohsuke.stapler.StaplerRequest;
import net.sf.json.JSONObject;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * Advanced smart parameter with support for multiple conditions.
 */
public class MultiConditionWrapperDefinition extends ParameterDefinition {

    private ParameterDefinition wrappedParameter;
    private String refParameter;
    private List<ParameterCondition> conditions = new ArrayList<>();
    private String logicalOperator = "AND"; // Default is AND

    @DataBoundConstructor
    public MultiConditionWrapperDefinition(String name, String description) {
        super(name, description);
    }

    public ParameterDefinition getWrappedParameter() {
        return wrappedParameter;
    }

    @DataBoundSetter
    public void setWrappedParameter(ParameterDefinition wrappedParameter) {
        this.wrappedParameter = wrappedParameter;
    }

    public String getRefParameter() {
        return refParameter;
    }

    @DataBoundSetter
    public void setRefParameter(String refParameter) {
        this.refParameter = refParameter;
    }

    public List<ParameterCondition> getConditions() {
        return conditions;
    }

    @DataBoundSetter
    public void setConditions(List<ParameterCondition> conditions) {
        this.conditions = conditions;
    }

    public String getLogicalOperator() {
        return logicalOperator;
    }

    @DataBoundSetter
    public void setLogicalOperator(String logicalOperator) {
        this.logicalOperator = logicalOperator;
    }

    /**
     * Evaluate if this parameter should be visible based on all conditions.
     * @param request The request containing other parameter values
     * @return true if the parameter should be visible
     */
    public boolean isVisible(StaplerRequest request) {
        if (conditions.isEmpty()) {
            return true; // If no conditions are set, always show
        }

        boolean result = "AND".equals(logicalOperator); // Start with true for AND, false for OR

        for (ParameterCondition condition : conditions) {
            boolean conditionResult = evaluateCondition(condition, request);

            if ("AND".equals(logicalOperator)) {
                result = result && conditionResult;
                // Short-circuit for AND - if any condition is false, result is false
                if (!result) {
                    return false;
                }
            } else {
                result = result || conditionResult;
                // Short-circuit for OR - if any condition is true, result is true
                if (result) {
                    return true;
                }
            }
        }

        return result;
    }

    private boolean evaluateCondition(ParameterCondition condition, StaplerRequest request) {
        String controlParameter = condition.getControlParameter();
        String conditionType = condition.getCondition();
        String controlValue = condition.getControlValue();

        if (controlParameter == null || conditionType == null || controlValue == null) {
            return true; // If condition is not fully defined, do not restrict visibility
        }

        String[] values = request.getParameterValues(controlParameter);
        if (values == null || values.length == 0) {
            return false; // No value found for control parameter
        }

        String value = values[0];

        switch (conditionType) {
            case "equals":
                return controlValue.equals(value);
            case "notEquals":
                return !controlValue.equals(value);
            case "contains":
                return value.contains(controlValue);
            case "startsWith":
                return value.startsWith(controlValue);
            case "endsWith":
                return value.endsWith(controlValue);
            case "regex":
                return value.matches(controlValue);
            default:
                return true;
        }
    }

    @Override
    public ParameterValue createValue(StaplerRequest req, JSONObject jo) {
        if (wrappedParameter != null) {
            return wrappedParameter.createValue(req, jo);
        }
        return null;
    }

    @Override
    public ParameterValue createValue(StaplerRequest req) {
        if (wrappedParameter != null) {
            return wrappedParameter.createValue(req);
        }
        return null;
    }

    @Extension
    @Symbol("multiConditionParameter")
    public static class DescriptorImpl extends ParameterDescriptor {
        @Nonnull
        @Override
        public String getDisplayName() {
            return "Smart Wrapper Parameter (Multiple Conditions)";
        }

        public hudson.util.ListBoxModel doFillLogicalOperatorItems() {
            hudson.util.ListBoxModel items = new hudson.util.ListBoxModel();
            items.add("AND", "AND");
            items.add("OR", "OR");
            return items;
        }
    }
}