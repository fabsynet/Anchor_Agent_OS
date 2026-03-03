import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components';

export interface CrossSellEmailData {
  agencyName: string;
  clientName: string;
  subject: string;
  bodyText: string;
  missingTypes: string[];
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
    marginBottom: '16px',
  },
  bodyContent: {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '24px',
    whiteSpace: 'pre-wrap' as const,
  },
  gapSection: {
    backgroundColor: '#f0f9ff',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
  },
  gapTitle: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: ANCHOR_NAVY,
    marginBottom: '8px',
  },
  gapList: {
    fontSize: '14px',
    color: '#333333',
    lineHeight: '22px',
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

export function CrossSellEmail({
  agencyName,
  clientName,
  subject,
  bodyText,
  missingTypes,
}: CrossSellEmailData) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.headerText}>{agencyName}</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {clientName},</Text>
            <Text style={styles.bodyContent}>{bodyText}</Text>

            {missingTypes.length > 0 && (
              <Section style={styles.gapSection}>
                <Text style={styles.gapTitle}>
                  Coverage areas to consider:
                </Text>
                <Text style={styles.gapList}>
                  {missingTypes
                    .map(
                      (t) =>
                        `\u2022 ${t.charAt(0).toUpperCase() + t.slice(1)} Insurance`,
                    )
                    .join('\n')}
                </Text>
              </Section>
            )}
          </Section>

          <Hr style={styles.hr} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is a service communication from {agencyName} via Anchor.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default CrossSellEmail;
