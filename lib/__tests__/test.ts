import testGhAction, { Label } from '../../test-lib/testGhAction'
import { join } from 'path'
import PullRequest from '../../test-lib/PullRequest'
import assignSame from '../../test-lib/assignSame'

const mainFilePath = join(__dirname, '../../dist/index.js')

test('pull request', async () => {
  const labels: Label[] = [{ name: 'enhancement' }, { name: 'b' }, { name: 'c' }]
  const { stdout } = await testGhAction(mainFilePath, {
    event: {
      number: 1
    },
    repo: {
      pullRequests: {
        1: assignSame(new PullRequest(), { labels })
      },
      token: 'token'
    },
    env: {
      GITHUB_TOKEN: 'token'
    },
    inputs: {
      manage: JSON.stringify(['a', 'b', 'c']),
      set: JSON.stringify(['a', 'c'])
    }
  })
  expect(stdout).toMatchSnapshot()
  expect(labels.map(({ name }) => name).sort()).toEqual(['enhancement', 'a', 'c'].sort())
})
