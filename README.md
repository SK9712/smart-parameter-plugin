# Smart Parameter Plugin for Jenkins

[![Jenkins Plugin](https://img.shields.io/jenkins/plugin/v/smart-parameter.svg)](https://plugins.jenkins.io/smart-parameter/)
[![Jenkins Plugin Installs](https://img.shields.io/jenkins/plugin/i/smart-parameter.svg?color=blue)](https://plugins.jenkins.io/smart-parameter/)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Introduction

Smart Parameter is a Jenkins plugin that enables conditional parameters in your build forms. It dynamically shows or hides input fields based on the values of other parameters, creating cleaner, more intuitive build forms that adapt to user selections.

This plugin is perfect for complex build pipelines where parameter choices determine which additional options are relevant.

## Features

- **Conditional Visibility**: Show or hide parameters based on the values of other parameters
- **Multiple Condition Types**: Support for equals, not equals, contains, starts with, ends with, and regex pattern matching
- **Multiple Condition Logic**: Combine conditions with AND/OR operators for complex logic
- **Parameter Wrappers**: Control the visibility of existing parameter types
- **Multiple Reference Parameters**: Control multiple parameters with a single wrapper
- **Simple Configuration**: Easy to set up in your job's parameter definitions
- **Real-time Updates**: Parameters update immediately when controlling values change

## Installation

1. Go to **Manage Jenkins** > **Manage Plugins** > **Available** tab
2. Search for "Smart Parameter"
3. Check the box next to "Smart Parameter Plugin" and click "Install without restart"

## Usage

### Parameter Types

The plugin provides four parameter types:

1. **Smart Parameter**: Basic parameter with conditional visibility based on a single condition
2. **Smart Parameter (Multiple Conditions)**: Enhanced parameter with multiple conditions combined by AND/OR logic
3. **Smart Wrapper Parameter**: Wraps existing parameters and controls their visibility based on a single condition
4. **Smart Wrapper Parameter (Multiple Conditions)**: Controls visibility of referenced parameters based on multiple conditions

### 1. Smart Parameter

This is the basic parameter type with a single visibility condition.

1. In your Jenkins job configuration, go to the "This project is parameterized" section
2. Click "Add Parameter" and select "Smart Parameter"
3. Fill in the required fields:
   - **Name**: A unique identifier for the parameter
   - **Default Value**: The default value for the parameter
   - **Description**: A helpful description of the parameter
4. Configure the conditional visibility section:
   - **Control Parameter**: The name of another parameter that controls visibility
   - **Condition**: Select one of: equals, not equals, contains, starts with, ends with, matches regex
   - **Control Value**: The value to compare against

### 2. Smart Parameter (Multiple Conditions)

This parameter type allows for more complex logic with multiple conditions combined by AND/OR operators.

1. Click "Add Parameter" and select "Smart Parameter (Multiple Conditions)"
2. Fill in the basic parameter information (Name, Default Value, Description)
3. Configure the conditional visibility section:
   - **Logical Operator**: Choose between AND (all conditions must be true) or OR (any condition can be true)
   - **Conditions**: Click "Add Condition" to add multiple conditions
   - For each condition, specify:
      - **Control Parameter**: The name of the parameter that controls visibility
      - **Condition**: Type of condition (equals, not equals, contains, etc.)
      - **Control Value**: The value to compare against

### 3. Smart Wrapper Parameter

This parameter type doesn't add a new input field but instead controls the visibility of other parameters.

1. Click "Add Parameter" and select "Parameter Wrapper"
2. Fill in:
   - **Name**: A unique identifier (not shown to users)
   - **Description**: Optional description (not shown to users)
3. Configure:
   - **Control Parameter**: The parameter that controls visibility
   - **Condition**: Type of condition (equals, not equals, contains, etc.)
   - **Control Value**: The value to compare against
   - **Referenced Parameters**: Comma-separated list of parameter names to control

### 4. Smart Wrapper Parameter (Multiple Conditions)

This is the most powerful parameter type, allowing you to control visibility of other parameters using multiple conditions.

1. Click "Add Parameter" and select "Smart Wrapper Parameter (Multiple Conditions)"
2. Fill in the basic information (Name, Description)
3. Configure:
   - **Logical Operator**: Choose between AND or OR logic
   - **Conditions**: Add multiple conditions as needed
   - **Referenced Parameters**: Comma-separated list of parameter names to control

### Example Configurations

#### Basic Example

Let's say you have a job with a "DEPLOYMENT_ENV" choice parameter with values "dev", "staging", and "prod". You might want to add additional parameters that are only relevant for specific environments:

1. Add a "Smart Parameter" named "STAGING_CONFIG" with:
   - Control Parameter: DEPLOYMENT_ENV
   - Condition: equals
   - Control Value: staging

2. Add another "Smart Parameter" named "PRODUCTION_APPROVER" with:
   - Control Parameter: DEPLOYMENT_ENV
   - Condition: equals
   - Control Value: prod

#### Advanced Example

For a more complex scenario, let's say you want to show a database configuration parameter only when:
- The deployment environment is "prod" AND the region is "us-east"
- OR when the deployment type is "database-migration"

1. Add a "Smart Parameter (Multiple Conditions)" named "DB_CONFIG" with:
   - Logical Operator: OR
   - First condition:
      - Logical Operator: AND
      - Sub-condition 1:
         - Control Parameter: DEPLOYMENT_ENV
         - Condition: equals
         - Control Value: prod
      - Sub-condition 2:
         - Control Parameter: REGION
         - Condition: equals
         - Control Value: us-east
   - Second condition:
      - Control Parameter: DEPLOYMENT_TYPE
      - Condition: equals
      - Control Value: database-migration

#### Wrapper Example

To control multiple existing parameters with a single condition:

1. Add a "Smart Wrapper Parameter" with:
   - Control Parameter: ADVANCED_MODE
   - Condition: equals
   - Control Value: true
   - Referenced Parameters: CACHE_TTL,RETRY_COUNT,TIMEOUT_SECONDS

This will show or hide the CACHE_TTL, RETRY_COUNT, and TIMEOUT_SECONDS parameters when ADVANCED_MODE is set to "true".

## How It Works

The plugin adds JavaScript to your Jenkins build forms that:
1. Monitors changes to parameter values
2. Evaluates conditions for each smart parameter and wrapper
3. Updates the visibility of parameters in real-time

## Condition Types

- **equals**: The control parameter value must exactly match the control value
- **notEquals**: The control parameter value must not match the control value
- **contains**: The control parameter value must contain the control value as a substring
- **startsWith**: The control parameter value must start with the control value
- **endsWith**: The control parameter value must end with the control value
- **regex**: The control parameter value must match the regular expression pattern in the control value

## Building and Testing

To build and test the plugin locally:

```bash
# Run a local Jenkins instance with the plugin
mvn hpi:run -Dport=5000

# Build the plugin package
mvn clean package
```

The generated `.hpi` file can be found in the `target/` directory.

## Issues

Please report issues and enhancement requests in the [Jenkins issue tracker](https://issues.jenkins.io/).

## Contributing

Contributions are welcome! Please refer to our [contribution guidelines](https://github.com/jenkinsci/.github/blob/master/CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.