# Smart Parameter Plugin for Jenkins

[![Jenkins Plugin](https://img.shields.io/jenkins/plugin/v/smart-parameter.svg)](https://plugins.jenkins.io/smart-parameter/)
[![Jenkins Plugin Installs](https://img.shields.io/jenkins/plugin/i/smart-parameter.svg?color=blue)](https://plugins.jenkins.io/smart-parameter/)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Introduction

Smart Parameter is a Jenkins plugin that enables conditional parameters in your build forms. It dynamically shows or hides input fields based on the values of other parameters, creating cleaner, more intuitive build forms that adapt to user selections.

This plugin is perfect for complex build pipelines where parameter choices determine which additional options are relevant.

## Features

- **Conditional Visibility**: Show or hide parameters based on the values of other parameters
- **Multiple Condition Types**: Support for equals, not equals, contains, starts with, and ends with conditions
- **Simple Configuration**: Easy to set up in your job's parameter definitions
- **Real-time Updates**: Parameters update immediately when controlling values change

## Installation

1. Go to **Manage Jenkins** > **Manage Plugins** > **Available** tab
2. Search for "Smart Parameter"
3. Check the box next to "Smart Parameter Plugin" and click "Install without restart"

## Usage

### Adding a Smart Parameter to a Job

1. In your Jenkins job configuration, go to the "This project is parameterized" section
2. Click "Add Parameter" and select "Smart Parameter"
3. Fill in the required fields:
   - **Name**: A unique identifier for the parameter
   - **Default Value**: The default value for the parameter
   - **Description**: A helpful description of the parameter
4. Configure the conditional visibility section:
   - **Control Parameter**: The name of another parameter that controls visibility
   - **Condition**: Select one of: equals, not equals, contains, starts with, ends with
   - **Control Value**: The value to compare against

### Example Configuration

Let's say you have a job with a "DEPLOYMENT_ENV" choice parameter with values "dev", "staging", and "prod". You might want to add additional parameters that are only relevant for specific environments:

1. Add a "Smart Parameter" named "STAGING_CONFIG" with:
   - Control Parameter: DEPLOYMENT_ENV
   - Condition: equals
   - Control Value: staging

2. Add another "Smart Parameter" named "PRODUCTION_APPROVER" with:
   - Control Parameter: DEPLOYMENT_ENV
   - Condition: equals
   - Control Value: prod

With this configuration, the "STAGING_CONFIG" parameter will only be visible when "DEPLOYMENT_ENV" is set to "staging", and "PRODUCTION_APPROVER" will only be visible when "DEPLOYMENT_ENV" is set to "prod".

## How It Works

The plugin adds JavaScript to your Jenkins build forms that:
1. Monitors changes to parameter values
2. Evaluates conditions for each smart parameter
3. Updates the visibility of parameters in real-time

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
