#!/usr/bin/env node

const got = require('got')
const yargs = require('yargs')

async function jenkinsStreamBuild ({ host, job, build = 'lastBuild', username, password, pollMs = 1000 }) {
  if (!host || !job || !username || !password || !build) {
    console.log(`
jenkins-stream-build

Missing parameters to run

Usage:
--host (required)
    the jenkins host (e.g. jenkins.example.com)
--job (required)
    the job to stream (the job name in the jenkins UI, e.g. deploy, ci, etc.)
--username (required)
    same username as for accessing the Jenkins Web UI
--password (required)
    same password as for accessing the Jenkins Web UI
--build (optional)
    the build number (defaults to 'lastBuild') (number of the build to stream)
`)
    return
  }
  let hasNext = false

  let start = 0
  do {
    const url = buildUrl({ host, job, build, username, password, start })
    const response = await got.get(url)
    start = response.headers['x-text-size']

    if (response.headers['x-more-data'] !== 'true') {
      hasNext = false
    }
    if (response.body.length > 0) {
      hasNext = true
      process.stdout.write(response.body || '')
    }
  } while (hasNext)
}

if (require.main === module) {
  const { host, job, build, username, password } = yargs.argv
  process.env.DEBUG && console.log(JSON.stringify({
    host,
    job,
    build,
    username,
    password
  }))
  process.env.DEBUG && console.log(JSON.stringify(yargs.argv))

  jenkinsStreamBuild({ host, job, build, username, password }).then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
} else {
  module.exports = {
    jenkinsStreamBuild,
    buildUrl
  }
}

function buildUrl ({ host, job, build = 'lastBuild', username, password, start }) {
  if (!host || !job || !username || !password) {
    let errorMessage = 'Missing parameters:'
    if (!host) errorMessage += '\nhost not defined'
    if (!job) errorMessage += '\njob not defined'
    if (!username) errorMessage += '\nusername not defined'
    if (!password) errorMessage += '\npassword not defined'
    throw new Error(errorMessage)
  }
  return `https://${username}:${password}@${host}/job/${job}/${build}/logText/progressiveText?start=${start}`
}
