import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { Email, InboxConnectionConfig, Operation } from './indoxTypes';
import { Readable } from 'stream';

export class ForzenInbox {
  async initiate(
    connectionConfig: InboxConnectionConfig,
    processEmail: (email: Email) => Operation[],
  ): Promise<void> {
    const imap = this.connect(connectionConfig);
    const emailsToProcess = await this.fetch(imap);
    if (emailsToProcess.length > 0) {
      const operations = this.process(emailsToProcess, processEmail);
      this.operate(operations);
    }
    this.disconnect(imap);
  }

  private connect(connectionConfig: InboxConnectionConfig): Imap {
    const imapConfig: Imap.Config = {
      user: connectionConfig.user,
      password: connectionConfig.password,
      host: connectionConfig.host,
      port: connectionConfig.port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    };

    return new Imap(imapConfig);
  }

  private async fetch(imap: Imap): Promise<Email[]> {
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err) => {
          if (err) {
            reject(err);
            return;
          }
          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              reject(err);
              return;
            }
            if (results.length === 0) {
              console.log('No unread messages found.');
              resolve([]);
              return;
            }

            const fetchOptions = { bodies: [''], struct: true };
            const f = imap.fetch(results, fetchOptions);
            const emailProcessingPromises: Promise<Email | null>[] = [];

            f.on('message', (msg, seqno) => {
              const emailProcessed = new Promise<Email | null>((resolve, reject) => {
                const email: Email = {
                  id: seqno,
                  subject: undefined,
                  bodyText: undefined,
                  bodyHtml: undefined,
                  fromAddress: undefined,
                  fromName: undefined,
                };
                let bodiesLeft = fetchOptions.bodies.length;
                msg.on('body', (stream) => {
                  simpleParser(stream as Readable)
                    .then((mail) => {
                      if (mail) {
                        if (mail.subject) email.subject = mail.subject;
                        if (mail.text) email.bodyText = mail.text;
                        if (mail.html) email.bodyHtml = mail.html ? mail.html : undefined;
                        if (mail.from?.value) {
                          if (mail.from?.value.length > 0) {
                            email.fromAddress = mail.from?.value[0].address;
                            email.fromName = mail.from?.value[0].name;
                          }
                        }
                      }
                      bodiesLeft -= 1;
                      if (bodiesLeft == 0) {
                        resolve(email);
                      }
                    })
                    .catch((err) => {
                      reject(err);
                    });
                });
              });
              emailProcessingPromises.push(emailProcessed);
            });

            f.once('error', (err) => {
              reject(err);
            });

            f.once('end', () => {
              Promise.all(emailProcessingPromises)
                .then((emails) => {
                  resolve(emails.filter((email): email is Email => email != null));
                })
                .catch((err) => {
                  reject(err);
                });
            });
          });
        });
      });

      imap.once('error', (err: Error) => {
        reject(err);
      });

      imap.connect();
    });
  }

  private process(emails: Email[], processEmail: (email: Email) => Operation[]): Operation[] {
    return emails.flatMap((email) => processEmail(email));
  }

  private operate(operations: Operation[]) {
    operations.forEach((operation) => operation.execute());
  }

  private disconnect(imap: Imap) {
    imap.end();
  }
}
