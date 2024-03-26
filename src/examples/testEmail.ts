// import Imap from 'imap';
// import { simpleParser } from 'mailparser';

// interface EmailToDelete {
//   uid: number;
//   shouldDelete: boolean;
// }

// const imapConfig: Imap.Config = {
//   user: 'CoinTrackerAlerts@gmail.com',
//   password: 'lnqd ssje ccwr aupx',
//   host: 'imap.gmail.com',
//   port: 993,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// };

// const imap = new Imap(imapConfig);

// imap.once('ready', () => {
//   console.log('Connection successful');
//   imap.openBox('INBOX', false, (err, box) => {
//     if (err) throw err;

//     imap.search(['UNSEEN'], function (err, results) {
//       if (err) throw err;

//       console.log('Results count: ' + results.length);

//       if (results.length > 0) {
//         const fetchOptions = {
//           bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
//           struct: true,
//         };
//         const f = imap.fetch(results, fetchOptions);
//         const emailProcessingPromises: Promise<EmailToDelete>[] = [];
//         f.on('message', (msg, seqno) => {
//           const emailProcessed: Promise<EmailToDelete> = new Promise((resolve) => {
//             console.log(`Message ${seqno}`);
//             msg.on('body', (stream) => {
//               simpleParser(stream as any)
//                 .then((mail) => {
//                   if (mail && mail.subject) {
//                     let shouldDelete = false;
//                     console.log(`Mail subject: ${mail.subject}`);
//                     if (mail.subject === 'FOOBAR') {
//                       shouldDelete = true;
//                     }
//                     resolve({ uid: seqno, shouldDelete });
//                   }
//                 })
//                 .catch((err) => {
//                   console.error('Error parsing mail:', err);
//                 });
//             });
//           });
//           emailProcessingPromises.push(emailProcessed);
//         });
//         f.once('error', (err) => console.error('Fetch error: ' + err));
//         f.once('end', () => {
//           Promise.all(emailProcessingPromises).then((emails) => {
//             const emailsToDelete = emails
//               .filter((email) => email.shouldDelete)
//               .map((email) => email.uid);
//             if (emailsToDelete.length > 0) {
//               deleteEmails(imap, emailsToDelete);
//             } else {
//               console.log('No emails with "FOO BAR" in the subject found to delete.');
//               imap.end();
//             }
//           });
//         });
//       } else {
//         console.log('No unread messages found.');
//         imap.end();
//       }
//     });
//   });
// });

// imap.once('error', (err: Error) => console.error('Connection error: ' + err));
// imap.once('end', () => console.log('Connection ended'));

// imap.connect();

// function deleteEmails(imap: Imap, emailsToDelete: number[]): void {
//   imap.addFlags(emailsToDelete, '\\Deleted', function (err) {
//     // Use \\Seen to mark as read
//     if (err) {
//       console.error('Error marking emails for deletion:', err);
//       return;
//     }

//     imap.expunge(emailsToDelete, (err) => {
//       if (err) {
//         console.error('Error expunging emails:', err);
//         return;
//       }
//       console.log('Email(s) deleted successfully.');
//       imap.end();
//     });
//   });
// }

import { Mailer } from '../email';
import { ForzenInbox } from '../inbox/inbox';
import { Email } from '../inbox/indoxTypes';

Mailer.setMailProperties({
  senderAddress: 'CoinTrackerAlerts@gmail.com',
  mailService: 'gmail',
  password: 'lnqd ssje ccwr aupx',
});

const connection = {
  user: 'CoinTrackerAlerts@gmail.com',
  password: 'lnqd ssje ccwr aupx',
  host: 'imap.gmail.com',
  port: 993,
};

const inbox = new ForzenInbox();
inbox.initiate(connection, (email: Email) => {
  return [
    {
      execute: () => {
        if (email.subject == 'Springer') {
          if (email.fromAddress) {
            Mailer.sendEmail(email.fromAddress, 'RE: Springer', 'Jerry! Jerry!');
          }
        }
      },
    },
  ];
});
