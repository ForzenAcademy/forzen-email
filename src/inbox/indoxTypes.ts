export interface InboxConnectionConfig {
  user: string;
  password: string;
  host: string;
  port: number;
}

export interface Email {
  id: number;
  subject: string | undefined;
  bodyText: string | undefined;
  bodyHtml: string | undefined;
  fromAddress: string | undefined;
  fromName: string | undefined;
}

export interface Operation {
  execute(): void;
}

export class DeleteOperation implements Operation {
  private id: number;
  constructor(id: number) {
    this.id = id;
  }
  execute(): void {}
}
