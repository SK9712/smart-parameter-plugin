package io.jenkins.plugins.smartparameter;

import hudson.Extension;
import hudson.model.ParameterDefinition;
import hudson.model.ParameterValue;
import hudson.util.FormValidation;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.DataBoundSetter;
import org.kohsuke.stapler.QueryParameter;
import org.kohsuke.stapler.StaplerRequest;
import net.sf.json.JSONObject;

import javax.annotation.Nonnull;

/**
 * A wrapper that makes another parameter visible or hidden based on a condition.
 */
public class SmartWrapperParameterDefinition extends ParameterDefinition {

    private ParameterDefinition wrappedParameter;
    private String refParameter;
    private String condition;
    private String controlParameter;
    private String controlValue;

    @DataBoundConstructor
    public SmartWrapperParameterDefinition(String name, String description) {
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

    public String getCondition() {
        return condition;
    }

    @DataBoundSetter
    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getControlParameter() {
        return controlParameter;
    }

    @DataBoundSetter
    public void setControlParameter(String controlParameter) {
        this.controlParameter = controlParameter;
    }

    public String getControlValue() {
        return controlValue;
    }

    @DataBoundSetter
    public void setControlValue(String controlValue) {
        this.controlValue = controlValue;
    }

    /**
     * Evaluate if this parameter should be visible based on the condition.
     * @param request The request containing other parameter values
     * @return true if the parameter should be visible
     */
    public boolean isVisible(StaplerRequest request) {
        if (controlParameter == null || controlValue == null) {
            return true; // If no condition is set, always show
        }

        String[] values = request.getParameterValues(controlParameter);
        if (values == null || values.length == 0) {
            return false;
        }

        String value = values[0];

        switch (condition) {
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
    @Symbol("smartWrapperParameter")
    public static class DescriptorImpl extends ParameterDescriptor {
        @Nonnull
        @Override
        public String getDisplayName() {
            return "Smart Wrapper Parameter";
        }

        /**
         * Validates the entered condition.
         */
        public FormValidation doCheckCondition(@QueryParameter String condition) {
            if (condition == null || condition.isEmpty()) {
                return FormValidation.error("Condition must not be empty");
            }

            if (!condition.equals("equals") &&
                    !condition.equals("notEquals") &&
                    !condition.equals("contains") &&
                    !condition.equals("startsWith") &&
                    !condition.equals("endsWith")) {
                return FormValidation.error("Invalid condition type");
            }

            return FormValidation.ok();
        }

        public hudson.util.ListBoxModel doFillConditionItems() {
            hudson.util.ListBoxModel items = new hudson.util.ListBoxModel();
            items.add("equals", "equals");
            items.add("not equals", "notEquals");
            items.add("contains", "contains");
            items.add("starts with", "startsWith");
            items.add("ends with", "endsWith");
            return items;
        }

        /**
         * Validates the control parameter name.
         */
        public FormValidation doCheckControlParameter(@QueryParameter String controlParameter) {
            if (controlParameter == null || controlParameter.isEmpty()) {
                return FormValidation.error("Control parameter must not be empty");
            }
            return FormValidation.ok();
        }

        /**
         * Validates that a wrapped parameter is selected.
         */
        public FormValidation doCheckWrappedParameter(@QueryParameter ParameterDefinition wrappedParameter) {
            if (wrappedParameter == null) {
                return FormValidation.error("You must select a parameter to wrap");
            }
            return FormValidation.ok();
        }
    }
}