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

export interface BulkAnnouncementEmailData {
  agencyName: string;
  subject: string;
  bodyHtml: string;
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
  bodyContent: {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '24px',
    whiteSpace: 'pre-wrap' as const,
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

export function BulkAnnouncementEmail({
  agencyName,
  subject,
  bodyHtml,
}: BulkAnnouncementEmailData) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>{agencyName}</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.bodyContent}>{bodyHtml}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Footer */}
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

export default BulkAnnouncementEmail;
