package io.jenkins.plugins.smartparameter;

import hudson.Extension;
import hudson.model.*;
import hudson.util.FormValidation;
import org.jenkinsci.Symbol;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.DataBoundSetter;
import org.kohsuke.stapler.QueryParameter;
import org.kohsuke.stapler.StaplerRequest;
import net.sf.json.JSONObject;

import javax.annotation.Nonnull;

/**
 * A parameter that is shown or hidden based on a condition.
 */
public class SmartParameterDefinition extends SimpleParameterDefinition {

    private final String defaultValue;
    private String condition;
    private String controlParameter;
    private String controlValue;
    private ParameterDefinition parameterDefinition;

    @DataBoundConstructor
    public SmartParameterDefinition(String name, String description, String defaultValue) {
        super(name, description);
        this.defaultValue = defaultValue;
    }

    public String getDefaultValue() {
        return defaultValue;
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

    public ParameterDefinition getParameterDefinition() {
        return parameterDefinition;
    }

    @DataBoundSetter
    public void setParameterDefinition(ParameterDefinition parameterDefinition) {
        this.parameterDefinition = parameterDefinition;
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
        if(jo.isNullObject()) {
            return new TextParameterValue(getName(), defaultValue, getDescription());
        }

        String value = jo.getString("value");
        if(value == null || value.isEmpty()){
            value = defaultValue;
        }

        return new StringParameterValue(getName(), value, getDescription());
    }

    @Override
    public ParameterValue createValue(String value) {
        return new TextParameterValue(this.getName(), value, this.getDescription());
    }

    @Extension
    @Symbol("smartParameter")
    public static class DescriptorImpl extends ParameterDescriptor {
        @Nonnull
        @Override
        public String getDisplayName() {
            return "Smart Parameter";
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
    }
}