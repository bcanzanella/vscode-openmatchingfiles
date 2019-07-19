import { workspace, WorkspaceConfiguration } from "vscode";

export class Configuration {
  private workspaceconfiguration: WorkspaceConfiguration | undefined;

  get<T>(key: string): T {
    if (!this.workspaceconfiguration) {
      this.workspaceconfiguration = workspace.getConfiguration("omf");
    }

    return this.workspaceconfiguration.get(key) as T;
  }
}
