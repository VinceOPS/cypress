import type { NxsMutationArgs } from 'nexus-decorators'
import { ProjectBase } from '../project-base'
import type { ServerContext } from './ServerContext'
import { AuthenticatedUser, BaseActions, Viewer } from '@packages/graphql'
import { RunGroup } from '@packages/graphql/src/entities/run'

// @ts-ignore
import user from '@packages/server/lib/user'

// @ts-ignore
import auth from '@packages/server/lib/gui/auth'

// @ts-ignore
import api from '@packages/server/lib/api'

// @ts-ignore
import browsers from '@packages/server/lib/browsers'

import { getId } from '@packages/server/lib/project_static'
import { FoundBrowser } from '@packages/launcher'

interface RecordKey {
  id: string
  createdAt: string
  lastUsedAt: string
}

/**
 *
 */
export class ServerActions extends BaseActions {
  constructor (protected ctx: ServerContext) {
    super(ctx)
  }

  installDependencies () {
    //
  }

  createProjectBase (input: NxsMutationArgs<'addProject'>['input']) {
    return new ProjectBase({
      projectRoot: input.projectRoot,
      testingType: 'component',
      options: {},
    })
  }

  async authenticate () {
    const config: AuthenticatedUser = await auth.start(() => {}, 'launchpad')
    const viewer = new Viewer(this.ctx, config)

    this.ctx.viewer = viewer
  }

  async logout () {
    await user.logOut()
    this.ctx.viewer = null
  }

  async getRuns ({ projectId, authToken }: { projectId: string, authToken: string }): Promise<RunGroup[]> {
    const runs = await api.getProjectRuns(projectId, authToken)

    return runs.map((run) => new RunGroup(run))
  }

  async getRecordKeys ({ projectId, authToken }: { projectId: string, authToken: string }): Promise<string[]> {
    const keys: RecordKey[] = await api.getProjectRecordKeys(projectId, authToken)

    return keys.map((x) => x.id)
  }

  async getProjectId (projectRoot: string) {
    const projectId: string = await getId(projectRoot)

    return projectId ?? null
  }

  getBrowsers (): Promise<FoundBrowser[]> {
    return browsers.get()
  }
}
