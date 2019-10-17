const test = require('ava')
const { buildUrl, jenkinsStreamBuild } = require('.')
const nock = require('nock')

test('returns url with username, password and start parameter', async t => {
  const host = 'jenkins.example.com'
  const job = 'test-job'
  const build = '666'
  const username = 'test'
  const password = 'pass'
  const start = 0

  const url = buildUrl({ host, job, build, username, password, start })
  t.is(url, 'https://test:pass@jenkins.example.com/job/test-job/666/logText/progressiveText?start=0')
})

test('encodes username and password correctly', async t => {
  const host = 'jenkins.example.com'
  const job = 'test-job'
  const build = '666'
  const username = 'test'
  const password = 'passwith!?ì2-!#43$£"'
  const start = 0

  const url = buildUrl({ host, job, build, username, password, start })
  t.is(url, 'https://test:passwith!%3F%C3%AC2-!%2343%24%C2%A3%22@jenkins.example.com/job/test-job/666/logText/progressiveText?start=0')
})

test('returns url with username, password and start parameter (paginated to 100)', async t => {
  const host = 'jenkins.example.com'
  const job = 'test-job'
  const build = '666'
  const username = 'test'
  const password = 'pass'
  const start = 100

  const url = buildUrl({ host, job, build, username, password, start })
  t.is(url, 'https://test:pass@jenkins.example.com/job/test-job/666/logText/progressiveText?start=100')
})

test('throws when missing username, password, host or job', async t => {
  const build = '666'
  const start = 100

  t.throws(() => buildUrl({ build, start }))
})

test('calls correct url based on parameters', async t => {
  const host = 'jenkins.example.com'
  const job = 'test-job'
  const build = '666'
  const username = 'test'
  const password = 'pass'
  const start = 0

  const request = nock(`https://${username}:${password}@${host}`)
    .get(`/job/${job}/${build}/logText/progressiveText?start=${start}`)
    .reply(200, '', {
      'x-more-data': 'false'
    })

  await jenkinsStreamBuild({ host, job, build, username, password })

  t.notThrows(() => request.done(), 'expected url was not called')
})

test('paginates build log', async t => {
  const host = 'jenkins.example.com'
  const job = 'test-job'
  const build = '666'
  const username = 'test'
  const password = 'pass'

  const request1 = nock(`https://${username}:${password}@${host}`)
    .get(`/job/${job}/${build}/logText/progressiveText?start=0`)
    .reply(200, 'hellohello', {
      'x-more-data': 'true',
      'x-text-size': 10
    })
  const request2 = nock(`https://${username}:${password}@${host}`)
    .get(`/job/${job}/${build}/logText/progressiveText?start=10`)
    .reply(200, '', {
      'x-more-data': 'false'
    })

  await jenkinsStreamBuild({ host, job, build, username, password })

  t.notThrows(() => request1.done(), 'expected url was not called')
  t.notThrows(() => request2.done(), 'expected url was not called')
})
