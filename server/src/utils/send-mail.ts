import sgMail from '@sendgrid/mail';

import { env } from './env';

interface Mail {
  subject: string;
  text: string;
  to: string;
}

let apiKeySet = false;
const setApiKey = (apiKey: string): void => {
  if (apiKeySet) {
    return;
  }

  sgMail.setApiKey(apiKey);
  apiKeySet = true;
};

export const sendMail = async (mail: Mail): Promise<void> => {
  const senderEmailAddress = env('SENDER_EMAIL_ADDRESS');
  const sendgridApiKey = env('SENDGRID_API_KEY');

  setApiKey(sendgridApiKey);

  await sgMail.send({
    ...mail,
    from: senderEmailAddress,
  });
};
