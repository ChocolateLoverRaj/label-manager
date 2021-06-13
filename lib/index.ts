/* eslint-disable no-extra-boolean-cast */
import { readFileSync } from 'jsonfile'
import never from 'never'
import { getOctokit } from '@actions/github'
import { getInput } from '@actions/core'
import Ajv from 'ajv'
import diff from 'arr-diff'

(async () => {
  const eventFile = process.env.GITHUB_EVENT_PATH ?? never('No GITHUB_EVENT_PATH')
  const octokit = getOctokit(process.env.GITHUB_TOKEN ?? never('No GITHUB_TOKEN'), { baseUrl: process.env.GITHUB_API_URL })
  const manage: string[] = JSON.parse(getInput('manage', { required: true }))
  const set: string[] = JSON.parse(getInput('set', { required: true }))
  const schema = { type: 'array', items: { type: 'string' } }
  const ajvManage = new Ajv()
  if (!ajvManage.validate(schema, manage)) {
    throw new Error(`Invalid manage input:\n${JSON.stringify(ajvManage.errors)}`)
  }
  const ajvSet = new Ajv()
  if (!ajvSet.validate(schema, set)) {
    throw new Error(`Invalid set input:\n${JSON.stringify(ajvSet.errors)}`)
  }
  const event = readFileSync(eventFile)
  if (event.pull_request === undefined) throw new Error('Only pull requests can be labeled so far.')
  const currentLabels = (event.pull_request.labels as Array<{ name: string}>)
    .map(({ name }) => name)
    .filter(name => manage.includes(name))
  const addLabels = diff(set, currentLabels)
  const removeLabels = diff(currentLabels, set)
  console.log(`Current labels: ${currentLabels.join(', ')}`)
  console.log(`Desired labels: ${set.join(', ')}`)
  if (!Boolean(addLabels.length + removeLabels.length)) {
    console.log('Labels up to date. No changes necessary.')
  } else {
    if (Boolean(addLabels.length)) console.log(`Adding labels: ${addLabels.join(', ')}.`)
    if (Boolean(removeLabels.length)) console.log(`Removing labels: ${removeLabels.join(', ')}.`)
    await Promise.all([
      octokit.rest.issues.addLabels({
        repo: event.repository.name,
        owner: event.repository.owner.login,
        issue_number: event.pull_request.number,
        labels: addLabels
      }),
      ...removeLabels.map(async name => await octokit.rest.issues.removeLabel({
        repo: event.repository.name,
        owner: event.repository.owner.login,
        issue_number: event.pull_request.number,
        name
      }))
    ])
    console.log('Done!')
  }
})()
  .catch(e => {
    console.error(e.message)
    process.exit(1)
  })
