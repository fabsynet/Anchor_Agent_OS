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
  Link,
} from '@react-email/components';

export interface RenewalReminderEmailData {
  clientName: string;
  agencyName: string;
  policyType: string;
  policyNumber: string | null;
  expiryDate: string;
  daysRemaining: number;
  agentName: string | null;
  agentEmail: string | null;
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
  infoBox: {
    padding: '12px 16px',
    backgroundColor: '#fffff0',
    borderLeft: '4px solid #d69e2e',
    borderRadius: '4px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#666666',
    margin: '0 0 2px 0',
    textTransform: 'uppercase' as const,
  },
  infoValue: {
    fontSize: '14px',
    color: '#333333',
    margin: '0 0 8px 0',
  },
  infoValueLast: {
    fontSize: '14px',
    color: '#333333',
    margin: '0' as const,
  },
  agentSection: {
    fontSize: '14px',
    color: '#333333',
    lineHeight: '22px',
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

export function RenewalReminderEmail({
  clientName,
  agencyName,
  policyType,
  policyNumber,
  expiryDate,
  daysRemaining,
  agentName,
  agentEmail,
}: RenewalReminderEmailData) {
  const previewText = `Your ${policyType} policy expires in ${daysRemaining} days`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>Policy Renewal Reminder</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Dear {clientName},</Text>

            <Text style={styles.message}>
              This is a friendly reminder that one of your insurance policies is
              approaching its expiry date. Please review the details below and
              contact us to discuss your renewal options.
            </Text>

            {/* Policy Info Box */}
            <Section style={styles.infoBox}>
              <Text style={styles.infoLabel}>Policy Type</Text>
              <Text style={styles.infoValue}>{policyType}</Text>

              {policyNumber && (
                <>
                  <Text style={styles.infoLabel}>Policy Number</Text>
                  <Text style={styles.infoValue}>{policyNumber}</Text>
                </>
              )}

              <Text style={styles.infoLabel}>Expiry Date</Text>
              <Text style={styles.infoValue}>{expiryDate}</Text>

              <Text style={styles.infoLabel}>Days Remaining</Text>
              <Text style={styles.infoValueLast}>
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </Text>
            </Section>

            <Text style={styles.message}>
              We recommend reaching out as soon as possible to ensure
              uninterrupted coverage. Our team is ready to help you find the best
              options for your needs.
            </Text>

            {/* Agent Contact */}
            {agentName && (
              <Text style={styles.agentSection}>
                Your agent, <strong>{agentName}</strong>, is available to help.
                {agentEmail && (
                  <>
                    {' '}
                    You can reach them at{' '}
                    <Link
                      href={`mailto:${agentEmail}`}
                      style={{ color: ANCHOR_NAVY }}
                    >
                      {agentEmail}
                    </Link>
                    .
                  </>
                )}
              </Text>
            )}
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is a service notification from {agencyName} via Anchor.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default RenewalReminderEmail;
