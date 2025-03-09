package io.jenkins.plugins.smartparameter;

import hudson.Extension;
import hudson.model.AbstractDescribableImpl;
import hudson.model.Descriptor;
import hudson.util.FormValidation;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.QueryParameter;

/**
 * Represents a single condition for parameter visibility.
 */
public class ParameterCondition extends AbstractDescribableImpl<ParameterCondition> {

    private final String controlParameter;
    private final String condition;
    private final String controlValue;

    @DataBoundConstructor
    public ParameterCondition(String controlParameter, String condition, String controlValue) {
        this.controlParameter = controlParameter;
        this.condition = condition;
        this.controlValue = controlValue;
    }

    public String getControlParameter() {
        return controlParameter;
    }

    public String getCondition() {
        return condition;
    }

    public String getControlValue() {
        return controlValue;
    }

    @Extension
    public static class DescriptorImpl extends Descriptor<ParameterCondition> {
        @Override
        public String getDisplayName() {
            return "Parameter Condition";
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
                    !condition.equals("endsWith") &&
                    !condition.equals("regex")) {
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
            items.add("matches regex", "regex");
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
         * Validates the regex pattern (when regex condition is used)
         */
        public FormValidation doCheckControlValue(@QueryParameter String controlValue,
                                                  @QueryParameter String condition) {
            if (controlValue == null || controlValue.isEmpty()) {
                return FormValidation.error("Control value must not be empty");
            }

            if ("regex".equals(condition)) {
                try {
                    java.util.regex.Pattern.compile(controlValue);
                } catch (java.util.regex.PatternSyntaxException e) {
                    return FormValidation.error("Invalid regex pattern: " + e.getMessage());
                }
            }

            return FormValidation.ok();
        }
    }
}