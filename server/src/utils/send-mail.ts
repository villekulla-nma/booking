import * as nodemailer from 'nodemailer';

import { env } from './env';

type Mail = ReturnType<typeof nodemailer.createTransport>;

let transport: Mail;

const createTransport = (): Mail => {
  if (transport) {
    return transport;
  }

  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: env('SENDMAIL_BIN'),
  });
};

export const sendMail = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  await createTransport().sendMail({
    from: `no-reply@${env('APP_URL')}`,
    to,
    subject,
    text,
  });
};
