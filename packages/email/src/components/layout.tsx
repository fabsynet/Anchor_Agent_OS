import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const navy = '#0f172a';
const white = '#ffffff';
const gray = '#64748b';
const lightGray = '#f8fafc';

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>Anchor</Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>{children}</Section>

          {/* Footer */}
          <Hr style={dividerStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Anchor - Insurance Agent OS
            </Text>
            <Text style={footerSubtextStyle}>
              Your agency, running on autopilot.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: lightGray,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '580px',
  margin: '0 auto',
  backgroundColor: white,
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: navy,
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const logoStyle: React.CSSProperties = {
  color: white,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '32px',
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0 32px',
};

const footerStyle: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footerTextStyle: React.CSSProperties = {
  color: gray,
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 4px 0',
};

const footerSubtextStyle: React.CSSProperties = {
  color: gray,
  fontSize: '12px',
  margin: 0,
};
