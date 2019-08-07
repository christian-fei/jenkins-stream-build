[![Build Status](https://travis-ci.org/christian-fei/jenkins-stream-build.svg?branch=master)](https://travis-ci.org/christian-fei/jenkins-stream-build)

# jenkins-stream-build

stream the output of a jenkins build in your terminal

### options

#### --host (required)
the jenkins host (e.g. jenkins.example.com)

#### --job (required)
the job to stream (the job name in the jenkins UI, e.g. deploy, ci, etc.)


#### --username (required)
same username as for accessing the Jenkins Web UI

#### --password (required)
same password as for accessing the Jenkins Web UI

#### --build (optional)
the build number (defaults to 'lastBuild') (number of the build to stream)


### example

```
npx jenkins-stream-build --host jenkins.example.com --job example-job --username test --password pass
```