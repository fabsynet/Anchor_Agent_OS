import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from '@react-email/components';

export interface BirthdayEmailData {
  clientName: string;
  agencyName: string;
}

const ANCHOR_NAVY = '#1e3a5f';

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0' as const,
    padding: '0' as const,
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: ANCHOR_NAVY,
    padding: '24px 32px',
    borderRadius: '8px 8px 0 0',
  },
  headerText: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '0' as const,
  },
  content: {
    padding: '24px 32px',
  },
  greeting: {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '24px',
  },
  message: {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '24px',
    marginTop: '16px',
  },
  footer: {
    padding: '24px 32px',
    borderTop: '1px solid #eaeaea',
  },
  footerText: {
    fontSize: '12px',
    color: '#999999',
    lineHeight: '20px',
  },
  hr: {
    borderColor: '#eaeaea',
    margin: '24px 0',
  },
};

export function BirthdayGreetingEmail({
  clientName,
  agencyName,
}: BirthdayEmailData) {
  const previewText = `Happy Birthday, ${clientName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>Happy Birthday!</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>
              Dear {clientName},
            </Text>

            <Text style={styles.message}>
              Wishing you a wonderful birthday and a fantastic year ahead! We
              truly value you as a client and appreciate the trust you place in
              us.
            </Text>

            <Text style={styles.message}>
              If there is anything we can help you with regarding your insurance
              needs, please do not hesitate to reach out. We are always here for
              you.
            </Text>

            <Text style={styles.message}>
              Warm regards,
              <br />
              The {agencyName} Team
            </Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This email was sent by {agencyName} via Anchor.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default BirthdayGreetingEmail;
