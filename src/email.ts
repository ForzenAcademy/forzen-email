import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs from 'fs';
import path from 'path';

export interface MailProperties {
  senderAddress: string;
  mailService: string;
  password: string;
}

export class Mailer {
  private static properties: MailProperties | undefined = undefined;

  private static verifyProperties() {
    if (!Mailer.properties) {
      const configFile: string = path.join(process.cwd(), 'mailer.json');
      try {
        if (fs.existsSync(configFile)) {
          const configFileContents: string = fs.readFileSync(configFile, 'utf8');
          const config: MailProperties = JSON.parse(configFileContents);
          Mailer.properties = config;
        } else {
          console.log(
            'forzen-email: Properties not found! Please provide mailer.json in your project directory.',
          );
        }
      } catch (error) {
        console.error('forzen-email: An error occurred while reading your configuration', error);
      }
    }
  }

  private static buildTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    const service = Mailer.properties!.mailService;
    const auth = {
      user: Mailer.properties!.senderAddress,
      pass: Mailer.properties!.password,
    };
    return nodemailer.createTransport({ service, auth });
  }

  private static buildOptions(
    recipients: string | string[],
    subject: string,
    message: string,
    useHtml: boolean,
  ): Mail.Options {
    return {
      from: Mailer.properties!.senderAddress,
      to: recipients,
      subject: subject,
      text: useHtml ? undefined : message,
      html: useHtml ? message : undefined,
    };
  }

  /**
   * Sends email to recipients
   */
  static async sendEmail(
    recipients: string | string[],
    subject: string,
    message: string,
    useHtml: boolean = true,
  ): Promise<boolean> {
    Mailer.verifyProperties();
    const options = Mailer.buildOptions(recipients, subject, message, useHtml);
    const transporter = Mailer.buildTransporter();
    try {
      await transporter.sendMail(options);
      return true;
    } catch (error) {
      console.error(`forzen-email: Error when sending an email to ${recipients}:\n`, error);
    }
    return false;
  }

  /**
   * Manually override the email properties
   *
   * @param mailProperties The email properties to set for the Mailer
   */
  static setMailProperties(mailProperties: MailProperties) {
    Mailer.properties = mailProperties;
  }
}
